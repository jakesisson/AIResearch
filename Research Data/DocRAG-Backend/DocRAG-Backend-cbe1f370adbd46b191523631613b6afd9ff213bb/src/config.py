from dotenv import load_dotenv
import os
from typing import Dict
from enum import Enum

class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"

class Settings:
    def __init__(self):
        load_dotenv(override=True, dotenv_path="../.env")
        
        # API Keys
        self.openai_api_key: str = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY")
        
        # Azure OpenAI Configuration
        self.azure_openai_api_key: str = os.getenv("AZURE_OPENAI_API_KEY")
        self.azure_openai_endpoint: str = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.azure_openai_api_version: str = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
        self.azure_openai_deployment: str = os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1")
        self.model_id: str = os.getenv("MODEL_ID", "gpt-4.1")
        
        # Model defaults - Use Azure OpenAI if configured, otherwise Anthropic
        if self.azure_openai_endpoint and self.azure_openai_api_key:
            self.default_provider: LLMProvider = LLMProvider.OPENAI
        else:
            self.default_provider: LLMProvider = LLMProvider.ANTHROPIC
        self.anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
        self.openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        self.temperature: float = float(os.getenv("TEMPERATURE", "0.7"))
        
        # Vector store settings
        self.vector_store_path: str = os.getenv("VECTOR_STORE_PATH", "vector_store")
        
        # Crawler settings
        self.max_depth: int = int(os.getenv("MAX_DEPTH", "2"))
        self.backlink_threshold: float = float(os.getenv("BACKLINK_THRESHOLD", "0.3"))
        
        # Chunking settings
        self.chunk_size: int = int(os.getenv("CHUNK_SIZE", "1000"))
        self.chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "200"))
        
        self.validate()
    
    def validate(self):
        """Validate required environment variables."""
        # Check for Azure OpenAI or standard OpenAI for embeddings
        if not self.azure_openai_api_key and not self.openai_api_key:
            raise ValueError("Either AZURE_OPENAI_API_KEY or OPENAI_API_KEY must be set for embeddings")
        # Anthropic is optional if Azure OpenAI is configured
        if self.default_provider == LLMProvider.ANTHROPIC and not self.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY must be set when using Anthropic as default provider")

settings = Settings()

def create_chat_openai(model: str = None, temperature: float = None, api_key: str = None):
    """
    Create ChatOpenAI instance with Azure OpenAI or standard OpenAI support.
    
    Args:
        model: Model name (optional, uses default if not provided)
        temperature: Temperature setting (optional, uses settings default if not provided)
        api_key: API key (optional, uses settings default if not provided)
    
    Returns:
        ChatOpenAI instance configured for Azure OpenAI or standard OpenAI
    """
    from langchain_openai import ChatOpenAI
    
    # Use Azure OpenAI if configured
    if settings.azure_openai_endpoint and settings.azure_openai_api_key:
        return ChatOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            azure_deployment=settings.azure_openai_deployment or settings.model_id,
            api_version=settings.azure_openai_api_version,
            api_key=api_key or settings.azure_openai_api_key,
            temperature=temperature if temperature is not None else settings.temperature,
        )
    else:
        # Use standard OpenAI API
        return ChatOpenAI(
            model=model or settings.openai_model,
            temperature=temperature if temperature is not None else settings.temperature,
            api_key=api_key or settings.openai_api_key
        ) 