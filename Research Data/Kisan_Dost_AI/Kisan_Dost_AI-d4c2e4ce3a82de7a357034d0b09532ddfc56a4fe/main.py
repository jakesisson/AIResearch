import os
import json
from typing import List, TypedDict, Literal
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
import soundfile as sf
import whisper
import tempfile
import traceback

# --- DEFERRED IMPORT FOR LLM ---
# from langchain_community.chat_models import ChatOllama

# --- Import Tools and Prompts ---
from prompts import (
    AGRONOMIST_PERSONA, PROBLEM_SOLVER_PERSONA,
    PERSONA_ROUTER_PROMPT, QUERY_ROUTER_PROMPT,
    MEMORY_CONSOLIDATION_PROMPT
)
from tools.disease_diagnosis import get_image_diagnosis
from tools.knowledge_base import knowledge_base_search_tool
from tools.crop_recommender import get_crop_recommender_tool
from tools.soil_health_advisor import get_soil_health_advisor_tool
from tools.fertilizer_recommender import get_fertilizer_recommender_tool
from tools.long_term_memory import retrieve_relevant_memories_tool # Will be filtered out
from tools.ticket_system import create_support_ticket
import tickets
from translation import detect_language, translate_text, enrich_query

# --- Load Environment Variables ---
load_dotenv()

# --- Global variables for lazy loading ---
llm = None
agent_graph = None

