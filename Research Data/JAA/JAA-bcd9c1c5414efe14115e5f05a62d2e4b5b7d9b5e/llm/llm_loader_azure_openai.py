import os
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from transformers import GenerationConfig
from llm_profiles import LLMProFile


class AzureOpenAIWrapper:
    """Wrapper to make Azure OpenAI compatible with local LLM interface"""
    def __init__(self, llm: ChatOpenAI, tokenizer=None):
        self.llm = llm
        # Create a dummy tokenizer-like object for compatibility
        self.tokenizer = DummyTokenizer()

    def __call__(self, prompt, generation_config: Optional[GenerationConfig] = None, return_full_text: bool = False, structured_output_schema=None):
        """Call the Azure OpenAI model"""
        # Convert prompt to messages if it's a string
        if isinstance(prompt, str):
            messages = [HumanMessage(content=prompt)]
        elif isinstance(prompt, list):
            # Convert dict format to LangChain messages
            messages = []
            for msg in prompt:
                if isinstance(msg, dict):
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    if role == "system":
                        messages.append(SystemMessage(content=content))
                    elif role == "assistant":
                        messages.append(AIMessage(content=content))
                    else:
                        messages.append(HumanMessage(content=content))
                elif isinstance(msg, BaseMessage):
                    messages.append(msg)
                else:
                    messages.append(HumanMessage(content=str(msg)))
        else:
            messages = [HumanMessage(content=str(prompt))]

        # Invoke the model
        response = self.llm.invoke(messages)
        
        # Extract content
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Return in the format expected by the local LLM interface
        return [{"generated_text": content}]


class DummyTokenizer:
    """Dummy tokenizer for compatibility with local LLM interface"""
    def __init__(self):
        self.eos_token = "<|im_end|>"
        self.eos_token_id = 0
        self.pad_token = self.eos_token
        self.pad_token_id = self.eos_token_id

    def apply_chat_template(self, messages, tokenize=False, add_generation_prompt=True):
        """Convert messages to a prompt string"""
        if isinstance(messages, str):
            return messages
        
        prompt_parts = []
        for msg in messages:
            if isinstance(msg, dict):
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "system":
                    prompt_parts.append(f"System: {content}")
                elif role == "assistant":
                    prompt_parts.append(f"Assistant: {content}")
                else:
                    prompt_parts.append(f"User: {content}")
            elif isinstance(msg, BaseMessage):
                if isinstance(msg, SystemMessage):
                    prompt_parts.append(f"System: {msg.content}")
                elif isinstance(msg, AIMessage):
                    prompt_parts.append(f"Assistant: {msg.content}")
                else:
                    prompt_parts.append(f"User: {msg.content}")
            else:
                prompt_parts.append(str(msg))
        
        if add_generation_prompt:
            prompt_parts.append("Assistant:")
        
        return "\n".join(prompt_parts)

    def convert_tokens_to_ids(self, token):
        """Dummy token ID conversion"""
        return 0


def load_llm(profile: LLMProFile):
    """Load Azure OpenAI model based on profile"""
    # Get Azure OpenAI configuration from environment
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
    
    # Determine deployment name based on profile or environment
    if profile == LLMProFile.SMALL:
        azure_deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT_SMALL") or os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or "gpt-4o-mini"
    elif profile == LLMProFile.LARGE:
        azure_deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT_LARGE") or os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or "gpt-4.1"
    elif profile == LLMProFile.SUPER_LARGE:
        azure_deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT_SUPER_LARGE") or os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or "gpt-4.1"
    else:
        azure_deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or "gpt-4.1"

    if not azure_endpoint or not azure_api_key:
        raise ValueError(
            "Azure OpenAI requires AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables"
        )

    print(f"Model Size: {profile.name} - Azure OpenAI ({azure_deployment})")

    llm = ChatOpenAI(
        azure_endpoint=azure_endpoint,
        azure_deployment=azure_deployment,
        api_version=azure_api_version,
        api_key=azure_api_key,
        temperature=0.7,
    )

    return AzureOpenAIWrapper(llm)
