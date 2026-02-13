import os
import uuid

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.prebuilt import create_react_agent

from .prompt import VENDEDOR_PROMPT
from .tools import tools

load_dotenv()


class Agent:
    def __init__(self, thread_id: str = None):
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
        self.db_path = "chat_memory.db"
        self.tools = tools
        self.prompt = VENDEDOR_PROMPT
        self.thread_id = thread_id or str(uuid.uuid4())

    async def send_message(self, user_message: str) -> str:
        """Envia mensagem e retorna resposta completa"""
        async with AsyncSqliteSaver.from_conn_string(self.db_path) as checkpointer:
            agent = create_react_agent(
                model=self.model,
                tools=self.tools,
                checkpointer=checkpointer,
                prompt=self.prompt,
            )

            config = {"configurable": {"thread_id": self.thread_id}}

            result = await agent.ainvoke(
                {"messages": [("human", user_message)]}, config
            )

            return result["messages"][-1].content

    async def stream_message(self, user_message: str):
        """Envia mensagem e faz streaming da resposta"""
        async with AsyncSqliteSaver.from_conn_string(self.db_path) as checkpointer:
            agent = create_react_agent(
                model=self.model,
                tools=self.tools,
                checkpointer=checkpointer,
                prompt=self.prompt,
            )

            config = {"configurable": {"thread_id": self.thread_id}}

            try:
                full_response = ""

                async for chunk, metadata in agent.astream(
                    {"messages": [("human", user_message)]},
                    config,
                    stream_mode="messages",
                ):
                    chunk_type = chunk.__class__.__name__
                    if chunk_type in ["AIMessageChunk", "AIMessage"]:
                        token_content = chunk.content
                        full_response += token_content

                        yield {"type": "content", "data": token_content}

                # completion message
                yield {"type": "complete", "data": full_response}
            except Exception as e:
                print(f"Error in streaming: {e}")
                yield {"type": "error", "data": f"Error processing message: {str(e)}"}

    @classmethod
    def build(cls, thread_id: str = None):
        """Factory method para criar instância (não precisa mais ser async!)"""
        return cls(thread_id=thread_id)
