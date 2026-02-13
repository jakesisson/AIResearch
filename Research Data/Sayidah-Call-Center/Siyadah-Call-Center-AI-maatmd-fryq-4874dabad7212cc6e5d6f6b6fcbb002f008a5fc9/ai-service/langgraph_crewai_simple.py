"""
LangGraph + CrewAI Simplified Integration
نظام تكامل مبسط بين LangGraph و CrewAI
"""

import os
import json
from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.pydantic_v1 import SecretStr
from enum import Enum

# Import existing CrewAI system
from crewai_system import (
    CustomerServiceCrew,
    CustomerProfile,
    CustomerType,
    create_customer_profile
)

# Configure OpenAI
openai_api_key = os.getenv("OPENAI_API_KEY", "sk-placeholder")

class WorkflowState(TypedDict):
    """حالة سير العمل"""
    messages: List[Dict[str, str]]
    customer_id: str
    customer_profile: Dict[str, Any]
    current_intent: Optional[str]
    selected_agents: List[str]
    agent_responses: List[Dict[str, Any]]
    workflow_stage: str
    final_response: Optional[str]
    metadata: Dict[str, Any]

class LangGraphCrewAISystem:
    """نظام LangGraph المتكامل مع CrewAI"""
    
    def __init__(self):
        self.crew_system = CustomerServiceCrew()
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.7,
            api_key=openai_api_key  # LangChain accepts string directly
        )
        self.graph = self._build_graph()
        
    def _build_graph(self):
        """بناء رسم بياني لسير العمل"""
        workflow = StateGraph(WorkflowState)
        
        # تعريف العقد
        workflow.add_node("start", self.start_node)
        workflow.add_node("analyze_intent", self.analyze_intent_node)
        workflow.add_node("route_to_agents", self.route_to_agents_node)
        workflow.add_node("execute_agents", self.execute_agents_node)
        workflow.add_node("generate_response", self.generate_response_node)
        workflow.add_node("end", self.end_node)
        
        # إضافة الحواف
        workflow.add_edge("start", "analyze_intent")
        workflow.add_edge("analyze_intent", "route_to_agents")
        workflow.add_edge("route_to_agents", "execute_agents")
        workflow.add_edge("execute_agents", "generate_response")
        workflow.add_edge("generate_response", "end")
        
        # تعيين نقطة البداية والنهاية
        workflow.set_entry_point("start")
        workflow.set_finish_point("end")
        
        return workflow.compile()
    
    def start_node(self, state: WorkflowState) -> WorkflowState:
        """بداية سير العمل"""
        state["workflow_stage"] = "started"
        state["metadata"]["start_time"] = datetime.now().isoformat()
        return state
    
    def analyze_intent_node(self, state: WorkflowState) -> WorkflowState:
        """تحليل نية العميل"""
        last_message = state["messages"][-1]["content"] if state["messages"] else ""
        
        # استخدام نظام CrewAI لتحليل النية
        intent_result = self.crew_system.detect_intent(
            last_message,
            state.get("metadata", {})
        )
        
        state["current_intent"] = intent_result["intent"]
        state["workflow_stage"] = "intent_analyzed"
        state["metadata"]["intent_confidence"] = intent_result.get("confidence", 0)
        
        return state
    
    def route_to_agents_node(self, state: WorkflowState) -> WorkflowState:
        """توجيه إلى الوكلاء المناسبين"""
        intent = state["current_intent"]
        
        # خريطة النوايا إلى الوكلاء
        intent_to_agents = {
            "support_request": ["support_responder", "ticket_creator"],
            "complaint": ["support_responder", "feedback_collector"],
            "technical_issue": ["support_responder", "ticket_creator"],
            "pricing_inquiry": ["sales_closer"],
            "product_interest": ["telemarketing_pitcher", "lead_qualifier"],
            "purchase_intent": ["sales_closer", "appointment_scheduler"],
            "objection": ["objection_handler"],
            "general_inquiry": ["support_responder"]
        }
        
        selected_agents = intent_to_agents.get(intent, ["support_responder"])
        state["selected_agents"] = selected_agents
        state["workflow_stage"] = "agents_selected"
        
        return state
    
    def execute_agents_node(self, state: WorkflowState) -> WorkflowState:
        """تنفيذ الوكلاء المختارين"""
        customer_profile = create_customer_profile(
            state["customer_id"],
            state["customer_profile"].get("name", "عميل")
        )
        
        # تنفيذ سير عمل CrewAI
        last_message = state["messages"][-1]["content"] if state["messages"] else ""
        crew_result = self.crew_system.execute_workflow(last_message, customer_profile)
        
        # تخزين النتائج
        state["agent_responses"].append({
            "timestamp": datetime.now().isoformat(),
            "result": crew_result,
            "agents_used": state["selected_agents"]
        })
        
        state["workflow_stage"] = "agents_executed"
        
        return state
    
    def generate_response_node(self, state: WorkflowState) -> WorkflowState:
        """توليد الاستجابة النهائية"""
        # استخراج الاستجابة من نتائج CrewAI
        last_result = state["agent_responses"][-1]["result"] if state["agent_responses"] else {}
        
        final_response = last_result.get("response", "عذراً، لم أتمكن من معالجة طلبك.")
        
        state["final_response"] = final_response
        state["workflow_stage"] = "response_generated"
        
        return state
    
    def end_node(self, state: WorkflowState) -> WorkflowState:
        """نهاية سير العمل"""
        state["workflow_stage"] = "completed"
        state["metadata"]["end_time"] = datetime.now().isoformat()
        
        # حساب وقت المعالجة
        if "start_time" in state["metadata"]:
            start_time = datetime.fromisoformat(state["metadata"]["start_time"])
            end_time = datetime.fromisoformat(state["metadata"]["end_time"])
            state["metadata"]["processing_time"] = (end_time - start_time).total_seconds()
        
        return state
    
    def process_message(
        self,
        message: str,
        customer_id: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """معالجة رسالة العميل"""
        # إنشاء الحالة الأولية
        initial_state: WorkflowState = {
            "messages": conversation_history or [],
            "customer_id": customer_id,
            "customer_profile": {"id": customer_id, "name": f"عميل {customer_id}"},
            "current_intent": None,
            "selected_agents": [],
            "agent_responses": [],
            "workflow_stage": "initialized",
            "final_response": None,
            "metadata": {}
        }
        
        # إضافة الرسالة الجديدة
        initial_state["messages"].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # تشغيل الرسم البياني
        try:
            final_state = self.graph.invoke(initial_state)
            
            # إضافة الاستجابة إلى تاريخ المحادثة
            if final_state["final_response"]:
                final_state["messages"].append({
                    "role": "assistant",
                    "content": final_state["final_response"],
                    "timestamp": datetime.now().isoformat()
                })
            
            return {
                "success": True,
                "response": final_state["final_response"],
                "workflow_stage": final_state["workflow_stage"],
                "agents_used": final_state["selected_agents"],
                "intent": final_state["current_intent"],
                "metadata": final_state["metadata"],
                "conversation_history": final_state["messages"]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response": "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى."
            }

# إنشاء مثيل من النظام
langgraph_system = LangGraphCrewAISystem()