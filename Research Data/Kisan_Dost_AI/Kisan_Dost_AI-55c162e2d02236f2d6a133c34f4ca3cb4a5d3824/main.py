import os
from typing import List, TypedDict
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from fastapi import FastAPI, Form
from pydantic import BaseModel
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
import tempfile
import traceback

# --- DEFERRED IMPORT FOR LLM ---
# from langchain_community.chat_models import ChatOllama

# --- Import Tools and Prompts ---
import tickets
# --- Load Environment Variables ---
load_dotenv()

# --- Global variables for lazy loading ---
llm = None
agent_graph = None

def get_agent_graph():
    """
    Creates and returns a simplified agent graph.
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

    # --- Agent State Definition ---
    class AgentState(TypedDict):
        messages: List[BaseMessage]
        user_id: str

    # --- Graph Node Definition ---
    def chatbot_node(state: AgentState):
        """Generates a direct, conversational response."""
        print("--- SIMPLE CHATBOT ---", flush=True)
        user_query = state["messages"][-1].content
        system_prompt = "You are 'Kisan Dost', a friendly and helpful AI assistant for farmers."
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
        ])
        chain = prompt | llm
        response_message = chain.invoke({"messages": state['messages']})
        return {"messages": [response_message]}

    # --- Graph Construction ---
    graph_builder = StateGraph(AgentState)
    graph_builder.add_node("chatbot", chatbot_node)
    graph_builder.set_entry_point("chatbot")
    graph_builder.add_edge("chatbot", END)

    memory = MemorySaver()
    agent_graph = graph_builder.compile(checkpointer=memory)
    print("Agent graph compiled.", flush=True)
    return agent_graph

# --- FastAPI Application ---
app = FastAPI(title="Kisan Dost AI API", description="API for the AI-Powered Personal Farming Assistant")

@app.on_event("startup")
async def startup_event():
    get_agent_graph()

@app.post("/chat")
async def chat(session_id: str = Form(...), query: str = Form(...)):
    try:
        user_id = session_id
        config = {"configurable": {"thread_id": user_id}}

        if not query:
            return JSONResponse(status_code=400, content={"error": "Please provide a query."})

        user_message = HumanMessage(content=query.strip())
        print("Invoking agent graph...", flush=True)

        graph = get_agent_graph()
        # The initial state requires all keys to be present.
        initial_state = {
            "messages": [user_message],
            "user_id": user_id
        }
        response = graph.invoke(initial_state, config=config)
        print("Agent graph finished.", flush=True)

        final_history = response.get("messages", [])
        final_response = final_history[-1].content if final_history else ""

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
