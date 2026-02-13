from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
import uvicorn

app = FastAPI(
    title="Siyadah AI Microservice",
    description="AI processing microservice for Siyadah platform",
    version="1.0.0"
)

# CORS middleware for integration with Express.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "status": "Siyadah AI microservice ready ✅",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/ai/respond",
            "/api/v1/ai/analyze",
            "/api/v1/ai/translate"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-microservice"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)