import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessageChunk
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.prebuilt import create_react_agent

from .prompt import VENDEDOR_PROMPT
from .tools import tools

load_dotenv()


class Agent:
    def __init__(self):
        # Use Azure OpenAI if configured, otherwise standard OpenAI
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
        
        if azure_endpoint and azure_api_key:
            self.model = ChatOpenAI(
                azure_endpoint=azure_endpoint,
                azure_deployment=os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
                api_key=azure_api_key,
                temperature=float(os.getenv("TEMPERATURE", "0.7")),
                max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
            )
        else:
            # Fallback to standard OpenAI API
            self.model = ChatOpenAI(
                model=os.getenv("OPENAI_MODEL_NAME", "gpt-4-turbo"),
                api_key=os.getenv("OPENAI_API_KEY"),
                temperature=float(os.getenv("TEMPERATURE", "0.7")),
                max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
            )
        self.tools = tools
        self.prompt = VENDEDOR_PROMPT
        self.db_path = "chat_memory.db"

    async def stream_message(self, user_message: str, thread_id: str):
        """Envia mensagem e faz streaming da resposta"""
        async with AsyncSqliteSaver.from_conn_string(self.db_path) as checkpointer:
            agent_executable = create_react_agent(
                model=self.model,
                tools=self.tools,
                checkpointer=checkpointer,
                prompt=self.prompt,
            )
            config = {"configurable": {"thread_id": thread_id}}
            try:
                async for chunk, metadata in agent_executable.astream(
                    {"messages": [("human", user_message)]},
                    config,
                    stream_mode="messages",
                ):
                    if isinstance(chunk, AIMessageChunk) and chunk.content:
                        yield {"type": "content", "data": chunk.content}
            except Exception as e:
                print(f"Error during agent stream: {e}")
                yield {"type": "error", "data": f"Error processing message: {str(e)}"}
