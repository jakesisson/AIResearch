"""Runtime configuration via Pydantic BaseSettings.

Loads values from environment (and optional .env) with typed fields.
"""
import os
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    """Typed configuration model sourced from environment variables."""
    # Model settings
    model_config = SettingsConfigDict(env_file=".env")

    OPENAI_API_KEY: str | None = Field(None, description="OpenAI API key (legacy, use Azure OpenAI)")
    
    # Azure OpenAI Configuration (standardized)
    AZURE_OPENAI_API_KEY: str | None = Field(None, description="Azure OpenAI API key", validation_alias="AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_ENDPOINT: str | None = Field(None, description="Azure OpenAI endpoint", validation_alias="AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_API_VERSION: str = Field("2025-01-01-preview", description="Azure OpenAI API version", validation_alias="AZURE_OPENAI_API_VERSION")
    AZURE_OPENAI_API_INSTANCE: str | None = Field(None, description="Azure OpenAI instance name", validation_alias="AZURE_OPENAI_API_INSTANCE")
    AZURE_OPENAI_API_DEPLOYMENT: str | None = Field(None, description="Azure OpenAI deployment name", validation_alias="AZURE_OPENAI_API_DEPLOYMENT")
    MODEL_ID: str = Field("gpt-4.1", description="Model ID", validation_alias="MODEL_ID")
    TEMPERATURE: float = Field(0.3, description="Temperature", validation_alias="TEMPERATURE")
    MAX_TOKENS: int = Field(1000, description="Max tokens", validation_alias="MAX_TOKENS")
    META_VERIFY_TOKEN: str | None = Field(None, description="Meta webhook verification token (optional for testing)")
    META_WHATSAPP_TOKEN: str | None = Field(None, description="Meta WhatsApp access token (optional for testing)")
    META_PHONE_NUMBER_ID: str | None = Field(None, description="Meta phone number ID (optional for testing)")
    META_APP_SECRET: str | None = Field(None, description="Meta app secret (optional for testing)")
    FACEBOOK_USER_AGENT: str | None = Field(None, description="Facebook user agent (optional for testing)")
    IN_META_SANDBOX_MODE: bool = Field(default=False)
    META_SANDBOX_PHONE_NUMBER: str = Field(default="11111111")
    MESSAGE_AGE_CUTOFF_IN_SECONDS: int = Field(default=3600)
    BASE_URL: str = Field(default="https://localhost", description="Base URL (optional for testing)")
    BT_SERVANT_LOG_LEVEL: str = Field(default="info")
    MAX_META_TEXT_LENGTH: int = Field(default=4096)
    # Max verses to include in get-translation-helps context to control token usage
    TRANSLATION_HELPS_VERSE_LIMIT: int = Field(default=10)
    # Max verses allowed for retrieve-scripture (prevents huge selections like an entire book)
    RETRIEVE_SCRIPTURE_VERSE_LIMIT: int = Field(default=120)
    # Max verses allowed for translate-scripture (avoid very large translations)
    TRANSLATE_SCRIPTURE_VERSE_LIMIT: int = Field(default=120)
    # Admin API token for protecting CRUD endpoints
    ADMIN_API_TOKEN: str | None = Field(default=None)
    # Dedicated token for health check authentication
    HEALTHCHECK_API_TOKEN: str | None = Field(default=None)
    # Enable admin auth for protected endpoints (default False for local/dev tests)
    ENABLE_ADMIN_AUTH: bool = Field(default=True)

    # Optional with default value
    DATA_DIR: Path = Field(default=Path("/data"))
    # Default OpenAI pricing JSON to enable cost accounting even without .env override
    OPENAI_PRICING_JSON: str = Field(
        default=(
            '{'
            '"gpt-4o": {"input_per_million": 2.5, '
            '"output_per_million": 10.0, "cached_input": 1.25}, '
            '"gpt-4o-transcribe": {"input_per_million": 2.5, '
            '"output_per_million": 10.0, '
            '"audio_input_per_million": 6.0}, '
            '"gpt-4o-mini-tts": {"input_per_million": 0.6, '
            '"audio_output_per_million": 12.0}'
            '}'
        )
    )


# Create a single instance to import elsewhere
# mypy cannot infer environment-based initialization for BaseSettings
config = Config()  # type: ignore[call-arg]

# Ensure utils.pricing (which reads from environment) can see a default when .env omits it
os.environ.setdefault("OPENAI_PRICING_JSON", config.OPENAI_PRICING_JSON)
# Surface OpenAI credentials for libraries that only check raw environment vars
# Use Azure OpenAI if available, otherwise fall back to OpenAI
if config.AZURE_OPENAI_API_KEY and config.AZURE_OPENAI_ENDPOINT:
    # For Azure OpenAI, we'll set the key for compatibility but the client will use Azure config
    os.environ.setdefault("OPENAI_API_KEY", config.AZURE_OPENAI_API_KEY or "")
elif config.OPENAI_API_KEY:
    os.environ.setdefault("OPENAI_API_KEY", config.OPENAI_API_KEY)
