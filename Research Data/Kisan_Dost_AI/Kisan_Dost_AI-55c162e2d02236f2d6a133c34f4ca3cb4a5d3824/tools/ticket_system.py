from langchain.tools import tool
from pydantic import BaseModel, Field
import tickets

class TicketInput(BaseModel):
    summary: str = Field(description="A concise summary of the user's problem that could not be resolved.")

@tool(args_schema=TicketInput)
def create_support_ticket(summary: str) -> str:
    """Use this tool to create a support ticket when you are unable to answer a user's question with the other available tools."""

    # Per the requirements, we use placeholder data for the user.
    user_info = {"name": "Placeholder Farmer", "contact": "N/A"}

    # Create the ticket using the backend module
    new_ticket = tickets.create_ticket(summary=summary, user_info=user_info)

    # Return a confirmation message to be shown to the user
    return f"I'm sorry I couldn't resolve your issue, but I've created a support ticket for you. An expert will look into it shortly. Your ticket ID is {new_ticket['id']}."
