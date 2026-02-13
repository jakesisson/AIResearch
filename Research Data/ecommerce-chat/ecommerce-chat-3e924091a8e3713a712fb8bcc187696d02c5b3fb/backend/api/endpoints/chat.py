import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from services import Agent

from api.core.deps import get_agent
from api.schemas.chat import ChatRequest

router = APIRouter()


@router.post("/")
async def chat(request: ChatRequest, agent: Agent = Depends(get_agent)):
    message = request.message.strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    thread_id = request.user_id

    async def event_stream():
        yield f"data: {json.dumps({"type": "start"})}\n\n"

        try:
            async for chunk in agent.stream_message(message, thread_id):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            print(f"Stream error: {e}")
            error_response = {"type": "error", "data": f"An error occurred: {str(e)}"}
            yield f"data: {json.dumps(error_response)}\n\n"
        finally:
            yield f"data: {json.dumps({"type": "end"})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
