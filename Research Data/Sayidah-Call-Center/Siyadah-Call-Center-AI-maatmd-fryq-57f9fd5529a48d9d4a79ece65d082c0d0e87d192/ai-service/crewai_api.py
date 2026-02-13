"""
FastAPI Service for CrewAI Customer Service System
خدمة FastAPI لنظام خدمة العملاء الذكي
"""

import os
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import uvicorn

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crewai_system import CustomerServiceCrew, CustomerProfile, CustomerType, create_customer_profile

# FastAPI app
app = FastAPI(
    title="CrewAI Customer Service API",
    description="نظام خدمة العملاء الذكي باستخدام CrewAI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CrewAI system
crew_system = CustomerServiceCrew()

# In-memory customer profiles storage (replace with database in production)
customer_profiles: Dict[str, CustomerProfile] = {}

# Request/Response Models
class ConversationMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ExecuteRequest(BaseModel):
    message: str
    customer_id: str
    customer_name: Optional[str] = None
    organization_id: str = "global"
    conversation_history: Optional[List[ConversationMessage]] = []

class AgentStats(BaseModel):
    agent_id: str
    agent_name: str
    total_interactions: int
    success_rate: float
    average_response_time: float
    last_active: Optional[str] = None

class DeployAgentsRequest(BaseModel):
    organization_id: str

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "CrewAI Customer Service",
        "status": "operational",
        "version": "1.0.0",
        "agents": {
            "support": ["support_responder", "ticket_creator", "feedback_collector"],
            "telemarketing": ["telemarketing_pitcher", "lead_qualifier"],
            "telesales": ["sales_closer", "appointment_scheduler", "objection_handler"]
        }
    }

@app.post("/api/crewai/execute")
async def execute_workflow(request: ExecuteRequest):
    """تنفيذ سير عمل خدمة العملاء"""
    try:
        # Get or create customer profile
        if request.customer_id not in customer_profiles:
            customer_profiles[request.customer_id] = create_customer_profile(
                request.customer_id,
                request.customer_name
            )
        
        profile = customer_profiles[request.customer_id]
        
        # Add conversation history if provided
        for msg in request.conversation_history:
            profile.conversation_history.append({
                'role': msg.role,
                'content': msg.content,
                'timestamp': msg.timestamp or datetime.now().isoformat()
            })
        
        # Execute crew workflow
        result = crew_system.execute_workflow(request.message, profile)
        
        # Save updated profile
        customer_profiles[request.customer_id] = profile
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crewai/agents")
async def get_agents(organization_id: str = "global"):
    """الحصول على قائمة الوكلاء"""
    agents_list = []
    
    # Support agents
    agents_list.extend([
        {
            "agent_id": "support_responder",
            "name": "Support Responder",
            "name_ar": "مستجيب الدعم",
            "type": "support",
            "group": "Customer Service",
            "group_ar": "خدمة العملاء",
            "active": True,
            "icon": "🧕"
        },
        {
            "agent_id": "ticket_creator",
            "name": "Ticket Creator",
            "name_ar": "منشئ التذاكر",
            "type": "support",
            "group": "Customer Service",
            "group_ar": "خدمة العملاء",
            "active": True,
            "icon": "🧾"
        },
        {
            "agent_id": "feedback_collector",
            "name": "Feedback Collector",
            "name_ar": "جامع التعليقات",
            "type": "support",
            "group": "Customer Service",
            "group_ar": "خدمة العملاء",
            "active": True,
            "icon": "📊"
        }
    ])
    
    # Telemarketing agents
    agents_list.extend([
        {
            "agent_id": "telemarketing_pitcher",
            "name": "Telemarketing Pitcher",
            "name_ar": "مسوق هاتفي",
            "type": "telemarketing",
            "group": "Telemarketing",
            "group_ar": "التسويق الهاتفي",
            "active": True,
            "icon": "🧲"
        },
        {
            "agent_id": "lead_qualifier",
            "name": "Lead Qualifier",
            "name_ar": "مؤهل العملاء المحتملين",
            "type": "telemarketing",
            "group": "Telemarketing",
            "group_ar": "التسويق الهاتفي",
            "active": True,
            "icon": "🎁"
        }
    ])
    
    # Telesales agents
    agents_list.extend([
        {
            "agent_id": "sales_closer",
            "name": "Sales Closer",
            "name_ar": "مختتم الصفقات",
            "type": "telesales",
            "group": "Telesales",
            "group_ar": "تلي سيلز",
            "active": True,
            "icon": "🧠"
        },
        {
            "agent_id": "appointment_scheduler",
            "name": "Appointment Scheduler",
            "name_ar": "منسق المواعيد",
            "type": "telesales",
            "group": "Telesales",
            "group_ar": "تلي سيلز",
            "active": True,
            "icon": "📅"
        },
        {
            "agent_id": "objection_handler",
            "name": "Objection Handler",
            "name_ar": "معالج الاعتراضات",
            "type": "telesales",
            "group": "Telesales",
            "group_ar": "تلي سيلز",
            "active": True,
            "icon": "💬"
        }
    ])
    
    return {
        "success": True,
        "agents": agents_list,
        "count": len(agents_list),
        "organization_id": organization_id
    }

