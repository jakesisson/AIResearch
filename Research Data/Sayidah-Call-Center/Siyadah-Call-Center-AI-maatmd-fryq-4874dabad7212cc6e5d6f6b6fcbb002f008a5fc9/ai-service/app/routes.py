from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from app.ai_engine import process_prompt, analyze_business_data, translate_text
import json

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    language: Optional[str] = "ar"
    max_tokens: Optional[int] = 1000

class AnalysisRequest(BaseModel):
    data: Dict[str, Any]
    analysis_type: str  # "sentiment", "trends", "insights", "performance"
    language: Optional[str] = "ar"

class TranslationRequest(BaseModel):
    text: str
    from_lang: str = "ar"
    to_lang: str = "en"

@router.post("/ai/respond")
async def ai_respond(request: PromptRequest):
    """
    Process AI prompts with Arabic context
    """
    try:
        if not request.prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        response = await process_prompt(
            prompt=request.prompt,
            context=request.context,
            language=request.language or "ar",
            max_tokens=request.max_tokens or 150
        )
        
        return {
            "success": True,
            "response": response,
            "language": request.language,
            "tokens_used": len(response.split())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

@router.post("/ai/analyze")
async def ai_analyze(request: AnalysisRequest):
    """
    Analyze business data with AI insights
    """
    try:
        if not request.data:
            raise HTTPException(status_code=400, detail="Data is required for analysis")
        
        analysis = await analyze_business_data(
            data=request.data,
            analysis_type=request.analysis_type,
            language=request.language
        )
        
        return {
            "success": True,
            "analysis": analysis,
            "analysis_type": request.analysis_type,
            "data_points": len(request.data) if isinstance(request.data, dict) else 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.post("/ai/translate")
async def ai_translate(request: TranslationRequest):
    """
    Translate text between Arabic and English
    """
    try:
        if not request.text:
            raise HTTPException(status_code=400, detail="Text is required for translation")
        
        translation = await translate_text(
            text=request.text,
            from_lang=request.from_lang,
            to_lang=request.to_lang
        )
        
        return {
            "success": True,
            "original": request.text,
            "translation": translation,
            "from_language": request.from_lang,
            "to_language": request.to_lang
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@router.get("/ai/status")
async def ai_status():
    """
    Get AI service status and capabilities
    """
    return {
        "status": "operational",
        "capabilities": [
            "Arabic text processing",
            "Business data analysis", 
            "Sentiment analysis",
            "Translation services",
            "GPT-4o integration"
        ],
        "languages_supported": ["ar", "en"],
        "max_tokens": 4000
    }