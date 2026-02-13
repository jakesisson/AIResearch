import os
from typing import Optional

class Config:
    @staticmethod
    def get_google_cse_id() -> Optional[str]:
        return os.getenv('GOOGLE_CSE_ID')
    
    @staticmethod
    def get_azure_api_key() -> Optional[str]:
        return os.getenv('AZURE_OPENAI_API_KEY')
    
    @staticmethod
    def get_azure_endpoint() -> Optional[str]:
        return os.getenv('AZURE_OPENAI_ENDPOINT')
    
    @staticmethod
    def get_azure_api_version() -> str:
        return os.getenv('AZURE_OPENAI_API_VERSION', '2025-01-01-preview')
    
    @staticmethod
    def get_azure_deployment() -> str:
        return os.getenv('AZURE_OPENAI_API_DEPLOYMENT') or os.getenv('MODEL_ID', 'gpt-4.1')
    
    @staticmethod
    def get_newsdata_api_key() -> Optional[str]:
        return os.getenv('NEWSDATA_API_KEY')
    
    @staticmethod
    def validate_config() -> bool:
        """Validate that all required configuration is present"""
        newsdata_key = Config.get_newsdata_api_key()
        google_cse_id = Config.get_google_cse_id()
        azure_api_key = Config.get_azure_api_key()
        azure_endpoint = Config.get_azure_endpoint()
        
        if not newsdata_key:
            print("Error: NEWSDATA_API_KEY environment variable not set")
            return False
        
        if not google_cse_id:
            print("Error: GOOGLE_CSE_ID environment variable not set")
            return False
        
        if not azure_api_key:
            print("Warning: AZURE_OPENAI_API_KEY environment variable not set (will use fallback mode)")
        
        if not azure_endpoint:
            print("Warning: AZURE_OPENAI_ENDPOINT environment variable not set (will use fallback mode)")
        
        return True