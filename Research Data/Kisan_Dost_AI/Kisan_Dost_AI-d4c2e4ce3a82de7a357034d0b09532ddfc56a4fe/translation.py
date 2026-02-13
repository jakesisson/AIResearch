import os
from langdetect import detect, LangDetectException
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from prompts import TRANSLATE_PROMPT, ENRICH_QUERY_PROMPT

# Helper function to get LLM instance
def get_llm() -> BaseChatModel:
    """Get LLM instance - Azure OpenAI if configured, otherwise Ollama"""
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    
    if azure_endpoint and azure_api_key:
        from langchain_openai import ChatOpenAI
        azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
        azure_deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or "gpt-4.1"
        return ChatOpenAI(
            azure_endpoint=azure_endpoint,
            azure_deployment=azure_deployment,
            api_version=azure_api_version,
            api_key=azure_api_key,
            temperature=0,
        )
    else:
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(model="qwen3:4b", temperature=0)

def detect_language(text: str) -> str:
    """
    Detects the language of a given text.
    Returns the language code (e.g., 'en', 'ml') or 'en' as a fallback.
    """
    try:
        return detect(text)
    except LangDetectException:
        print("Warning: Language detection failed. Defaulting to English.")
        return 'en'

def translate_text(llm: BaseChatModel, text: str, target_language: str, source_language: str = "auto") -> str:
    """
    Translates a given text to the target language using the provided LLM.
    - llm: The LLM instance to use for translation (Azure OpenAI or Ollama).
    - text: The text to translate.
    - target_language: The language to translate the text into (e.g., "English").
    - source_language: The source language of the text (e.g., "Malayalam").
    """
    print(f"--- TRANSLATING TEXT ---")
    print(f"Source Language: {source_language}")
    print(f"Target Language: {target_language}")

    prompt = ChatPromptTemplate.from_template(TRANSLATE_PROMPT)
    chain = prompt | llm

    response = chain.invoke({
        "source_language": source_language,
        "target_language": target_language,
        "text": text
    })

    translated_text = response.content.strip()
    print(f"Translated Text: {translated_text}")
    return translated_text

def enrich_query(llm: BaseChatModel, query: str) -> str:
    """
    Enriches a given query using the provided LLM.
    - llm: The LLM instance to use for enrichment (Azure OpenAI or Ollama).
    - query: The query to enrich.
    """
    print(f"--- ENRICHING QUERY ---")

    prompt = ChatPromptTemplate.from_template(ENRICH_QUERY_PROMPT)
    chain = prompt | llm

    response = chain.invoke({"query": query})

    enriched_query = response.content.strip()
    print(f"Enriched Query: {enriched_query}")
    return enriched_query
