from langchain.tools import Tool
from pydantic import BaseModel, Field
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.prompts import PromptTemplate

PROMPT = PromptTemplate.from_template(
    """
You are an expert in soil science for Keralan agriculture. A farmer is asking about soil health.
Based on their query, provide an assessment and actionable advice.
Explain concepts in simple terms.
If the farmer describes their soil (color, texture, location), use that to inform your answer.
If they ask a general question, provide a general overview of soil health management.
Encourage them to get a proper soil test for accurate analysis.

Farmer's Query: "{query}"

Soil Health Advice:
"""
)

class SoilHealthInput(BaseModel):
    query: str = Field(description="The farmer's question about soil health.")

def _run_advisor(query: str, llm: BaseChatModel) -> str:
    """Helper function to run the LLM chain."""
    return (PROMPT | llm).invoke({"query": query}).content

def get_soil_health_advisor_tool(llm: BaseChatModel) -> Tool:
    """
    Creates and returns the soil health advisor tool,
    with the LLM integrated directly into it.
    """
    tool = Tool(
        name="soil_health_advisor",
        func=lambda query: _run_advisor(query, llm),
        description="Use this tool when a farmer asks a question about soil health, soil testing, or how to improve their soil. The input should be the farmer's question (e.g., 'how can I improve my clay soil?').",
        args_schema=SoilHealthInput
    )
    return tool
