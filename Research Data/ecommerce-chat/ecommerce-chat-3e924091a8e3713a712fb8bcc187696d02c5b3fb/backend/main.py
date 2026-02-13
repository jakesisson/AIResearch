import logging
from contextlib import asynccontextmanager
from pathlib import Path

from api.endpoints import chat
from api.schemas.health import HealthResponse
from chroma.client import chroma_client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services import Agent
from services.ingest import load_pdf_documents

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    # 🚀 STARTUP
    logger.info("🚀 Iniciando E-commerce Chat API...")

    try:
        # Verificar se há PDFs para carregar
        pdf_dir = "./pdfs"
        pdf_path = Path(pdf_dir)

        if pdf_path.exists() and list(pdf_path.glob("*.pdf")):
            logger.info("📄 Carregando documentos PDF...")
            load_pdf_documents(pdf_dir)

            # Verificar quantos chunks foram indexados
            collection = chroma_client.get_or_create_collection()
            total_chunks = collection.count()
            logger.info(f"✅ {total_chunks} chunks indexados com sucesso!")
        else:
            logger.warning("⚠️ Nenhum PDF encontrado em ./pdfs/")

    except Exception as e:
        logger.error(f"❌ Erro ao carregar documentos: {e}")
        # Não falhar a inicialização, apenas logar o erro

    agent_instance = Agent()
    app.state.agent = agent_instance

    logger.info("🎉 API inicializada com sucesso!")

    yield  # API está rodando

    # 🛑 SHUTDOWN
    logger.info("🛑 Finalizando E-commerce Chat API...")


app = FastAPI(
    title="E-commerce Chat API",
    description="API para chatbot de vendas conversacional",
    version="1.0.0",
    lifespan=lifespan,
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/chat", tags=["Chat"])


@app.get("/")
async def root():
    return {"message": "E-commerce Chat API is running!"}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
