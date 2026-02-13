from langchain.tools import Tool
from pydantic import BaseModel, Field
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import PromptTemplate

PROMPT = PromptTemplate.from_template(
    """
You are an expert in Keralan agriculture. A farmer has asked for a crop recommendation.
Based on their query and your general knowledge, provide a suitable crop recommendation.
Consider factors like climate, soil, and potential profitability.
If the farmer provides specific details (e.g., location, soil type, water availability), use them to refine your recommendation.
If key information is missing, suggest what the farmer should look into.

Farmer's Query: "{query}"

Recommendation:
"""
)

class CropRecommenderInput(BaseModel):
    query: str = Field(description="The farmer's detailed query about their needs for a crop recommendation.")

def _run_recommender(query: str, llm: BaseChatModel) -> str:
    """Helper function to run the LLM chain."""
    return (PROMPT | llm).invoke({"query": query}).content

def get_crop_recommender_tool(llm: BaseChatModel) -> Tool:
    """
    Creates and returns the crop recommender tool,
    with the LLM integrated directly into it.
    """
    tool = Tool(
        name="crop_recommender",
        func=lambda query: _run_recommender(query, llm),
        description="Use this tool when a farmer asks for a recommendation on what crop to plant. The input should be the farmer's detailed query about their needs (e.g., 'I have laterite soil and good irrigation, what should I plant for profit?').",
        args_schema=CropRecommenderInput
    )
    return tool
