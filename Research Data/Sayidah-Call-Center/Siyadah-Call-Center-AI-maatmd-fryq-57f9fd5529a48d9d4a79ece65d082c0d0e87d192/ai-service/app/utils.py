import json
import re
from typing import Dict, Any, List
from datetime import datetime

def clean_arabic_text(text: str) -> str:
    """
    Clean and normalize Arabic text for AI processing
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Normalize Arabic characters
    text = text.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
    text = text.replace('ة', 'ه').replace('ى', 'ي')
    
    return text

def format_business_data(data: Dict[str, Any]) -> str:
    """
    Format business data for AI analysis
    """
    formatted_lines = []
    
    for key, value in data.items():
        if isinstance(value, (int, float)):
            if 'value' in key.lower() or 'price' in key.lower() or 'cost' in key.lower():
                formatted_lines.append(f"{key}: {value:,} ريال")
            else:
                formatted_lines.append(f"{key}: {value}")
        elif isinstance(value, str):
            formatted_lines.append(f"{key}: {value}")
        elif isinstance(value, list):
            formatted_lines.append(f"{key}: {', '.join(map(str, value))}")
    
    return '\n'.join(formatted_lines)

def extract_metrics(opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract key metrics from opportunities data
    """
    if not opportunities:
        return {"error": "No opportunities data provided"}
    
    total_value = sum(opp.get('value', 0) for opp in opportunities)
    total_count = len(opportunities)
    avg_value = total_value / total_count if total_count > 0 else 0
    
    # Stage distribution
    stages = {}
    for opp in opportunities:
        stage = opp.get('stage', 'unknown')
        stages[stage] = stages.get(stage, 0) + 1
    
    # Probability analysis
    probabilities = [opp.get('probability', 0) for opp in opportunities if opp.get('probability')]
    avg_probability = sum(probabilities) / len(probabilities) if probabilities else 0
    
    return {
        "total_opportunities": total_count,
        "total_value": total_value,
        "average_value": avg_value,
        "average_probability": avg_probability,
        "stage_distribution": stages,
        "high_value_count": len([o for o in opportunities if o.get('value', 0) > 100000]),
        "timestamp": datetime.now().isoformat()
    }

def validate_request_data(data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
    """
    Validate request data and return validation result
    """
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    
    return {
        "valid": len(missing_fields) == 0,
        "missing_fields": missing_fields,
        "provided_fields": list(data.keys())
    }

def generate_saudi_business_context() -> str:
    """
    Generate Saudi business context for AI responses
    """
    return """
    السياق التجاري السعودي:
    - العملة: الريال السعودي (SAR)
    - ساعات العمل: الأحد إلى الخميس، 8 صباحاً - 5 مساءً
    - أيام العطل: الجمعة والسبت
    - المواسم التجارية: رمضان، موسم الحج، العودة للمدارس
    - القطاعات الرئيسية: النفط، التقنية، التجارة، الخدمات المالية
    - رؤية 2030: التحول الرقمي والتنويع الاقتصادي
    """

class AIResponseFormatter:
    """
    Format AI responses for different use cases
    """
    
    @staticmethod
    def format_business_analysis(analysis: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "analysis": analysis,
            "key_metrics": metrics,
            "recommendations": AIResponseFormatter._extract_recommendations(analysis),
            "confidence_score": 0.85,
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def _extract_recommendations(text: str) -> List[str]:
        # Extract recommendations from Arabic text
        recommendations = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line for keyword in ['يُنصح', 'التوصية', 'يجب', 'من المهم']):
                recommendations.append(line)
        
        return recommendations[:3]  # Return top 3 recommendations
    
    @staticmethod
    def format_error_response(error_message: str) -> Dict[str, Any]:
        return {
            "success": False,
            "error": error_message,
            "timestamp": datetime.now().isoformat(),
            "support_contact": "تواصل مع الدعم الفني"
        }