import os
import sqlite3

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.prebuilt import create_react_agent

from .prompt import VENDEDOR_PROMPT
from .tools import tools

load_dotenv()


def create_agent():
    # Use Azure OpenAI if configured, otherwise standard OpenAI
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    
    if azure_endpoint and azure_api_key:
        model = ChatOpenAI(
            azure_endpoint=azure_endpoint,
            azure_deployment=os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
            api_key=azure_api_key,
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
            max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
        )
    else:
        # Fallback to standard OpenAI API
        model = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL_NAME", "gpt-4-turbo"),
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
            max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
        )

    # Memória SQLite (maneira correta)
    conn = sqlite3.connect("chat_memory.db", check_same_thread=False)
    memory = SqliteSaver(conn)

    # Agente React com memória e prompt detalhado
    agent = create_react_agent(
        model=model, tools=tools, checkpointer=memory, prompt=VENDEDOR_PROMPT
    )

    return agent


def send_message(message: str, user_id: str = "default") -> str:
    agent = create_agent()

    result = agent.invoke(
        {"messages": [{"role": "user", "content": message}]},
        config={"configurable": {"thread_id": user_id}},
    )

    return result["messages"][-1].content
