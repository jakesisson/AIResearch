from langchain.tools import Tool
from pydantic import BaseModel, Field
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import PromptTemplate

PROMPT = PromptTemplate.from_template(
    """
You are an expert in fertilizer management for Keralan agriculture. A farmer has asked for a fertilizer recommendation.
Based on their query, provide a recommendation. Be specific about the type of fertilizer (organic or chemical) and application.
If the farmer mentions their crop, soil type, and stage of growth, use this information to give a precise recommendation.
If the query is general, provide general best practices for fertilizer application.
Always prioritize balanced nutrition and mention the benefits of organic manures.

Farmer's Query: "{query}"

Fertilizer Recommendation:
"""
)

class FertilizerRecommenderInput(BaseModel):
    query: str = Field(description="The farmer's query about fertilizer recommendations, including crop type if possible.")

def _run_recommender(query: str, llm: BaseChatModel) -> str:
    """Helper function to run the LLM chain."""
    return (PROMPT | llm).invoke({"query": query}).content

def get_fertilizer_recommender_tool(llm: BaseChatModel) -> Tool:
    """
    Creates and returns the fertilizer recommender tool,
    with the LLM integrated directly into it.
    """
    tool = Tool(
        name="fertilizer_recommender",
        func=lambda query: _run_recommender(query, llm),
        description="Use this tool when a farmer asks for a recommendation on which fertilizer to use. The input should be the farmer's query, including crop type and soil if possible (e.g., 'what fertilizer should I use for my banana plants?').",
        args_schema=FertilizerRecommenderInput
    )
    return tool
