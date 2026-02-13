import logging
from typing import List, Union

from langchain_openai import ChatOpenAI
from openai import OpenAI

from ..LLMEnums import DocumentTypeEnum, OpenAIEnums
from ..LLMInterface import LLMInterface


class OpenAIProvider(LLMInterface):
    def __init__(
        self,
        api_key: str,
        api_url: str = None,
        default_input_max_characters: int = 1000,
        default_generation_max_output_tokens: int = 1000,
        default_generation_temperature: float = 0.1,
        azure_endpoint: str = None,
        azure_api_version: str = None,
        azure_deployment: str = None,
    ):
        self.api_key = api_key
        self.api_url = api_url
        self.default_input_max_characters = default_input_max_characters
        self.default_generation_max_output_tokens = default_generation_max_output_tokens
        self.default_generation_temperature = default_generation_temperature
        
        # Azure OpenAI configuration
        self.azure_endpoint = azure_endpoint
        self.azure_api_version = azure_api_version
        self.azure_deployment = azure_deployment

        self.generation_model_id = None

        self.embedding_model_id = None
        self.embedding_size = None

        # Initialize OpenAI client with Azure OpenAI support
        if self.azure_endpoint:
            # Use Azure OpenAI
            self.client = OpenAI(
                api_key=self.api_key,
                azure_endpoint=self.azure_endpoint,
                api_version=self.azure_api_version or "2025-01-01-preview"
            )
        else:
            # Use standard OpenAI API
            self.client = OpenAI(api_key=self.api_key, base_url=self.api_url)

        self.logger = logging.getLogger(__name__)

        self.enums = OpenAIEnums

    def set_generation_model(self, model_id: str):
        self.generation_model_id = model_id
        self.logger.info(f"Set OpenAI generation model to {model_id}")

    def set_embedding_model(self, model_id: str, embedding_size: int):
        self.embedding_model_id = model_id
        self.embedding_size = embedding_size
        self.logger.info(
            f"Set OpenAI embedding model to {model_id} with size {embedding_size}"
        )

    def process_text(self, text: str):
        if len(text) > self.default_input_max_characters:
            self.logger.warning(
                f"Input text exceeds maximum character limit of {self.default_input_max_characters}. Truncating."
            )
            text = text[: self.default_input_max_characters]
        return text.strip()

    def generate_text(
        self,
        prompt: str,
        chat_history=[],
        system_prompt: str = None,
        max_output_tokens: int = None,
        temperature: float = None,
    ):

        if not self.client:
            self.logger.error("OpenAI client is not initialized.")
            return None

        if not self.generation_model_id:
            self.logger.error("Generation model is not set.")
            return None

        max_output_tokens = (
            max_output_tokens
            if max_output_tokens
            else self.default_generation_max_output_tokens
        )

        temperature = (
            temperature if temperature else self.default_generation_temperature
        )

        chat_history.append(self.construct_prompt(prompt, OpenAIEnums.USER.value))

        # Use deployment name for Azure OpenAI, model ID for standard OpenAI
        model_name = self.azure_deployment if self.azure_endpoint else self.generation_model_id
        
        response = self.client.chat.completions.create(
            model=model_name,
            messages=chat_history,
            max_tokens=max_output_tokens,
            temperature=temperature,
        )

        if (
            not response
            or not response.choices
            or len(response.choices) == 0
            or not response.choices[0].message
        ):
            self.logger.error("No response received from OpenAI.")
            return None

        generated_text = response.choices[0].message.content

        return generated_text

    def embed_text(self, text: Union[str, List[str]], document_type: str = None):
        if not self.client:
            self.logger.error("OpenAI client is not initialized.")
            return None

        if not self.embedding_model_id:
            self.logger.error("Embedding model is not set.")
            return None

        response = self.client.embeddings.create(
            input=text, model=self.embedding_model_id
        )

        if (
            not response
            or not response.data
            or len(response.data) == 0
            or not response.data[0].embedding
        ):
            self.logger.error("No embedding data received from OpenAI.")
            return None

        return [rec.embedding for rec in response.data]

    def construct_prompt(self, prompt: str, role: str):
        return {"role": role, "content": prompt}

    ## the following methods are just to comply with langchain expectations of an embedding model wrapper
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.embed_text(texts, document_type=DocumentTypeEnum.DOCUMENT.value)

    def embed_query(self, text: str) -> List[float]:
        return self.embed_text(text, document_type=DocumentTypeEnum.QUERY.value)

    def get_langchain_chat_model(self):
        if not self.generation_model_id and not self.azure_deployment:
            self.logger.error("Generation model is not set.")
            return None
        
        # Use Azure OpenAI if configured
        if self.azure_endpoint:
            return ChatOpenAI(
                azure_endpoint=self.azure_endpoint,
                azure_deployment=self.azure_deployment or self.generation_model_id,
                api_version=self.azure_api_version or "2025-01-01-preview",
                api_key=self.api_key,
                temperature=self.default_generation_temperature,
            )
        else:
            # Use standard OpenAI API
            return ChatOpenAI(
                model_name=self.generation_model_id,
                openai_api_key=self.api_key,
                openai_api_base=self.api_url,
                temperature=self.default_generation_temperature,
            )
