import os
from typing import Optional
from openai import AzureOpenAI

class LLMService:
    def __init__(self, azure_api_key: str = None, azure_endpoint: str = None, 
                 azure_api_version: str = None, azure_deployment: str = None):
        # Get Azure OpenAI credentials from parameters or environment
        self.api_key = azure_api_key or os.getenv('AZURE_OPENAI_API_KEY')
        self.endpoint = azure_endpoint or os.getenv('AZURE_OPENAI_ENDPOINT')
        self.api_version = azure_api_version or os.getenv('AZURE_OPENAI_API_VERSION', '2025-01-01-preview')
        self.deployment = azure_deployment or os.getenv('AZURE_OPENAI_API_DEPLOYMENT') or os.getenv('MODEL_ID', 'gpt-4.1')
        
        # Extract instance name from endpoint if needed
        if self.endpoint:
            # Remove https:// and .openai.azure.com/ to get instance name
            instance_name = self.endpoint.replace('https://', '').replace('.openai.azure.com', '').replace('/', '')
        else:
            instance_name = os.getenv('AZURE_OPENAI_API_INSTANCE')
        
        # Initialize Azure OpenAI client
        if self.api_key and self.endpoint:
            self.client = AzureOpenAI(
                api_key=self.api_key,
                api_version=self.api_version,
                azure_endpoint=self.endpoint
            )
        else:
            self.client = None
            print("Warning: Azure OpenAI credentials not fully configured")
    
    def query_llm(self, prompt: str, model_id: str = None) -> str:
        """Query Azure OpenAI LLM with the given prompt"""
        if not self.client:
            return self._fallback_response(prompt)
        
        # Use provided model_id or default deployment
        deployment_name = model_id or self.deployment
        max_tokens = int(os.getenv('MAX_TOKENS', '1000'))
        temperature = float(os.getenv('TEMPERATURE', '0.3'))
        
        try:
            response = self.client.chat.completions.create(
                model=deployment_name,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Azure OpenAI API error: {e}")
            return self._fallback_response(prompt)
    
    def _fallback_response(self, prompt: str) -> str:
        """Fallback response when LLM service is unavailable"""
        print("Azure OpenAI service unavailable. Using fallback logic.")
        if "classification" in prompt.lower():
            # Simple keyword-based classification fallback
            query_lower = prompt.lower()
            if any(word in query_lower for word in ["mobile", "phone", "laptop", "product", "snapdragon", "camera", "display"]):
                return "PRODUCT"
            elif any(word in query_lower for word in ["stock", "market", "trading"]):
                return "STOCKS"
            elif any(word in query_lower for word in ["news", "breaking"]):
                return "NEWS"
            else:
                return "GENERAL"
        
        # For analysis prompts, return a basic response
        return f"Analysis for query: Based on the information provided, this appears to be a product-related inquiry. The system is currently operating in fallback mode due to LLM service issues."
