"""OpenRouter LLM integration for cloud model access."""

import os
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI


def create_azure_openai_llm(
    model: str | None = None,
    api_key: str | None = None,
    temperature: float = 0.1,
    max_tokens: int | None = None,
) -> BaseChatModel:
    """Create an Azure OpenAI LLM instance.

    Args:
        model: Deployment name (defaults to MODEL_ID or AZURE_OPENAI_API_DEPLOYMENT)
        api_key: Azure OpenAI API key (defaults to AZURE_OPENAI_API_KEY env var)
        temperature: Sampling temperature (0.0-1.0)
        max_tokens: Maximum tokens to generate

    Returns:
        ChatOpenAI instance configured for Azure OpenAI
    """
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = api_key or os.getenv("AZURE_OPENAI_API_KEY")
    azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
    azure_deployment = model or os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1")

    if not azure_endpoint or not azure_api_key:
        raise ValueError(
            "Azure OpenAI requires AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables"
        )

    return ChatOpenAI(
        azure_endpoint=azure_endpoint,
        azure_deployment=azure_deployment,
        api_version=azure_api_version,
        api_key=azure_api_key,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def create_openrouter_llm(
    model: str = "openai/gpt-oss-120b",
    api_key: str | None = None,
    temperature: float = 0.1,
    max_tokens: int | None = None,
    provider: str | None = None,
    user_id: str | None = None,
) -> BaseChatModel:
    """Create an OpenRouter LLM instance.

    Args:
        model: Model identifier (e.g., "openai/gpt-oss-120b")
        api_key: OpenRouter API key
        temperature: Sampling temperature (0.0-1.0)
        max_tokens: Maximum tokens to generate
        provider: Specific provider to use (e.g., "Cerebras")
        user_id: User identifier for cache optimization (sticky routing)

    Returns:
        ChatOpenAI instance configured for OpenRouter
    """
    # OpenRouter requires these headers for app identification
    # Using default_headers (not model_kwargs) to ensure headers are sent
    # HTTP-Referer: Primary URL for app identification in OpenRouter rankings
    # X-Title: Display name in OpenRouter analytics
    # Note: favicon_url, main_url, description are configured in OpenRouter Dashboard
    default_headers = {
        "HTTP-Referer": "https://annotation.garden/hedit",
        "X-Title": "HEDit - HED Annotation Generator",
    }

    # Build extra_body for provider preference
    extra_body = {}
    if provider:
        extra_body["provider"] = {"only": [provider]}

    # Add user ID for sticky cache routing (reduces costs via prompt caching)
    if user_id:
        extra_body["user"] = user_id

    return ChatOpenAI(
        model=model,
        openai_api_key=api_key,
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=temperature,
        max_tokens=max_tokens,
        default_headers=default_headers,
        extra_body=extra_body if extra_body else None,
    )


def create_llm(
    model: str = "openai/gpt-oss-120b",
    api_key: str | None = None,
    temperature: float = 0.1,
    max_tokens: int | None = None,
    provider: str | None = None,
    user_id: str | None = None,
) -> BaseChatModel:
    """Create an LLM instance, preferring Azure OpenAI if configured.

    Args:
        model: Model identifier (for OpenRouter) or deployment name (for Azure OpenAI)
        api_key: API key (OpenRouter or Azure OpenAI)
        temperature: Sampling temperature (0.0-1.0)
        max_tokens: Maximum tokens to generate
        provider: Specific provider to use (e.g., "Cerebras") - only for OpenRouter
        user_id: User identifier for cache optimization (sticky routing) - only for OpenRouter

    Returns:
        ChatOpenAI instance configured for Azure OpenAI or OpenRouter
    """
    # Check for Azure OpenAI configuration first
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")

    if azure_endpoint and azure_api_key:
        # Use Azure OpenAI
        return create_azure_openai_llm(
            model=model,
            api_key=api_key or azure_api_key,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    else:
        # Fall back to OpenRouter
        return create_openrouter_llm(
            model=model,
            api_key=api_key,
            temperature=temperature,
            max_tokens=max_tokens,
            provider=provider,
            user_id=user_id,
        )


# Model configuration - using gpt-oss-120b via Cerebras (for OpenRouter)
# For Azure OpenAI, use MODEL_ID or AZURE_OPENAI_API_DEPLOYMENT
OPENROUTER_MODELS = {
    # Primary model for all agents (fast inference via Cerebras)
    "gpt-oss-120b": "openai/gpt-oss-120b",
}


def get_model_name(alias: str) -> str:
    """Get full model name from alias.

    Args:
        alias: Model alias (e.g., "gpt-oss-120b")

    Returns:
        Full model identifier for OpenRouter
    """
    return OPENROUTER_MODELS.get(alias, alias)
