"""
CrewAI Customer Service System
نظام خدمة العملاء الذكي باستخدام CrewAI
"""

import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from pydantic import BaseModel, Field
import asyncio
from enum import Enum

# Configure OpenAI
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY") or "sk-placeholder"
)

class CustomerType(str, Enum):
    """أنواع العملاء"""
    COLD = "cold"
    WARM = "warm"
    HOT = "hot"

class CustomerProfile(BaseModel):
    """ملف العميل الشخصي"""
    customer_id: str
    name: Optional[str] = None
    type: CustomerType = CustomerType.COLD
    interests: List[str] = Field(default_factory=list)
    objections: List[str] = Field(default_factory=list)
    budget: Optional[float] = None
    timeline: Optional[str] = None
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)

class AgentResponse(BaseModel):
    """استجابة الوكيل"""
    agent_id: str
    agent_name: str
    response: str
    next_action: Optional[str] = None
    confidence: float = 0.9
    metadata: Dict[str, Any] = Field(default_factory=dict)

# Customer Service Agents
class SupportResponderAgent:
    """وكيل مستجيب الدعم"""
    
    def __init__(self):
        self.agent = Agent(
            role="مستجيب الدعم الفني",
            goal="الترحيب بالعملاء وحل مشاكلهم بسرعة واحترافية",
            backstory="""أنت موظف دعم محترف ومتعاطف، تتمتع بخبرة واسعة في حل المشاكل التقنية.
            تتحدث باللغة العربية بطلاقة وتفهم احتياجات العملاء السعوديين جيداً.
            هدفك هو توفير تجربة دعم ممتازة وحل المشاكل بأسرع وقت ممكن.""",
            verbose=True,
            allow_delegation=True,
            llm=llm,
            tools=[]
        )
    
    def create_task(self, customer_message: str, profile: CustomerProfile) -> Task:
        return Task(
            description=f"""
            رسالة العميل: {customer_message}
            
            المطلوب:
            1. رحب بالعميل بشكل احترافي
            2. حدد المشكلة أو الاستفسار
            3. اشرح الحل بشكل مبسط وواضح
            4. إذا كانت المشكلة معقدة، أحلها للموظف البشري
            
            معلومات العميل:
            - النوع: {profile.type}
            - الاهتمامات: {', '.join(profile.interests)}
            """,
            expected_output="رد احترافي يحل مشكلة العميل أو يجيب على استفساره",
            agent=self.agent
        )

class TicketCreatorAgent:
    """وكيل منشئ التذاكر"""
    
    def __init__(self):
        self.agent = Agent(
            role="منشئ تذاكر الدعم",
            goal="توثيق مشاكل العملاء وإنشاء تذاكر دعم منظمة",
            backstory="""أنت متخصص في توثيق المشاكل وإنشاء التذاكر.
            تهتم بالتفاصيل وتحرص على تسجيل كل المعلومات المهمة.
            تطمئن العملاء أن مشاكلهم قيد المتابعة.""",
            verbose=True,
            llm=llm
        )
    
    def create_task(self, issue_description: str, customer_id: str) -> Task:
        return Task(
            description=f"""
            إنشاء تذكرة دعم للعميل {customer_id}
            
            وصف المشكلة: {issue_description}
            
            المطلوب:
            1. إنشاء رقم تذكرة فريد
            2. تصنيف المشكلة (تقني، مالي، استفسار عام، إلخ)
            3. تحديد الأولوية (عالية، متوسطة، منخفضة)
            4. إرسال رسالة تأكيد للعميل مع رقم التذكرة
            """,
            expected_output="تذكرة دعم منظمة مع رسالة تأكيد للعميل",
            agent=self.agent
        )

