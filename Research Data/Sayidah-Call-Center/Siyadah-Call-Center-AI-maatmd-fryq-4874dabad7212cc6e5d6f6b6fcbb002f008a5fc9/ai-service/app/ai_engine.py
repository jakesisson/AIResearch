import os
import asyncio
from typing import Dict, Any, Optional
import openai
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def process_prompt(
    prompt: str, 
    context: Optional[str] = None, 
    language: str = "ar",
    max_tokens: int = 1000
) -> str:
    """
    Process AI prompts with Arabic business context
    """
    try:
        # Build system prompt based on language
        if language == "ar":
            system_content = """أنت مساعد ذكي متخصص في الأعمال السعودية. 
            تجيب باللغة العربية بطريقة مهنية ومفيدة. 
            تركز على حلول الأعمال والتحليلات الذكية."""
        else:
            system_content = """You are a smart business assistant specialized in Saudi business solutions.
            Provide professional and helpful responses focused on business solutions and analytics."""
        
        # Add context if provided
        if context:
            prompt = f"السياق: {context}\n\nالسؤال: {prompt}"
        
        # Make async OpenAI call
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"خطأ في معالجة الطلب: {str(e)}"

async def analyze_business_data(
    data: Dict[str, Any],
    analysis_type: str,
    language: str = "ar"
) -> Dict[str, Any]:
    """
    Analyze business data with AI insights
    """
    try:
        # Convert data to text for analysis
        data_text = str(data)
        
        # Define analysis prompts based on type
        analysis_prompts = {
            "sentiment": "حلل المشاعر والآراء في هذه البيانات:",
            "trends": "حدد الاتجاهات والأنماط في هذه البيانات:",
            "insights": "استخرج الرؤى والتوصيات من هذه البيانات:",
            "performance": "قيّم الأداء وحدد نقاط التحسين في هذه البيانات:"
        }
        
        prompt = f"{analysis_prompts.get(analysis_type, 'حلل هذه البيانات:')} {data_text}"
        
        analysis_result = await process_prompt(prompt, language=language)
        
        return {
            "analysis": analysis_result,
            "confidence": 0.85,
            "recommendations": await process_prompt(
                f"بناءً على التحليل السابق، ما هي أهم 3 توصيات؟ {analysis_result}",
                language=language,
                max_tokens=300
            )
        }
        
    except Exception as e:
        return {"error": f"خطأ في التحليل: {str(e)}"}

async def translate_text(text: str, from_lang: str, to_lang: str) -> str:
    """
    Translate text between Arabic and English
    """
    try:
        if from_lang == "ar" and to_lang == "en":
            prompt = f"Translate this Arabic text to English accurately: {text}"
            system_content = "You are a professional translator. Provide accurate translations only."
        elif from_lang == "en" and to_lang == "ar":
            prompt = f"ترجم هذا النص الإنجليزي إلى العربية بدقة: {text}"
            system_content = "أنت مترجم محترف. قدم ترجمات دقيقة فقط."
        else:
            return "نوع الترجمة غير مدعوم حالياً"
        
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"خطأ في الترجمة: {str(e)}"

# Additional utility functions for Saudi business context
async def generate_business_insights(opportunities_data: list) -> Dict[str, Any]:
    """
    Generate business insights from opportunities data
    """
    total_value = sum(opp.get('value', 0) for opp in opportunities_data)
    avg_probability = sum(opp.get('probability', 0) for opp in opportunities_data) / len(opportunities_data)
    
    insights_prompt = f"""
    حلل هذه البيانات التجارية:
    - عدد الفرص: {len(opportunities_data)}
    - القيمة الإجمالية: {total_value:,} ريال
    - متوسط احتمالية النجاح: {avg_probability:.1f}%
    
    قدم رؤى وتوصيات مهمة للنمو التجاري.
    """
    
    analysis = await process_prompt(insights_prompt, language="ar")
    
    return {
        "total_opportunities": len(opportunities_data),
        "total_value": total_value,
        "average_probability": avg_probability,
        "ai_insights": analysis,
        "growth_potential": "عالي" if avg_probability > 70 else "متوسط"
    }