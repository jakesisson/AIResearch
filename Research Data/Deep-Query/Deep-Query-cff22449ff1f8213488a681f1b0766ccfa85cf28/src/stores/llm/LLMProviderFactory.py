from .LLMEnums import LLMENums
from .providers import OpenAIProvider, CoHereProvider, GoogleGenAIProvider
class LLMProviderFactory:
    def __init__(self, config:dict):
        self.config = config

    def create(self, provider: str):
        if provider == LLMENums.OPENAI.value:
            # Check if Azure OpenAI is configured
            azure_endpoint = getattr(self.config, 'AZURE_OPENAI_ENDPOINT', None)
            azure_api_key = getattr(self.config, 'AZURE_OPENAI_API_KEY', None)
            
            # Use Azure OpenAI if endpoint is configured, otherwise use standard OpenAI
            if azure_endpoint and azure_api_key:
                return OpenAIProvider(
                    api_key=azure_api_key,
                    api_url=None,  # Not used for Azure OpenAI
                    default_input_max_characters=self.config.INPUT_DEFAULT_MAX_CHARACTERS,
                    default_generation_max_output_tokens=self.config.GENERATION_DEFAULT_MAX_TOKENS,
                    default_generation_temperature=self.config.GENERATION_DEFAULT_TEMPERATURE,
                    azure_endpoint=azure_endpoint,
                    azure_api_version=getattr(self.config, 'AZURE_OPENAI_API_VERSION', '2025-01-01-preview'),
                    azure_deployment=getattr(self.config, 'AZURE_OPENAI_API_DEPLOYMENT', None) or getattr(self.config, 'MODEL_ID', None),
                )
            else:
                return OpenAIProvider(
                    api_url=self.config.OPENAI_API_URL,
                    api_key=self.config.OPENAI_API_KEY,
                    default_input_max_characters=self.config.INPUT_DEFAULT_MAX_CHARACTERS,
                    default_generation_max_output_tokens=self.config.GENERATION_DEFAULT_MAX_TOKENS,
                    default_generation_temperature=self.config.GENERATION_DEFAULT_TEMPERATURE,
                )
        elif provider == LLMENums.COHERE.value:
            return CoHereProvider(
                api_key=self.config.COHERE_API_KEY,
                default_input_max_characters=self.config.INPUT_DEFAULT_MAX_CHARACTERS,
                default_generation_max_output_tokens=self.config.GENERATION_DEFAULT_MAX_TOKENS,
                default_generation_temperature=self.config.GENERATION_DEFAULT_TEMPERATURE,
            )
        elif provider == LLMENums.GOOGLE_GENAI.value:
            return GoogleGenAIProvider(
                api_key=self.config.GOOGLE_GENAI_API_KEY,
                default_input_max_characters=self.config.INPUT_DEFAULT_MAX_CHARACTERS,
                default_generation_max_output_tokens=self.config.GENERATION_DEFAULT_MAX_TOKENS,
                default_generation_temperature=self.config.GENERATION_DEFAULT_TEMPERATURE,
            )
        else:
            raise ValueError(f"Unknown provider type: {provider}")