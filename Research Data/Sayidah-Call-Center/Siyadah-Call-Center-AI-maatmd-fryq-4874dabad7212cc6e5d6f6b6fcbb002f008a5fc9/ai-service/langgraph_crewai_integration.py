"""
LangGraph + CrewAI Integration System
نظام تكامل LangGraph مع CrewAI للوكلاء الذكيين
"""

import os
import json
from typing import TypedDict, Annotated, List, Dict, Any, Optional, Sequence, Union
from datetime import datetime
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
import operator
from enum import Enum

# Import existing CrewAI system
from crewai_system import (
    CustomerServiceCrew,
    CustomerProfile,
    CustomerType,
    create_customer_profile,
    SupportResponderAgent,
    TicketCreatorAgent,
    FeedbackCollectorAgent,
    TelemarketingPitcherAgent,
    LeadQualifierAgent,
    SalesCloserAgent,
    AppointmentSchedulerAgent,
    ObjectionHandlerAgent
)

# Configure OpenAI
from langchain_core.utils import SecretStr

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY") or "sk-placeholder"
)

class ConversationState(TypedDict):
    """حالة المحادثة"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    customer_profile: CustomerProfile
    current_intent: Optional[str]
    selected_agent: Optional[str]
    agent_responses: List[Dict[str, Any]]
    workflow_stage: str
    next_actions: List[str]
    context: Dict[str, Any]
    escalation_needed: bool
    satisfaction_score: Optional[float]

class WorkflowStage(str, Enum):
    """مراحل سير العمل"""
    INITIAL_CONTACT = "initial_contact"
    INTENT_ANALYSIS = "intent_analysis"
    AGENT_SELECTION = "agent_selection"
    AGENT_EXECUTION = "agent_execution"
    RESPONSE_GENERATION = "response_generation"
    FOLLOW_UP = "follow_up"
    ESCALATION = "escalation"
    COMPLETION = "completion"

class LangGraphCrewAIOrchestrator:
    """منسق LangGraph لنظام CrewAI"""
    
    def __init__(self):
        self.crew_system = CustomerServiceCrew()
        self.checkpointer = MemorySaver()
        self.graph = self._build_graph()
        
    def _build_graph(self):
        """بناء رسم بياني لسير العمل"""
        workflow = StateGraph(ConversationState)
        
        # إضافة العقد
        workflow.add_node("analyze_intent", self.analyze_intent)
        workflow.add_node("select_agent", self.select_agent)
        workflow.add_node("execute_support", self.execute_support_agent)
        workflow.add_node("execute_sales", self.execute_sales_agent)
        workflow.add_node("execute_telemarketing", self.execute_telemarketing_agent)
        workflow.add_node("generate_response", self.generate_response)
        workflow.add_node("check_satisfaction", self.check_satisfaction)
        workflow.add_node("handle_escalation", self.handle_escalation)
        workflow.add_node("follow_up", self.follow_up)
        
        # تعيين نقطة البداية
        workflow.set_entry_point("analyze_intent")
        
        # إضافة الحواف الشرطية
        workflow.add_conditional_edges(
            "analyze_intent",
            self.route_based_on_intent,
            {
                "select_agent": "select_agent",
                "escalation": "handle_escalation"
            }
        )
        
        workflow.add_conditional_edges(
            "select_agent",
            self.route_to_agent,
            {
                "support": "execute_support",
                "sales": "execute_sales",
                "telemarketing": "execute_telemarketing"
            }
        )
        
        # ربط تنفيذ الوكلاء بتوليد الاستجابة
        workflow.add_edge("execute_support", "generate_response")
        workflow.add_edge("execute_sales", "generate_response")
        workflow.add_edge("execute_telemarketing", "generate_response")
        
        # من توليد الاستجابة إلى فحص الرضا
        workflow.add_edge("generate_response", "check_satisfaction")
        
        # من فحص الرضا
        workflow.add_conditional_edges(
            "check_satisfaction",
            self.route_after_satisfaction,
            {
                "follow_up": "follow_up",
                "escalation": "handle_escalation",
                "end": END
            }
        )
        
        # من المتابعة والتصعيد إلى النهاية
        workflow.add_edge("follow_up", END)
        workflow.add_edge("handle_escalation", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def analyze_intent(self, state: ConversationState) -> ConversationState:
        """تحليل نية العميل"""
        messages = state["messages"]
        last_message = ""
        if messages:
            msg = messages[-1]
            if hasattr(msg, 'content'):
                last_message = str(msg.content)
            else:
                last_message = str(msg)
        
        # استخدام نظام CrewAI لتحليل النية
        intent_result = self.crew_system.detect_intent(
            last_message,
            state.get("context", {})
        )
        
        state["current_intent"] = intent_result["intent"]
        state["workflow_stage"] = WorkflowStage.INTENT_ANALYSIS
        
        # إضافة رسالة تحليل
        analysis_message = AIMessage(
            content=f"تم تحليل النية: {intent_result['intent']} (ثقة: {intent_result['confidence']}%)"
        )
        # Create new list instead of appending to Sequence
        state["messages"] = list(state["messages"]) + [analysis_message]
        
        # التحقق من الحاجة للتصعيد
        if intent_result.get("requires_escalation", False):
            state["escalation_needed"] = True
            
        return state
    
    def route_based_on_intent(self, state: ConversationState) -> str:
        """توجيه بناءً على النية"""
        if state.get("escalation_needed", False):
            return "escalation"
        return "select_agent"
    
    async def select_agent(self, state: ConversationState) -> ConversationState:
        """اختيار الوكيل المناسب"""
        intent = state["current_intent"]
        
        # خريطة النوايا إلى أنواع الوكلاء
        intent_to_agent_type = {
            "support_request": "support",
            "complaint": "support",
            "technical_issue": "support",
            "pricing_inquiry": "sales",
            "product_interest": "sales",
            "purchase_intent": "sales",
            "general_inquiry": "telemarketing",
            "information_request": "telemarketing"
        }
        
        agent_type = intent_to_agent_type.get(intent, "support")
        state["selected_agent"] = agent_type
        state["workflow_stage"] = WorkflowStage.AGENT_SELECTION
        
        return state
    
    def route_to_agent(self, state: ConversationState) -> str:
        """توجيه إلى الوكيل المحدد"""
        return state["selected_agent"]
    
    async def execute_support_agent(self, state: ConversationState) -> ConversationState:
        """تنفيذ وكيل الدعم"""
        messages = state["messages"]
        last_message = messages[-1].content if messages else ""
        profile = state["customer_profile"]
        
        # إنشاء وكلاء الدعم
        support_agent = SupportResponderAgent()
        ticket_agent = TicketCreatorAgent()
        feedback_agent = FeedbackCollectorAgent()
        
        # تنفيذ المهام
        responses = []
        
        # الاستجابة للدعم
        support_response = await self._execute_agent_task(
            support_agent.create_task(last_message, profile)
        )
        responses.append({
            "agent": "support_responder",
            "response": support_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # إنشاء تذكرة إذا لزم الأمر
        if "مشكلة" in last_message or "خطأ" in last_message:
            ticket_response = await self._execute_agent_task(
                ticket_agent.create_task(last_message, profile.customer_id)
            )
            responses.append({
                "agent": "ticket_creator",
                "response": ticket_response,
                "timestamp": datetime.now().isoformat()
            })
        
        state["agent_responses"] = responses
        state["workflow_stage"] = WorkflowStage.AGENT_EXECUTION
        
        return state
    
    async def execute_sales_agent(self, state: ConversationState) -> ConversationState:
        """تنفيذ وكيل المبيعات"""
        messages = state["messages"]
        last_message = messages[-1].content if messages else ""
        profile = state["customer_profile"]
        
        # إنشاء وكلاء المبيعات
        closer_agent = SalesCloserAgent()
        objection_agent = ObjectionHandlerAgent()
        
        responses = []
        
        # محاولة إغلاق الصفقة
        offer_details = {
            "product": "نظام سيادة AI المتكامل",
            "price": 45000,
            "features": ["ذكاء اصطناعي متقدم", "دعم 24/7", "تكامل كامل"]
        }
        
        closing_response = await self._execute_agent_task(
            closer_agent.create_task(profile, offer_details)
        )
        responses.append({
            "agent": "sales_closer",
            "response": closing_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # معالجة الاعتراضات إذا وجدت
        if any(word in last_message for word in ["غالي", "مكلف", "لكن", "بس"]):
            objection_response = await self._execute_agent_task(
                objection_agent.create_task(
                    last_message,
                    ["قيمة عالية", "عائد استثمار سريع", "دعم متواصل"]
                )
            )
            responses.append({
                "agent": "objection_handler",
                "response": objection_response,
                "timestamp": datetime.now().isoformat()
            })
        
        state["agent_responses"] = responses
        state["workflow_stage"] = WorkflowStage.AGENT_EXECUTION
        
        return state
    
    async def execute_telemarketing_agent(self, state: ConversationState) -> ConversationState:
        """تنفيذ وكيل التسويق الهاتفي"""
        messages = state["messages"]
        profile = state["customer_profile"]
        
        # إنشاء وكلاء التسويق
        pitcher_agent = TelemarketingPitcherAgent()
        qualifier_agent = LeadQualifierAgent()
        
        responses = []
        
        # عرض المنتج
        pitch_response = await self._execute_agent_task(
            pitcher_agent.create_task("AI solutions", profile)
        )
        responses.append({
            "agent": "telemarketing_pitcher",
            "response": pitch_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # تأهيل العميل
        customer_responses = [msg.content for msg in messages if isinstance(msg, HumanMessage)]
        qualification_response = await self._execute_agent_task(
            qualifier_agent.create_task(customer_responses)
        )
        responses.append({
            "agent": "lead_qualifier",
            "response": qualification_response,
            "timestamp": datetime.now().isoformat()
        })
        
        state["agent_responses"] = responses
        state["workflow_stage"] = WorkflowStage.AGENT_EXECUTION
        
        return state
    
    async def generate_response(self, state: ConversationState) -> ConversationState:
        """توليد الاستجابة النهائية"""
        agent_responses = state["agent_responses"]
        
        # دمج استجابات الوكلاء
        combined_response = self._combine_agent_responses(agent_responses)
        
        # إضافة الاستجابة النهائية
        final_message = AIMessage(
            content=combined_response,
            additional_kwargs={
                "agents_involved": [r["agent"] for r in agent_responses],
                "workflow_stage": state["workflow_stage"]
            }
        )
        state["messages"].append(final_message)
        state["workflow_stage"] = WorkflowStage.RESPONSE_GENERATION
        
        return state
    
    async def check_satisfaction(self, state: ConversationState) -> ConversationState:
        """فحص رضا العميل"""
        messages = state["messages"]
        
        # تحليل المشاعر والرضا
        satisfaction_prompt = f"""
        بناءً على المحادثة التالية، قيّم رضا العميل من 1-10:
        
        المحادثة:
        {self._format_messages(messages[-5:])}
        
        أعط تقييماً رقمياً فقط.
        """
        
        satisfaction_response = await llm.apredict(satisfaction_prompt)
        
        try:
            satisfaction_score = float(satisfaction_response.strip())
        except:
            satisfaction_score = 7.0
        
        state["satisfaction_score"] = satisfaction_score
        state["workflow_stage"] = WorkflowStage.COMPLETION
        
        return state
    
    def route_after_satisfaction(self, state: ConversationState) -> str:
        """التوجيه بعد فحص الرضا"""
        satisfaction = state.get("satisfaction_score", 7.0)
        
        if satisfaction < 5:
            return "escalation"
        elif satisfaction < 8:
            return "follow_up"
        else:
            return "end"
    
    async def handle_escalation(self, state: ConversationState) -> ConversationState:
        """معالجة التصعيد"""
        escalation_message = AIMessage(
            content="سيتم تحويلك إلى أحد المختصين للحصول على مساعدة إضافية. شكراً لصبرك.",
            additional_kwargs={"escalation": True}
        )
        state["messages"].append(escalation_message)
        state["workflow_stage"] = WorkflowStage.ESCALATION
        
        # إشعار النظام بالتصعيد
        state["next_actions"] = ["notify_human_agent", "create_priority_ticket"]
        
        return state
    
    async def follow_up(self, state: ConversationState) -> ConversationState:
        """المتابعة"""
        follow_up_message = AIMessage(
            content="هل هناك أي شيء آخر يمكنني مساعدتك فيه؟ نحن هنا لخدمتك.",
            additional_kwargs={"follow_up": True}
        )
        state["messages"].append(follow_up_message)
        state["workflow_stage"] = WorkflowStage.FOLLOW_UP
        
        # جدولة متابعة
        state["next_actions"] = ["schedule_follow_up", "send_satisfaction_survey"]
        
        return state
    
    async def _execute_agent_task(self, task) -> str:
        """تنفيذ مهمة الوكيل"""
        # محاكاة تنفيذ المهمة
        return f"تم تنفيذ المهمة: {task.description}"
    
    def _combine_agent_responses(self, responses: List[Dict[str, Any]]) -> str:
        """دمج استجابات الوكلاء"""
        if not responses:
            return "عذراً، لم أتمكن من معالجة طلبك."
        
        # أخذ أحدث استجابة كأساس
        main_response = responses[-1]["response"]
        
        # إضافة معلومات من الوكلاء الآخرين إذا لزم الأمر
        if len(responses) > 1:
            additional_info = "\n\nمعلومات إضافية:\n"
            for resp in responses[:-1]:
                additional_info += f"- {resp['response']}\n"
            main_response += additional_info
        
        return main_response
    
    def _format_messages(self, messages: List[BaseMessage]) -> str:
        """تنسيق الرسائل للعرض"""
        formatted = []
        for msg in messages:
            role = "العميل" if isinstance(msg, HumanMessage) else "المساعد"
            formatted.append(f"{role}: {msg.content}")
        return "\n".join(formatted)
    
    async def process_conversation(
        self,
        message: str,
        customer_id: str,
        thread_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """معالجة المحادثة"""
        # إنشاء أو استرجاع ملف العميل
        profile = create_customer_profile(customer_id, f"عميل {customer_id}")
        
        # إنشاء الحالة الأولية
        initial_state = ConversationState(
            messages=[HumanMessage(content=message)],
            customer_profile=profile,
            current_intent=None,
            selected_agent=None,
            agent_responses=[],
            workflow_stage=WorkflowStage.INITIAL_CONTACT,
            next_actions=[],
            context={},
            escalation_needed=False,
            satisfaction_score=None
        )
        
        # تشغيل الرسم البياني
        config = {"configurable": {"thread_id": thread_id or customer_id}}
        final_state = await self.graph.ainvoke(initial_state, config)
        
        # استخراج النتائج
        result = {
            "success": True,
            "response": final_state["messages"][-1].content if final_state["messages"] else "",
            "workflow_stage": final_state["workflow_stage"],
            "agents_involved": [r["agent"] for r in final_state.get("agent_responses", [])],
            "satisfaction_score": final_state.get("satisfaction_score"),
            "next_actions": final_state.get("next_actions", []),
            "thread_id": thread_id or customer_id
        }
        
        return result

# إنشاء مثيل من المنسق
orchestrator = LangGraphCrewAIOrchestrator()