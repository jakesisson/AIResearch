import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)


class Config:
    """Centralized configuration management for the application."""

    def __init__(self, env_file: str = ".env.local"):
        """Initialize configuration by loading environment variables.

        Args:
            env_file: Path to the environment file to load
        """
        load_dotenv(env_file)
        self.validate_environment()

    def validate_environment(self) -> None:
        """Validate that all required environment variables are present.

        Raises:
            ValueError: If any required environment variables are missing
        """
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
            "ALIBABA_DYSMS_ACCESS_KEY_ID",
            "ALIBABA_DYSMS_ACCESS_KEY_SECRET",
            # Azure OpenAI is now required (DASHSCOPE_API_KEY is optional for backward compatibility)
            "AZURE_OPENAI_API_KEY",
            "AZURE_OPENAI_ENDPOINT",
        ]

        missing_vars = []
        for var in required_vars:
            if not os.environ.get(var):
                missing_vars.append(var)

        if missing_vars:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing_vars)}"
            )

        logger.info("Environment validation successful")

    @property
    def supabase_url(self) -> str:
        """Get Supabase URL from environment."""
        return os.environ.get("SUPABASE_URL", "")

    @property
    def supabase_anon_key(self) -> str:
        """Get Supabase anonymous key from environment."""
        return os.environ.get("SUPABASE_ANON_KEY", "")

    @property
    def alibaba_access_key_id(self) -> str:
        """Get Alibaba SMS access key ID from environment."""
        return os.environ.get("ALIBABA_DYSMS_ACCESS_KEY_ID", "")

    @property
    def alibaba_access_key_secret(self) -> str:
        """Get Alibaba SMS access key secret from environment."""
        return os.environ.get("ALIBABA_DYSMS_ACCESS_KEY_SECRET", "")

    @property
    def sms_sign_name(self) -> str:
        """Get SMS signature name from environment."""
        return os.environ.get("SMS_SIGN_NAME", "速通互联验证码")

    @property
    def sms_template_code(self) -> str:
        """Get SMS template code from environment."""
        return os.environ.get("SMS_TEMPLATE_CODE", "100001")

    @property
    def sms_template_param(self) -> str:
        """Get SMS template parameters from environment."""
        return os.environ.get("SMS_TEMPLATE_PARAM", '{"code":"##code##","min":"5"}')

    @property
    def dashscope_api_key(self) -> str:
        """Get DashScope API key from environment (legacy, use Azure OpenAI)."""
        # For backward compatibility, return Azure OpenAI key if DashScope key not provided
        return os.environ.get("DASHSCOPE_API_KEY") or os.environ.get("AZURE_OPENAI_API_KEY", "")
    
    @property
    def azure_openai_api_key(self) -> str:
        """Get Azure OpenAI API key from environment."""
        return os.environ.get("AZURE_OPENAI_API_KEY", "")
    
    @property
    def azure_openai_endpoint(self) -> str:
        """Get Azure OpenAI endpoint from environment."""
        return os.environ.get("AZURE_OPENAI_ENDPOINT", "")
    
    @property
    def azure_openai_api_version(self) -> str:
        """Get Azure OpenAI API version from environment."""
        return os.environ.get("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
    
    @property
    def azure_openai_api_deployment(self) -> str:
        """Get Azure OpenAI deployment name from environment."""
        return os.environ.get("AZURE_OPENAI_API_DEPLOYMENT") or os.environ.get("MODEL_ID", "gpt-4.1")

    @property
    def debug(self) -> bool:
        """Get debug mode setting from environment."""
        return os.environ.get("DEBUG", "False").lower() == "true"

    @property
    def log_level(self) -> str:
        """Get logging level from environment."""
        return os.environ.get("LOG_LEVEL", "INFO")


def setup_logging(config: Config) -> None:
    """Configure application logging.

    Args:
        config: Configuration instance
    """
    log_level = getattr(logging, config.log_level.upper(), logging.INFO)
    logging.basicConfig(
        level=log_level, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
