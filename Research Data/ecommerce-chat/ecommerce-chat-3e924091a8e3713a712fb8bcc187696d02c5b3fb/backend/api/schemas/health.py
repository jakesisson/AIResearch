from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "healthy"

    class Config:
        from_attributes = True