def get_agent_graph():
    """
    Creates and returns the agent graph, initializing the LLM on the first call.
    This uses a lazy-loading pattern to speed up server startup.
    """
    global llm, agent_graph
    if agent_graph:
        return agent_graph

    # --- DEFERRED IMPORT AND INITIALIZATION ---
    # Use Azure OpenAI if configured, otherwise fall back to Ollama
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    
    if azure_endpoint and azure_api_key:
        from langchain_openai import ChatOpenAI
        azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
        azure_deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or "gpt-4.1"
        print("Initializing Azure OpenAI LLM...", flush=True)
        llm = ChatOpenAI(
            azure_endpoint=azure_endpoint,
            azure_deployment=azure_deployment,
            api_version=azure_api_version,
            api_key=azure_api_key,
            temperature=0,
        )
        print("Azure OpenAI LLM initialized.", flush=True)
    else:
        from langchain_ollama import ChatOllama
        print("Initializing Ollama LLM (qwen3:4b)...", flush=True)
        llm = ChatOllama(model="qwen3:4b", temperature=0)
        print("Ollama LLM initialized.", flush=True)

    # --- Tool Integration ---
    # Filter out disabled tools (like the memory tool)
    all_tools = [
        t for t in [
            # retrieve_relevant_memories_tool, # DISABLED
            knowledge_base_search_tool,
            get_crop_recommender_tool(llm),
            get_soil_health_advisor_tool(llm),
            get_fertilizer_recommender_tool(llm),
            create_support_ticket,
        ] if t is not None
    ]

    # --- Agent State Definition ---
    class AgentState(TypedDict):
        messages: List[BaseMessage]
        persona: str
        user_id: str
        # The route will determine which path to take
        query_route: str

    # --- Graph Node Definitions ---

    def route_query_node(state: AgentState):
        """Routes the query to either the general conversational path or the specific agricultural path."""
        print("--- 0. ROUTING QUERY ---", flush=True)
        user_query = state["messages"][-1].content
        prompt = ChatPromptTemplate.from_template(QUERY_ROUTER_PROMPT)
        chain = prompt | llm
        route = chain.invoke({"query": user_query}).content.strip()
        print(f"Query route selected: {route}", flush=True)
        return {"query_route": route}

    def general_response_node(state: AgentState):
        """Generates a direct, conversational response for general queries."""
        print("--- GENERAL RESPONSE ---", flush=True)
        user_query = state["messages"][-1].content
        # This prompt now establishes the correct identity and has the strict no-thinking rule.
        system_prompt = """\
You are 'Kisan Dost', a friendly and helpful AI assistant for farmers.
CRITICAL RULE: You MUST NOT include your reasoning, internal monologue, or thoughts in your final response. Only provide the clean, direct answer to the user. Do not use tags like <think> or <thought>.\
"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{query}")
        ])
        chain = prompt | llm
        response_message = chain.invoke({"query": user_query})
        return {"messages": [response_message]}

    def determine_persona_node(state: AgentState):
        print("--- 1. DETERMINING PERSONA ---", flush=True)
        user_query = state["messages"][-1].content
        prompt = ChatPromptTemplate.from_template(PERSONA_ROUTER_PROMPT)
        chain = prompt | llm
        persona = chain.invoke({"query": user_query}).content.strip()
        if "Agronomist" not in persona and "Problem-Solver" not in persona:
            persona = "Problem-Solver"
        print(f"Persona Selected: {persona}", flush=True)
        return {"persona": persona}

    def agent_node(state: AgentState):
        print(f"--- 2. AGENT STEP (Persona: {state['persona']}) ---", flush=True)
        system_prompt = AGRONOMIST_PERSONA if state["persona"] == "Agronomist" else PROBLEM_SOLVER_PERSONA

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
        ])

        llm_with_tools = llm.bind_tools(all_tools)
        chain = prompt | llm_with_tools
        response_message = chain.invoke({"messages": state['messages']})

        print(f"Agent Response: {response_message}", flush=True)
        return {"messages": [response_message]}

    def tool_node(state: AgentState):
        print("--- 3. TOOL EXECUTION ---", flush=True)
        tool_calls = state["messages"][-1].tool_calls
        tool_messages = []
        for tool_call in tool_calls:
            selected_tool = next((t for t in all_tools if t.name == tool_call["name"]), None)
            if not selected_tool:
                raise ValueError(f"Tool '{tool_call['name']}' not found.")
            result = selected_tool.invoke(tool_call["args"])
            tool_messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))
        return {"messages": tool_messages}

    def should_continue_agent(state: AgentState) -> Literal["tools", "__end__"]:
        print("--- 4. ROUTING (AGENT) ---", flush=True)
        if state["messages"][-1].tool_calls:
            print("Decision: Use tool.", flush=True)
            return "tools"
        print("Decision: End conversation.", flush=True)
        return "__end__"

    def should_route_to_specialist(state: AgentState) -> Literal["specialist_path", "general_path"]:
        """Decides whether to use the specialist agent or the general response node."""
        if state.get("query_route") == "specific_agricultural":
            return "specialist_path"
        return "general_path"

    # --- Graph Construction ---
    graph_builder = StateGraph(AgentState)
    graph_builder.add_node("route_query", route_query_node)
    graph_builder.add_node("general_response", general_response_node)
    graph_builder.add_node("determine_persona", determine_persona_node)
    graph_builder.add_node("agent", agent_node)
    graph_builder.add_node("tools", tool_node)

    # New Entry Point
    graph_builder.set_entry_point("route_query")

    # Conditional Routing
    graph_builder.add_conditional_edges(
        "route_query",
        should_route_to_specialist,
        {
            "specialist_path": "determine_persona",
            "general_path": "general_response",
        }
    )

    # Edges for the specialist path
    graph_builder.add_edge("determine_persona", "agent")
    graph_builder.add_conditional_edges("agent", should_continue_agent, {"tools": "tools", "__end__": END})
    graph_builder.add_edge("tools", "agent")

    # Edge for the general path
    graph_builder.add_edge("general_response", END)

    memory = MemorySaver()
    agent_graph = graph_builder.compile(checkpointer=memory)
    print("Agent graph compiled.", flush=True)
    return agent_graph

# --- Memory Consolidation ---
def consolidate_memories(user_id: str, conversation_history: List[BaseMessage]):
    # DISABLED as per user request
    return

# --- FastAPI Application ---
app = FastAPI(title="Kisan Dost AI API", description="API for the AI-Powered Personal Farming Assistant")

@app.on_event("startup")
async def startup_event():
    get_agent_graph()

@app.post("/chat")
async def chat(session_id: str = Form(...), query: str = Form(""), file: UploadFile = File(None)):
    try:
        user_id = session_id
        config = {"configurable": {"thread_id": user_id}}
        augmented_query = query

        if file:
            print(f"--- Received image file: {file.filename} ---")
            image_bytes = await file.read()
            diagnosis_result = get_image_diagnosis(image_bytes)

            if "UNCLEAR" in diagnosis_result:
                return JSONResponse(status_code=400, content={"error": "It seems that the image is not a plant or is unclear. Please send a clearer plant image."})
            if "Error:" in diagnosis_result:
                return JSONResponse(status_code=500, content={"error": diagnosis_result})

            image_analysis_prompt = f"The user has uploaded an image. Here is the analysis:\n\n{diagnosis_result}"
            augmented_query = f"{query}\n\n{image_analysis_prompt}" if query else image_analysis_prompt

        if not augmented_query:
            return JSONResponse(status_code=400, content={"error": "Please provide a query or an image."})

        original_lang = detect_language(augmented_query)
        print(f"Detected language: {original_lang}", flush=True)

        lang_map = {"ml": "Malayalam"}
        source_lang_name = lang_map.get(original_lang, "English")

        if original_lang != 'en':
            print("Translating to English...", flush=True)
            # Get LLM instance for translation
            translation_llm = llm if llm else get_llm() if 'get_llm' in dir() else None
            if not translation_llm:
                from translation import get_llm
                translation_llm = get_llm()
            processed_query = translate_text(translation_llm, augmented_query, target_language="English", source_language=source_lang_name)
        else:
            processed_query = augmented_query

        # Enrichment is now part of the specialist agent path, not done upfront.
        user_message = HumanMessage(content=processed_query.strip())
        print("Invoking agent graph...", flush=True)

        graph = get_agent_graph()
        # The initial state requires all keys to be present.
        initial_state = {
            "messages": [user_message],
            "user_id": user_id,
            "persona": "",
            "query_route": ""
        }
        response = graph.invoke(initial_state, config=config)
        print("Agent graph finished.", flush=True)

        final_history = response.get("messages", [])
        if final_history:
            # Memory consolidation is disabled.
            pass

        english_response = final_history[-1].content
        final_response = english_response

        if original_lang != 'en':
            print(f"Translating final answer back to '{original_lang}'...", flush=True)
            target_lang_name = lang_map.get(original_lang, original_lang)
            # Get LLM instance for translation
            translation_llm = llm if llm else get_llm() if 'get_llm' in dir() else None
            if not translation_llm:
                from translation import get_llm
                translation_llm = get_llm()
            final_response = translate_text(translation_llm, english_response, target_language=target_lang_name, source_language="English")

        return {"response": final_response}

    except Exception as e:
        print("--- AN ERROR OCCURRED IN /chat ---", flush=True)
        print(traceback.format_exc(), flush=True)
        return JSONResponse(status_code=500, content={"error": "An unexpected server error occurred."})

# --- Static Page Serving ---
@app.get("/", response_class=HTMLResponse)
async def get_index_page():
    with open("index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/admin", response_class=HTMLResponse)
async def get_admin_page():
    with open("admin.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/tickets")
async def get_tickets_endpoint():
    return {"tickets": tickets.get_all_tickets()}

# --- Voice Processing ---
from piper.voice import PiperVoice

print("--- Loading Voice Models ---")
whisper_model = whisper.load_model("base")
print("Whisper model loaded.")

piper_model_path = "piper_models/en_US-lessac-medium.onnx"
piper_voice = None
if os.path.exists(piper_model_path):
    try:
        piper_voice = PiperVoice.from_onnx(piper_model_path)
        print("Piper TTS model loaded.")
    except Exception as e:
        print(f"Error loading Piper TTS model: {e}. The /synthesize endpoint will not work.")
else:
    print(f"Warning: Piper TTS model not found at {piper_model_path}. The /synthesize endpoint will not work.")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    print("--- Received request for /transcribe ---")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            sf.write(tmp, *sf.read(file.file))
            tmp_path = tmp.name
        print(f"Audio saved to temporary file: {tmp_path}")
        result = whisper_model.transcribe(tmp_path, fp16=False)
        os.unlink(tmp_path)
        print(f"Transcription result: {result['text']}")
        return {"text": result["text"]}
    except Exception as e:
        print(f"Error during transcription: {e}")
        return {"error": str(e)}, 500

class SynthesizeRequest(BaseModel):
    text: str

@app.post("/synthesize")
async def synthesize_speech(request: SynthesizeRequest):
    print("--- Received request for /synthesize ---")
    if not piper_voice:
        return JSONResponse(status_code=503, content={"error": "TTS model is not loaded. Please check the server setup."})
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            wav_path = tmp_file.name
            piper_voice.synthesize(request.text, tmp_file)
            print(f"Speech synthesized to temporary file: {wav_path}")
            return FileResponse(path=wav_path, media_type="audio/wav", filename="response.wav")
    except Exception as e:
        print(f"Error during speech synthesis: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
async def health_check():
    return {"status": "ok"}
