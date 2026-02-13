import asyncio
from typing import Any, AsyncGenerator, Dict, List, Optional, Union, Type
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain_core.messages import AIMessage, BaseMessage

from app.config import settings
from app.domain.llm_providers.base import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):
    """OpenAI LLM provider implementation using LangChain."""

    def __init__(
        self,
        model_name: str = settings.OPENAI_MODEL_NAME,
        temperature: float = settings.OPENAI_TEMPERATURE,
        max_tokens: Optional[int] = settings.OPENAI_MAX_TOKENS,
        api_key: Optional[str] = settings.OPENAI_API_KEY,
        **kwargs,
    ):
        """
        Initialize the OpenAI provider.

        Args:
            model_name: The OpenAI model to use
            temperature: Temperature for response generation
            max_tokens: Maximum tokens in response
            api_key: OpenAI API key
            **kwargs: Additional parameters to pass to ChatOpenAI
        """
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.api_key = api_key
        self.kwargs = kwargs
        
        # Azure OpenAI configuration
        self.azure_endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.azure_api_version = settings.AZURE_OPENAI_API_VERSION
        self.azure_deployment = settings.AZURE_OPENAI_API_DEPLOYMENT
        self.azure_api_key = settings.AZURE_OPENAI_API_KEY

        # Initialize the ChatOpenAI client
        # Use Azure OpenAI if configured, otherwise standard OpenAI
        if self.azure_endpoint and self.azure_api_key:
            self.client = ChatOpenAI(
                azure_endpoint=self.azure_endpoint,
                azure_deployment=self.azure_deployment or self.model_name,
                api_version=self.azure_api_version,
                api_key=self.azure_api_key,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                streaming=False,
                **self.kwargs,
            )
        else:
            self.client = ChatOpenAI(
                model_name=self.model_name,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                api_key=self.api_key,
                streaming=False,
                **self.kwargs,
            )

    async def generate(
        self,
        *,
        prompt: Any,
        input: Optional[Dict[str, Any]] = None,
        output_schema: Optional[Type[BaseModel]] = None,
        **kwargs,
    ) -> Any:
        """
        Generate a response from OpenAI using prompt chaining.

        Args:
            prompt: Runnable/prompt to chain with the client
            input: Optional dict of variables for the prompt (defaults to {})
            output_schema: Optional Pydantic model for structured output
            **kwargs: Extra parameters for runtime client config

        Returns:
            Any: The generated response (AIMessage for plain chat, or structured type)
        """
        if prompt is None:
            raise ValueError("'prompt' is required for generate().")

        prompt_input = input or {}

        # Apply runtime configuration (streaming, temperature, etc.)
        client = self._configure_client(streaming=False, **kwargs)

        # Switch between normal and structured client
        if output_schema:
            llm = client.with_structured_output(output_schema)
        else:
            llm = client

        chain = prompt | llm
        response = await chain.ainvoke(prompt_input)
        return response

    async def stream(
        self, messages: List[Union[Dict[str, str], BaseMessage]], **kwargs
    ) -> AsyncGenerator[AIMessage, None]:
        """
        Stream a response from OpenAI based on input messages.

        Args:
            messages: List of messages in the conversation
            **kwargs: Additional parameters to pass to the LLM

        Returns:
            AsyncGenerator[AIMessage, None]: Generator yielding chunks of the response
        """
        # normalized_messages = self._normalize_messages(messages)
        normalized_messages = messages

        # Set up streaming callback handler
        callback_handler = AsyncIteratorCallbackHandler()

        # Configure client for streaming
        client = self._configure_client(
            streaming=True, callbacks=[callback_handler], **kwargs
        )

        # Start generating in the background
        task = asyncio.create_task(client.ainvoke(normalized_messages))

        # Stream the response
        async for chunk in callback_handler.aiter():
            yield AIMessage(content=chunk)

        # Ensure the task completes
        await task

    def _configure_client(self, streaming: bool = False, **kwargs) -> ChatOpenAI:
        """
        Configure the OpenAI client with runtime parameters.

        Args:
            streaming: Whether to enable streaming
            **kwargs: Additional parameters to override

        Returns:
            ChatOpenAI: Configured client
        """
        # Use Azure OpenAI if configured, otherwise standard OpenAI
        if self.azure_endpoint and self.azure_api_key:
            # Start with default parameters for Azure OpenAI
            config = {
                "azure_endpoint": self.azure_endpoint,
                "azure_deployment": self.azure_deployment or self.model_name,
                "api_version": self.azure_api_version,
                "api_key": self.azure_api_key,
                "temperature": self.temperature,
                "max_tokens": self.max_tokens,
                "streaming": streaming,
                **self.kwargs,
            }
        else:
            # Start with default parameters for standard OpenAI
            config = {
                "model_name": self.model_name,
                "temperature": self.temperature,
                "max_tokens": self.max_tokens,
                "api_key": self.api_key,
                "streaming": streaming,
                **self.kwargs,
            }

        # Override with any runtime parameters
        config.update(kwargs)

        # Create a new client with the updated configuration
        return ChatOpenAI(**config)

    def with_structured_output(self, schema: Any, **kwargs) -> Any:
        """
        Return a runnable configured to produce structured output as per the given schema.

        This leverages LangChain's ChatOpenAI.with_structured_output, which supports
        TypedDict + Annotated and Pydantic models.
        """
        client = self._configure_client(streaming=False, **kwargs)
        return client.with_structured_output(schema)

    def get_info(self) -> Dict[str, Any]:
        """
        Get information about the OpenAI provider.

        Returns:
            Dict[str, Any]: Information about the provider including name, model, etc.
        """
        info = {
            "provider": "openai",
            "model": self.model_name,
            "temperature": self.temperature,
            "max_tokens": (
                self.max_tokens if self.max_tokens else "Not set (using model default)"
            ),
            "api_key_configured": bool(self.api_key),
        }
        
        # Add Azure OpenAI info if configured
        if self.azure_endpoint and self.azure_api_key:
            info["azure_openai"] = True
            info["azure_endpoint"] = self.azure_endpoint
            info["azure_deployment"] = self.azure_deployment
            info["azure_api_version"] = self.azure_api_version
        else:
            info["azure_openai"] = False
            
        return info
