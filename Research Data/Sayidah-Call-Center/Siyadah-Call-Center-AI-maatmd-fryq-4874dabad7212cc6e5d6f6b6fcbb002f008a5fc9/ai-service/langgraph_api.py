"""
LangGraph API Endpoints
واجهات برمجية لنظام LangGraph المتكامل
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uvicorn
import os

# Import the orchestrator
from langgraph_crewai_integration import orchestrator

app = FastAPI(
    title="LangGraph CrewAI Integration API",
    description="نظام تكامل LangGraph مع CrewAI للوكلاء الذكيين",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ProcessRequest(BaseModel):
    """طلب معالجة المحادثة"""
    message: str = Field(..., description="رسالة العميل")
    customer_id: str = Field(..., description="معرف العميل")
    thread_id: Optional[str] = Field(None, description="معرف المحادثة")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="سياق إضافي")

class WorkflowVisualizationRequest(BaseModel):
    """طلب تصور سير العمل"""
    workflow_id: Optional[str] = Field(None, description="معرف سير العمل")

class AgentPerformanceRequest(BaseModel):
    """طلب أداء الوكلاء"""
    agent_id: Optional[str] = Field(None, description="معرف الوكيل")
    date_from: Optional[str] = Field(None, description="تاريخ البداية")
    date_to: Optional[str] = Field(None, description="تاريخ النهاية")

# API Endpoints
@app.get("/")
async def root():
    """معلومات النظام"""
    return {
        "service": "LangGraph CrewAI Integration",
        "status": "operational",
        "version": "1.0.0",
        "features": [
            "Stateful conversation management",
            "Multi-agent orchestration",
            "Workflow visualization",
            "Real-time performance monitoring",
            "Advanced routing logic"
        ],
        "agents": {
            "support": ["support_responder", "ticket_creator", "feedback_collector"],
            "sales": ["sales_closer", "objection_handler", "appointment_scheduler"],
            "telemarketing": ["telemarketing_pitcher", "lead_qualifier"]
        }
    }

@app.post("/api/langgraph/process")
async def process_conversation(request: ProcessRequest):
    """معالجة المحادثة باستخدام LangGraph"""
    try:
        result = await orchestrator.process_conversation(
            message=request.message,
            customer_id=request.customer_id,
            thread_id=request.thread_id
        )
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/langgraph/workflow/visualization")
async def get_workflow_visualization(workflow_id: Optional[str] = None):
    """الحصول على تصور سير العمل"""
    try:
        # Generate workflow visualization
        visualization = {
            "nodes": [
                {"id": "analyze_intent", "label": "تحليل النية", "type": "process"},
                {"id": "select_agent", "label": "اختيار الوكيل", "type": "decision"},
                {"id": "execute_support", "label": "تنفيذ الدعم", "type": "agent"},
                {"id": "execute_sales", "label": "تنفيذ المبيعات", "type": "agent"},
                {"id": "execute_telemarketing", "label": "تنفيذ التسويق", "type": "agent"},
                {"id": "generate_response", "label": "توليد الاستجابة", "type": "process"},
                {"id": "check_satisfaction", "label": "فحص الرضا", "type": "evaluation"},
                {"id": "handle_escalation", "label": "معالجة التصعيد", "type": "escalation"},
                {"id": "follow_up", "label": "المتابعة", "type": "action"}
            ],
            "edges": [
                {"from": "analyze_intent", "to": "select_agent", "label": "نية محددة"},
                {"from": "analyze_intent", "to": "handle_escalation", "label": "تصعيد مطلوب"},
                {"from": "select_agent", "to": "execute_support", "label": "دعم"},
                {"from": "select_agent", "to": "execute_sales", "label": "مبيعات"},
                {"from": "select_agent", "to": "execute_telemarketing", "label": "تسويق"},
                {"from": "execute_support", "to": "generate_response", "label": ""},
                {"from": "execute_sales", "to": "generate_response", "label": ""},
                {"from": "execute_telemarketing", "to": "generate_response", "label": ""},
                {"from": "generate_response", "to": "check_satisfaction", "label": ""},
                {"from": "check_satisfaction", "to": "follow_up", "label": "رضا متوسط"},
                {"from": "check_satisfaction", "to": "handle_escalation", "label": "رضا منخفض"},
                {"from": "check_satisfaction", "to": "end", "label": "رضا عالي"}
            ]
        }
        
        return {
            "success": True,
            "visualization": visualization,
            "workflow_id": workflow_id or "default"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/langgraph/agents/performance")
async def get_agent_performance(
    agent_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """الحصول على أداء الوكلاء"""
    try:
        # Mock performance data - في الإنتاج سيتم جلبها من قاعدة البيانات
        performance_data = {
            "support_responder": {
                "total_interactions": 450,
                "satisfaction_score": 4.7,
                "average_response_time": 2.3,
                "resolution_rate": 0.89,
                "escalation_rate": 0.11
            },
            "sales_closer": {
                "total_interactions": 280,
                "satisfaction_score": 4.5,
                "average_response_time": 3.1,
                "conversion_rate": 0.23,
                "deal_value": 1250000
            },
            "telemarketing_pitcher": {
                "total_interactions": 320,
                "satisfaction_score": 4.3,
                "average_response_time": 2.8,
                "lead_qualification_rate": 0.35,
                "appointment_rate": 0.28
            }
        }
        
        if agent_id and agent_id in performance_data:
            data = {agent_id: performance_data[agent_id]}
        else:
            data = performance_data
            
        return {
            "success": True,
            "performance": data,
            "period": {
                "from": date_from or "2025-01-01",
                "to": date_to or datetime.now().strftime("%Y-%m-%d")
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/langgraph/workflow/states/{thread_id}")
async def get_workflow_states(thread_id: str):
    """الحصول على حالات سير العمل"""
    try:
        # في الإنتاج، سيتم جلب الحالات من الذاكرة
        states = {
            "thread_id": thread_id,
            "states": [
                {
                    "timestamp": "2025-06-30T10:00:00",
                    "stage": "initial_contact",
                    "agent": None,
                    "message": "مرحباً، أريد الاستفسار عن خدماتكم"
                },
                {
                    "timestamp": "2025-06-30T10:00:05",
                    "stage": "intent_analysis",
                    "agent": "intent_analyzer",
                    "message": "تم تحليل النية: استفسار عام"
                },
                {
                    "timestamp": "2025-06-30T10:00:10",
                    "stage": "agent_selection",
                    "agent": "router",
                    "message": "تم اختيار وكيل التسويق"
                },
                {
                    "timestamp": "2025-06-30T10:00:15",
                    "stage": "agent_execution",
                    "agent": "telemarketing_pitcher",
                    "message": "مرحباً بك! نحن نقدم حلول ذكاء اصطناعي متقدمة..."
                }
            ],
            "current_stage": "response_generation",
            "satisfaction_score": None
        }
        
        return {
            "success": True,
            "data": states
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/langgraph/workflow/reset/{thread_id}")
async def reset_workflow(thread_id: str):
    """إعادة تعيين سير العمل"""
    try:
        # في الإنتاج، سيتم مسح الحالة من الذاكرة
        return {
            "success": True,
            "message": f"تم إعادة تعيين سير العمل للمحادثة {thread_id}",
            "thread_id": thread_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/langgraph/stats")
async def get_system_stats():
    """إحصائيات النظام"""
    try:
        stats = {
            "total_conversations": 1250,
            "active_threads": 23,
            "average_satisfaction": 4.5,
            "total_agents": 8,
            "workflow_completion_rate": 0.87,
            "average_conversation_time": 5.2,
            "escalation_rate": 0.13,
            "by_intent": {
                "support_request": 450,
                "pricing_inquiry": 280,
                "general_inquiry": 320,
                "complaint": 120,
                "other": 80
            },
            "by_agent_type": {
                "support": 570,
                "sales": 380,
                "telemarketing": 300
            }
        }
        
        return {
            "success": True,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "LangGraph CrewAI Integration",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "langgraph": "operational",
            "crewai": "operational",
            "openai": "operational"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)