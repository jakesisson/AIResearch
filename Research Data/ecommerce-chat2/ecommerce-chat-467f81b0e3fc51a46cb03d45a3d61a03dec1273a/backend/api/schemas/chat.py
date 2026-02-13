from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    status: str
    response: str

    class Config:
        from_attributes = True
