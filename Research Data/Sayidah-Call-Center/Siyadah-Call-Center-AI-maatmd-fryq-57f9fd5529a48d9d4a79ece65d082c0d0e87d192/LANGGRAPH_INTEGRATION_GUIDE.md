# LangGraph + CrewAI Integration Guide

## Overview

The LangGraph integration enhances the existing CrewAI customer service system with stateful, multi-actor workflow management capabilities. This integration provides better orchestration for all 8 specialized Arabic-speaking agents across three groups: Customer Support, Telemarketing, and Telesales.

## Architecture

### System Components

1. **LangGraph Orchestrator** (`langgraph_crewai_integration.py`)
   - Manages conversation state and workflow stages
   - Routes conversations to appropriate agents
   - Tracks satisfaction and handles escalations
   - Provides checkpointing for conversation persistence

2. **CrewAI Integration** (`crewai_system.py`)
   - 8 specialized Arabic-speaking agents
   - Intent detection and customer profiling
   - Task execution and response generation

3. **TypeScript Bridge** (`langgraph-integration.ts`)
   - Connects Express backend to Python services
   - Provides fallback to direct CrewAI when LangGraph unavailable
   - Handles API routing and error management

## API Endpoints

### Process Conversation
```
POST /api/langgraph/process
```

Process a customer conversation through the LangGraph workflow.

**Request Body:**
```json
{
  "message": "رسالة العميل",
  "customer_id": "customer_123",
  "thread_id": "thread_456",
  "context": {
    "additional": "context"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "استجابة الوكيل",
    "workflow_stage": "completed",
    "agents_involved": ["مستجيب الدعم"],
    "thread_id": "thread_456",
    "next_actions": [],
    "satisfaction_score": 0.9
  }
}
```

### Get Workflow Visualization
```
GET /api/langgraph/visualization?workflow_id=workflow_123
```

Get a visual representation of the workflow graph.

### Get Agent Performance
```
GET /api/langgraph/performance?agent_id=support_responder&date_from=2025-01-01&date_to=2025-06-30
```

Get performance metrics for specific agents.

### Get Workflow States
```
GET /api/langgraph/states/:thread_id
```

Get all states for a specific conversation thread.

### Reset Workflow
```
POST /api/langgraph/reset/:thread_id
```

Reset a conversation workflow to its initial state.

### System Statistics
```
GET /api/langgraph/stats
```

Get overall system statistics and health metrics.

## Workflow Stages

1. **INITIAL_CONTACT** - First customer interaction
2. **INTENT_ANALYSIS** - Analyzing customer intent
3. **AGENT_SELECTION** - Selecting appropriate agent
4. **AGENT_EXECUTION** - Agent processing request
5. **RESPONSE_GENERATION** - Generating final response
6. **FOLLOW_UP** - Post-interaction follow-up
7. **ESCALATION** - Handling complex cases
8. **COMPLETION** - Workflow completed

## Agent Groups

### Customer Support (خدمة العملاء)
- **Support Responder (مستجيب الدعم)** - Initial support responses
- **Ticket Creator (منشئ التذاكر)** - Creates support tickets
- **Feedback Collector (جامع التعليقات)** - Collects customer feedback

### Telemarketing (التسويق الهاتفي)
- **Telemarketing Pitcher (مسوق هاتفي)** - Product pitching
- **Lead Qualifier (مؤهل العملاء المحتملين)** - Qualifies potential customers

### Telesales (المبيعات الهاتفية)
- **Sales Closer (مغلق الصفقات)** - Closes sales deals
- **Appointment Scheduler (جدولة المواعيد)** - Schedules appointments
- **Objection Handler (معالج الاعتراضات)** - Handles customer objections

## Features

### Intelligent Routing
- Automatic intent detection
- Agent selection based on customer needs
- Dynamic workflow adaptation

### State Management
- Conversation persistence
- Thread management
- Context preservation across interactions

### Performance Tracking
- Agent performance metrics
- Satisfaction scoring
- Response time tracking

### Escalation Handling
- Automatic escalation detection
- Human handoff capability
- Priority case management

## Testing the Integration

### Basic Test
```bash
curl -X POST http://localhost:5000/api/langgraph/process \
  -H "Content-Type: application/json" \
  -d '{
    "message": "أريد الاستفسار عن خدمات الدعم الفني",
    "customer_id": "test_customer_001",
    "thread_id": "test_thread_001"
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "response": "نحن هنا لمساعدتك في جميع استفسارات الدعم الفني...",
    "workflow_stage": "completed",
    "agents_involved": ["مستجيب الدعم"],
    "satisfaction_score": 0.9
  }
}
```

## Fallback Mechanism

When the LangGraph Python service is unavailable (port 8001), the system automatically falls back to direct CrewAI integration. This ensures continuous service availability without interruption.

## Configuration

### Environment Variables
- `OPENAI_API_KEY` - Required for GPT-4o integration
- `LANGGRAPH_SERVICE_URL` - Default: http://localhost:8001

### Starting the Services

1. **Main Application**
   ```bash
   npm run dev
   ```

2. **LangGraph Service** (Optional)
   ```bash
   cd ai-service
   uvicorn langgraph_api:app --reload --port 8001
   ```

## Troubleshooting

### Common Issues

1. **ECONNREFUSED on port 8001**
   - This is expected if LangGraph service isn't running
   - System will use fallback to direct CrewAI
   - No action required unless you need advanced features

2. **Type Errors in Python Files**
   - These are typing hints that don't affect runtime
   - System continues to function normally

3. **Port 5000 Already in Use**
   - Kill existing process: `pkill -f "node.*server/index.ts"`
   - Restart workflow

## Benefits of Integration

1. **Enhanced Workflow Management**
   - Visual workflow representation
   - Better state tracking
   - Advanced routing capabilities

2. **Improved Agent Coordination**
   - Multi-agent collaboration
   - Context sharing between agents
   - Seamless handoffs

3. **Better Analytics**
   - Detailed performance metrics
   - Conversation flow analysis
   - Satisfaction tracking

4. **Scalability**
   - Checkpointing for long conversations
   - Thread management
   - Concurrent conversation handling

## Future Enhancements

1. **Advanced Analytics Dashboard**
   - Real-time agent performance
   - Conversation flow visualization
   - Customer journey mapping

2. **Machine Learning Integration**
   - Predictive routing
   - Sentiment analysis
   - Automated optimization

3. **Multi-Channel Support**
   - WhatsApp integration
   - Voice call handling
   - Email automation

## Conclusion

The LangGraph + CrewAI integration provides a robust, scalable solution for intelligent customer service automation. With 8 specialized Arabic-speaking agents and advanced workflow management, the system can handle complex customer interactions while maintaining high satisfaction scores.