class FeedbackCollectorAgent:
    """وكيل جامع التعليقات"""
    
    def __init__(self):
        self.agent = Agent(
            role="جامع تعليقات العملاء",
            goal="جمع تقييمات العملاء بطريقة ودية وغير متطفلة",
            backstory="""أنت متخصص في جمع آراء العملاء.
            تسأل بلطف عن تجربتهم وتشكرهم على وقتهم.
            تحرص على عدم إزعاج العملاء.""",
            verbose=True,
            llm=llm
        )
    
    def create_task(self, service_type: str) -> Task:
        return Task(
            description=f"""
            اطلب من العميل تقييم خدمة {service_type}
            
            المطلوب:
            1. اسأل بلطف عن رأي العميل
            2. اطلب تقييم من 1-5 نجوم
            3. اسأل عن اقتراحات للتحسين
            4. اشكر العميل على وقته
            
            كن مختصراً ولطيفاً
            """,
            expected_output="طلب تقييم ودي ومختصر",
            agent=self.agent
        )

# Telemarketing Agents
class TelemarketingPitcherAgent:
    """وكيل التسويق الهاتفي"""
    
    def __init__(self):
        self.agent = Agent(
            role="مسوق هاتفي محترف",
            goal="خلق اهتمام سريع بالمنتجات والخدمات",
            backstory="""أنت مسوق ذكي تعرف كيف تجذب انتباه العملاء بسرعة.
            تستخدم أسئلة ذكية وعروض مختصرة.
            لا تضيع وقت العميل وتذهب مباشرة للنقطة المهمة.""",
            verbose=True,
            llm=llm
        )
    
    def create_task(self, product_type: str, customer_profile: CustomerProfile) -> Task:
        return Task(
            description=f"""
            قدم عرض سريع عن {product_type} للعميل
            
            معلومات العميل:
            - الاهتمامات: {', '.join(customer_profile.interests)}
            - النوع: {customer_profile.type}
            
            المطلوب:
            1. ابدأ بسؤال ذكي يجذب الانتباه
            2. قدم العرض في سطرين كحد أقصى
            3. اسأل العميل إن كان يريد معرفة المزيد
            
            كن جذاباً ومختصراً
            """,
            expected_output="عرض تسويقي جذاب ومختصر مع سؤال للمتابعة",
            agent=self.agent
        )

class LeadQualifierAgent:
    """وكيل تأهيل العملاء المحتملين"""
    
    def __init__(self):
        self.agent = Agent(
            role="مؤهل العملاء المحتملين",
            goal="تحديد العملاء المؤهلين وجمع معلومات مهمة",
            backstory="""أنت محلل ذكي تعرف كيف تحدد العملاء الجادين.
            تسأل أسئلة استراتيجية عن الميزانية والقرار والتوقيت.
            تسجل كل المعلومات بدقة.""",
            verbose=True,
            llm=llm
        )
    
    def create_task(self, customer_responses: List[str]) -> Task:
        return Task(
            description=f"""
            حلل إجابات العميل وحدد مستوى تأهيله
            
            إجابات العميل: {customer_responses}
            
            المطلوب:
            1. قيّم الميزانية المتوقعة
            2. حدد صلاحية اتخاذ القرار
            3. افهم التوقيت المناسب
            4. صنف العميل (ساخن، دافئ، بارد)
            
            اسأل أسئلة ذكية ولبقة
            """,
            expected_output="تقييم شامل لتأهيل العميل مع التصنيف",
            agent=self.agent
        )

# Telesales Agents
class SalesCloserAgent:
    """وكيل إغلاق الصفقات"""
    
    def __init__(self):
        self.agent = Agent(
            role="مختتم صفقات محترف",
            goal="تحويل العملاء المهتمين إلى مشترين فعليين",
            backstory="""أنت بائع محترف تعرف كيف تغلق الصفقات.
            واثق ومقنع، تقدم عروض لا تُقاوم.
            تعرف متى تضغط ومتى تتراجع.""",
            verbose=True,
            llm=llm
        )
    
    def create_task(self, customer_profile: CustomerProfile, offer_details: Dict[str, Any]) -> Task:
        return Task(
            description=f"""
            أغلق الصفقة مع العميل
            
            معلومات العميل:
            - النوع: {customer_profile.type}
            - الاعتراضات: {', '.join(customer_profile.objections)}
            - الميزانية: {customer_profile.budget}
            
            تفاصيل العرض: {json.dumps(offer_details, ensure_ascii=False)}
            
            المطلوب:
            1. قدم العرض بشكل مقنع
            2. أضف خصم أو ميزة إضافية
            3. أجب على الاعتراضات
            4. احث على اتخاذ القرار الآن
            """,
            expected_output="عرض نهائي مقنع مع دعوة واضحة للعمل",
            agent=self.agent
        )

