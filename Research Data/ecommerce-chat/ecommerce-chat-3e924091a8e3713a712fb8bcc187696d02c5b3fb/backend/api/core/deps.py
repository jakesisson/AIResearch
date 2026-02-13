from fastapi import HTTPException, Request
from services import Agent


def get_agent(request: Request) -> Agent:
    if not hasattr(request.app.state, "agent"):
        raise HTTPException(
            status_code=500,
            detail="Agent not initialized. Lifespan event handler might have failed.",
        )
    return request.app.state.agent
