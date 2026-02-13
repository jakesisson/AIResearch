# Testing HypochondriAI - Complete Guide

## What is HypochondriAI?

HypochondriAI is a **health anxiety support chatbot** that helps people struggling with health anxiety. It uses AI to provide:
- Supportive conversations about health concerns
- Evidence-based information
- Anxiety management strategies
- Non-medical advice and reassurance

## What to Test

### 1. **Health Anxiety Scenarios** (Primary Use Case)

Test how the chatbot responds to common health anxiety concerns:

#### Example Test Questions:

**Mild Health Concerns:**
- "I've been having headaches for a few days. Should I be worried?"
- "I noticed a small bump on my skin. What could it be?"
- "I've been feeling tired lately. Is this normal?"

**Moderate Anxiety:**
- "I keep thinking I have cancer. I can't stop worrying about it."
- "Every time I feel a pain, I think it's something serious. How do I stop this?"
- "I've been to the doctor multiple times but I still worry. What should I do?"

**Severe Anxiety:**
- "I'm convinced I have a serious illness even though tests came back normal."
- "I can't sleep because I'm worried about my health constantly."
- "I check my symptoms online multiple times a day. Is this normal?"

### 2. **Conversation Flow Testing**

Test the conversation management:
- Start a new conversation
- Continue an existing conversation
- Multiple back-and-forth exchanges
- Context retention across messages

### 3. **Performance & Cost Testing**

Use Langfuse to track:
- Response time (latency)
- Token usage
- Cost per conversation
- Quality of responses

## Setup Instructions

### Step 1: Set Up the Repository

```bash
cd /Users/jsisson/Research/HypochondriAI-3b23faa83b3007490569ac2951887fe622c0cdcc

# Set up Azure OpenAI (or ChatGPT)
python ../testing_harness.py setup-azure-openai

# Set up Langfuse tracking
python ../testing_harness.py setup-langfuse

# Set up PostgreSQL database
python ../testing_harness.py setup-postgres --db-name health_anxiety
```

### Step 2: Install Dependencies

```bash
cd backend/app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Set Up Database

```bash
# Make sure PostgreSQL is running
docker ps | grep postgres

# Run migrations
alembic upgrade head
```

### Step 4: Start the Backend

```bash
# From backend/app directory
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

### Step 5: (Optional) Start the Frontend

```bash
cd ../../frontend
npm install
npm start
```

Frontend will be at: `http://localhost:3000` (or another port)

## Testing Methods

### Method 1: API Testing (Recommended)

Use the FastAPI endpoints directly:

```bash
# Start a new conversation
curl -X POST "http://localhost:8000/api/conversations" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'

# Send a message (replace CONVERSATION_ID)
curl -X POST "http://localhost:8000/api/conversations/CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"content": "I have been having headaches for a few days. Should I be worried?"}'
```

### Method 2: Use the Frontend

1. Start both backend and frontend
2. Open the web interface
3. Type your test questions
4. Observe responses

### Method 3: Python Script Testing

Create a test script:

```python
import requests

BASE_URL = "http://localhost:8000"

# Create conversation
response = requests.post(f"{BASE_URL}/api/conversations", 
                        json={"user_id": "test_user"})
conversation = response.json()
conv_id = conversation["id"]

# Send test message
message = requests.post(
    f"{BASE_URL}/api/conversations/{conv_id}/messages",
    json={"content": "I've been having headaches. Should I be worried?"}
)
print(message.json())
```

## Test Scenarios Checklist

### ✅ Basic Functionality
- [ ] Can create a new conversation
- [ ] Can send messages
- [ ] Receives responses
- [ ] Conversation history is saved

### ✅ Health Anxiety Responses
- [ ] Provides supportive, non-alarming responses
- [ ] Suggests seeing a doctor when appropriate
- [ ] Doesn't provide medical diagnoses
- [ ] Helps manage anxiety
- [ ] Uses appropriate tone (calm, supportive)

### ✅ Performance Metrics (via Langfuse)
- [ ] Response time < 3 seconds
- [ ] Token usage is reasonable
- [ ] Cost per conversation tracked
- [ ] All requests logged in Langfuse

### ✅ Edge Cases
- [ ] Handles very long messages
- [ ] Handles empty messages
- [ ] Handles non-health-related questions
- [ ] Handles multiple rapid messages

## What to Look For

### Good Responses Should:
- ✅ Be supportive and empathetic
- ✅ Encourage professional medical consultation when needed
- ✅ Provide general information without diagnosing
- ✅ Help manage anxiety
- ✅ Be clear and easy to understand

### Red Flags:
- ❌ Providing specific medical diagnoses
- ❌ Dismissing serious concerns
- ❌ Being overly alarmist
- ❌ Taking too long to respond (>5 seconds)
- ❌ High token usage/cost

## Viewing Results in Langfuse

After testing, check Langfuse Cloud:

1. Go to: https://us.cloud.langfuse.com
2. Navigate to your project
3. View **Traces** to see:
   - Exact prompts sent
   - Responses received
   - Token counts
   - Latency
   - Cost per interaction

4. View **Analytics** to see:
   - Average response time
   - Total cost
   - Token usage trends

## Example Test Script

Save this as `test_hypochondriai.py`:

```python
#!/usr/bin/env python3
"""Test script for HypochondriAI"""

import requests
import time
from typing import List, Dict

BASE_URL = "http://localhost:8000"

def test_conversation(questions: List[str], user_id: str = "test_user"):
    """Test a conversation with multiple questions."""
    
    # Create conversation
    print("Creating conversation...")
    response = requests.post(
        f"{BASE_URL}/api/conversations",
        json={"user_id": user_id}
    )
    conversation = response.json()
    conv_id = conversation["id"]
    print(f"Conversation ID: {conv_id}")
    
    # Send each question
    for i, question in enumerate(questions, 1):
        print(f"\n[{i}] Sending: {question}")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/api/conversations/{conv_id}/messages",
            json={"content": question}
        )
        
        elapsed = time.time() - start_time
        result = response.json()
        
        print(f"Response ({elapsed:.2f}s): {result.get('content', 'No content')[:100]}...")
        time.sleep(1)  # Brief pause between messages
    
    return conv_id

if __name__ == "__main__":
    test_questions = [
        "I've been having headaches for a few days. Should I be worried?",
        "I keep thinking I have a serious illness. How can I stop worrying?",
        "What should I do if I'm constantly checking my symptoms online?",
    ]
    
    test_conversation(test_questions)
    print("\n✅ Test complete! Check Langfuse for detailed metrics.")
```

Run it:
```bash
cd /Users/jsisson/Research/HypochondriAI-3b23faa83b3007490569ac2951887fe622c0cdcc
python3 test_hypochondriai.py
```

## Next Steps

1. **Set up the repository** (commands above)
2. **Run the test script** or use the API directly
3. **Check Langfuse** to see cost and performance metrics
4. **Compare models** - test with Azure OpenAI vs ChatGPT
5. **Analyze responses** - are they helpful and appropriate?

## Troubleshooting

**Backend won't start?**
- Check database is running: `docker ps | grep postgres`
- Check `.env` file has correct database credentials
- Check all dependencies installed: `pip install -r requirements.txt`

**No responses?**
- Check Langfuse keys in `.env`
- Check API keys are correct
- Check backend logs for errors

**Database errors?**
- Run migrations: `alembic upgrade head`
- Check database is accessible: `docker exec -it <container> psql -U test_user -d health_anxiety`