class AppointmentSchedulerAgent:
    """وكيل جدولة المواعيد"""
    
    def __init__(self):
        self.agent = Agent(
            role="منسق المواعيد",
            goal="جدولة المواعيد والاجتماعات بكفاءة",
            backstory="""أنت منظم ممتاز تحرص على راحة العملاء.
            تقترح أوقات مناسبة وترسل تذكيرات.
            تتأكد من عدم وجود تعارضات في المواعيد.""",
            verbose=True,
            llm=llm
        )
    
    def create_task(self, customer_preference: str, available_slots: List[str]) -> Task:
        return Task(
            description=f"""
            احجز موعد للعميل
            
            تفضيل العميل: {customer_preference}
            الأوقات المتاحة: {', '.join(available_slots)}
            
            المطلوب:
            1. اقترح 3 أوقات مناسبة
            2. اسأل عن التفضيل
            3. أرسل رابط التقويم
            4. أكد الموعد
            """,
            expected_output="اقتراح مواعيد منظم مع رابط للحجز",
            agent=self.agent
        )

class ObjectionHandlerAgent:
    """وكيل معالج الاعتراضات"""
    
    def __init__(self):
        self.agent = Agent(
            role="معالج اعتراضات محترف",
            goal="تحويل الاعتراضات إلى فرص بيع",
            backstory="""أنت خبير في علم النفس البيعي.
            تفهم مخاوف العملاء وتعالجها بحكمة.
            صبور ومطمئن، تبني الثقة تدريجياً.""",
            verbose=True,
            llm=llm
        )
    
    def create_task(self, objection: str, product_benefits: List[str]) -> Task:
        return Task(
            description=f"""
            تعامل مع اعتراض العميل
            
            الاعتراض: {objection}
            فوائد المنتج: {', '.join(product_benefits)}
            
            المطلوب:
            1. اعترف بمخاوف العميل
            2. قدم حلول منطقية
            3. اذكر قصص نجاح
            4. اطمئن العميل
            
            كن متفهماً وصبوراً
            """,
            expected_output="رد احترافي يعالج الاعتراض ويبني الثقة",
            agent=self.agent
        )

class CustomerServiceCrew:
    """فريق خدمة العملاء الذكي"""
    
    def __init__(self):
        # Initialize all agents
        self.support_responder = SupportResponderAgent()
        self.ticket_creator = TicketCreatorAgent()
        self.feedback_collector = FeedbackCollectorAgent()
        self.telemarketing_pitcher = TelemarketingPitcherAgent()
        self.lead_qualifier = LeadQualifierAgent()
        self.sales_closer = SalesCloserAgent()
        self.appointment_scheduler = AppointmentSchedulerAgent()
        self.objection_handler = ObjectionHandlerAgent()
        
        self.all_agents = {
            'support': [self.support_responder, self.ticket_creator, self.feedback_collector],
            'telemarketing': [self.telemarketing_pitcher, self.lead_qualifier],
            'telesales': [self.sales_closer, self.appointment_scheduler, self.objection_handler]
        }
    
    def detect_intent(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """كشف نية العميل"""
        # Simple intent detection - can be enhanced with ML
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['مشكلة', 'خطأ', 'لا يعمل', 'مساعدة']):
            return {
                'intent': 'support',
                'confidence': 0.9,
                'suggested_agent': 'support_responder'
            }
        elif any(word in message_lower for word in ['عرض', 'سعر', 'خدمة', 'منتج']):
            return {
                'intent': 'sales',
                'confidence': 0.85,
                'suggested_agent': 'telemarketing_pitcher'
            }
        elif any(word in message_lower for word in ['موعد', 'اجتماع', 'مكالمة']):
            return {
                'intent': 'scheduling',
                'confidence': 0.9,
                'suggested_agent': 'appointment_scheduler'
            }
        else:
            return {
                'intent': 'general',
                'confidence': 0.7,
                'suggested_agent': 'support_responder'
            }
    
    def execute_workflow(self, message: str, customer_profile: CustomerProfile) -> Dict[str, Any]:
        """تنفيذ سير عمل خدمة العملاء"""
        try:
            # Detect intent
            intent_result = self.detect_intent(message, {
                'profile': customer_profile.dict()
            })
            
            # Select primary agent based on intent
            if intent_result['suggested_agent'] == 'support_responder':
                task = self.support_responder.create_task(message, customer_profile)
                crew = Crew(
                    agents=[self.support_responder.agent],
                    tasks=[task],
                    process=Process.sequential
                )
            elif intent_result['suggested_agent'] == 'telemarketing_pitcher':
                task = self.telemarketing_pitcher.create_task("منتجاتنا المميزة", customer_profile)
                crew = Crew(
                    agents=[self.telemarketing_pitcher.agent],
                    tasks=[task],
                    process=Process.sequential
                )
            elif intent_result['suggested_agent'] == 'appointment_scheduler':
                available_slots = ["الأحد 10 صباحاً", "الإثنين 2 ظهراً", "الثلاثاء 4 عصراً"]
                task = self.appointment_scheduler.create_task(message, available_slots)
                crew = Crew(
                    agents=[self.appointment_scheduler.agent],
                    tasks=[task],
                    process=Process.sequential
                )
            else:
                # Default to support
                task = self.support_responder.create_task(message, customer_profile)
                crew = Crew(
                    agents=[self.support_responder.agent],
                    tasks=[task],
                    process=Process.sequential
                )
            
            # Execute crew
            result = crew.kickoff()
            
            # Prepare response
            response = {
                'success': True,
                'intent': intent_result,
                'primary_response': {
                    'agent_id': intent_result['suggested_agent'],
                    'agent_name': self._get_agent_name(intent_result['suggested_agent']),
                    'response': str(result),
                    'confidence': intent_result['confidence']
                },
                'workflow': [intent_result['suggested_agent']],
                'customer_profile': customer_profile.dict(),
                'timestamp': datetime.now().isoformat()
            }
            
            # Update conversation history
            customer_profile.conversation_history.append({
                'role': 'user',
                'content': message,
                'timestamp': datetime.now().isoformat()
            })
            customer_profile.conversation_history.append({
                'role': 'assistant',
                'content': str(result),
                'agent': intent_result['suggested_agent'],
                'timestamp': datetime.now().isoformat()
            })
            
            return response
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _get_agent_name(self, agent_id: str) -> str:
        """الحصول على اسم الوكيل"""
        agent_names = {
            'support_responder': 'مستجيب الدعم',
            'ticket_creator': 'منشئ التذاكر',
            'feedback_collector': 'جامع التعليقات',
            'telemarketing_pitcher': 'المسوق الهاتفي',
            'lead_qualifier': 'مؤهل العملاء',
            'sales_closer': 'مختتم الصفقات',
            'appointment_scheduler': 'منسق المواعيد',
            'objection_handler': 'معالج الاعتراضات'
        }
        return agent_names.get(agent_id, 'وكيل')

# FastAPI integration (if needed)
def create_customer_profile(customer_id: str, name: Optional[str] = None) -> CustomerProfile:
    """إنشاء ملف عميل جديد"""
    return CustomerProfile(
        customer_id=customer_id,
        name=name,
        type=CustomerType.COLD,
        conversation_history=[]
    )

# Main execution
if __name__ == "__main__":
    # Test the crew
    crew = CustomerServiceCrew()
    
    # Create test customer
    test_customer = create_customer_profile("test_001", "أحمد محمد")
    
    # Test messages
    test_messages = [
        "عندي مشكلة في تسجيل الدخول",
        "عندكم عروض على خدمات التسويق؟",
        "أبغى أحجز موعد لمناقشة احتياجاتي",
        "السعر غالي شوي، في خصم؟"
    ]
    
    for message in test_messages:
        print(f"\n{'='*50}")
        print(f"رسالة العميل: {message}")
        print(f"{'='*50}")
        
        result = crew.execute_workflow(message, test_customer)
        
        if result['success']:
            print(f"النية المكتشفة: {result['intent']['intent']}")
            print(f"الوكيل: {result['primary_response']['agent_name']}")
            print(f"الرد: {result['primary_response']['response']}")
        else:
            print(f"خطأ: {result['error']}")