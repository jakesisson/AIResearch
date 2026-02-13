#!/usr/bin/env python3

from dotenv import load_dotenv
from agent.research_agent.orchestrator import AIOrchestrator
from agent.research_agent.config import Config

# Load environment variables from .env file
load_dotenv()

def main():
    """Main function to run the Research Agent"""
    print("=== AI Research Orchestrator ===")
    print("Clean Architecture Multi-Agent LLM System:")
    print("📰 News/Stocks Agent → Real-time NewsData.io API")
    print("🛍️  Product Agent → Google Search + Market Analysis")
    print("🤖 General Agent → Comprehensive Analysis")
    print("✅ Validator Agent → Information Validation")
    print("🏭 Factory Pattern → Dynamic Agent Creation")
    print("🎯 Orchestrator → Centralized Workflow Control")
    print()
    
    # Validate configuration
    if not Config.validate_config():
        print("\nPlease set the required environment variables:")
        print("- NEWSDATA_API_KEY: Your NewsData.io API key")
        print("- GOOGLE_CSE_ID: Your Google Custom Search Engine ID")
        print("- AZURE_OPENAI_API_KEY: Your Azure OpenAI API key")
        print("- AZURE_OPENAI_ENDPOINT: Your Azure OpenAI endpoint")
        print("\nGet NewsData API key from: https://newsdata.io/")
        return
    
    # Initialize the AI orchestrator
    try:
        orchestrator = AIOrchestrator(
            newsdata_api_key=Config.get_newsdata_api_key(),
            google_cse_id=Config.get_google_cse_id(),
            azure_api_key=Config.get_azure_api_key(),
            azure_endpoint=Config.get_azure_endpoint(),
            azure_api_version=Config.get_azure_api_version(),
            azure_deployment=Config.get_azure_deployment()
        )
        print("AI Orchestrator initialized successfully!")
        print()
    except Exception as e:
        print(f"Error initializing AI Orchestrator: {e}")
        return
    
    # Main interaction loop
    while True:
        try:
            print("-" * 50)
            
            # Show memory status
            memory_status = orchestrator.get_memory_status()
            if "Active session" in memory_status:
                print(f"💭 {memory_status}")
                user_input = input("Ask follow-up question or 'exit' to start fresh: ").strip()
                
                if user_input.lower() == 'exit':
                    orchestrator.clear_memory()
                    print("🔄 Memory cleared. Starting fresh research.")
                    continue
            else:
                user_input = input("Enter your product/market query (or 'quit' to exit): ").strip()
            
            if user_input.lower() in ['quit', 'q']:
                print("Goodbye!")
                break
            
            if not user_input:
                print("Please enter a valid query.")
                continue
            
            print()
            # Process the query
            result = orchestrator.analyze_query(user_input)
            print(result)
            print()
            
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error processing query: {e}")
            print("Please try again.")

if __name__ == "__main__":
    main()