@app.get("/api/crewai/stats/{organization_id}")
async def get_stats(organization_id: str):
    """إحصائيات الوكلاء"""
    # Mock stats for demonstration
    stats = {
        "total_agents": 8,
        "active_agents": 8,
        "total_interactions": 1250,
        "avg_rating": 4.6,
        "agent_groups": {
            "support": 3,
            "telemarketing": 2,
            "telesales": 3
        },
        "agents": [
            {
                "id": "support_responder",
                "name": "مستجيب الدعم",
                "type": "support",
                "metrics": {
                    "total_interactions": 450,
                    "successful_interactions": 420,
                    "average_rating": 4.8,
                    "last_active": datetime.now().isoformat()
                }
            },
            {
                "id": "telemarketing_pitcher",
                "name": "المسوق الهاتفي",
                "type": "telemarketing",
                "metrics": {
                    "total_interactions": 320,
                    "successful_interactions": 280,
                    "average_rating": 4.5,
                    "last_active": datetime.now().isoformat()
                }
            },
            {
                "id": "sales_closer",
                "name": "مختتم الصفقات",
                "type": "telesales",
                "metrics": {
                    "total_interactions": 180,
                    "successful_interactions": 165,
                    "average_rating": 4.7,
                    "last_active": datetime.now().isoformat()
                }
            }
        ]
    }
    
    return {
        "success": True,
        "stats": stats
    }

@app.post("/api/crewai/deploy-agents")
async def deploy_agents(request: DeployAgentsRequest):
    """نشر الوكلاء لمؤسسة"""
    return {
        "success": True,
        "message": f"تم نشر 8 وكلاء ذكيين للمؤسسة {request.organization_id}",
        "deployed": 8,
        "total": 8,
        "agents": await get_agents(request.organization_id)
    }

@app.post("/api/crewai/test")
async def test_agent(message: str, agent_id: str = "support_responder"):
    """اختبار وكيل محدد"""
    try:
        # Create test profile
        test_profile = create_customer_profile("test_customer", "عميل تجريبي")
        
        # Execute with specific agent (simplified)
        result = crew_system.execute_workflow(message, test_profile)
        
        return {
            "success": True,
            "response": result,
            "message": f"تم اختبار {crew_system._get_agent_name(agent_id)} بنجاح"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crewai/customer/{customer_id}")
async def get_customer_profile(customer_id: str):
    """الحصول على ملف العميل"""
    if customer_id in customer_profiles:
        profile = customer_profiles[customer_id]
        return {
            "success": True,
            "profile": profile.dict()
        }
    else:
        raise HTTPException(status_code=404, detail="Customer not found")

@app.post("/api/crewai/customer/{customer_id}/update-type")
async def update_customer_type(customer_id: str, customer_type: str):
    """تحديث نوع العميل"""
    if customer_id not in customer_profiles:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer_type not in ["cold", "warm", "hot"]:
        raise HTTPException(status_code=400, detail="Invalid customer type")
    
    customer_profiles[customer_id].type = CustomerType(customer_type)
    
    return {
        "success": True,
        "message": f"تم تحديث نوع العميل إلى {customer_type}",
        "profile": customer_profiles[customer_id].dict()
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "CrewAI Customer Service",
        "agents_loaded": True
    }

# Run the service
if __name__ == "__main__":
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️ Warning: OPENAI_API_KEY not set. Some features may not work.")
    
    print("🚀 Starting CrewAI Customer Service API...")
    print("📍 Service will be available at: http://localhost:8001")
    print("📖 API Documentation: http://localhost:8001/docs")
    
    uvicorn.run(
        "crewai_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )