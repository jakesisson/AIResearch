# HypochondriAI - Quick Start Testing Guide

## What is HypochondriAI?

A **health anxiety support chatbot** that helps people manage health-related anxiety by providing:
- Supportive, evidence-based responses
- Calm, non-alarmist information
- Guidance on when to seek medical help
- Anxiety management strategies

## Quick Setup (3 Steps)

### Step 1: Set Up the Repository

```bash
cd /Users/jsisson/Research/HypochondriAI-3b23faa83b3007490569ac2951887fe622c0cdcc

# Set up Azure OpenAI
python ../testing_harness.py setup-azure-openai

# Set up Langfuse tracking
python ../testing_harness.py setup-langfuse

# Set up PostgreSQL
python ../testing_harness.py setup-postgres --db-name health_anxiety
```

### Step 2: Install & Start Backend

```bash
cd backend/app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload
```

Backend will run at: **http://localhost:8000**

### Step 3: Run Tests

```bash
# From repository root
python test_hypochondriai.py
```

## What to Test

The test script automatically tests these scenarios:

1. **Mild Health Concerns**
   - "I've been having headaches for a few days. Should I be worried?"

2. **Moderate Anxiety**
   - "I keep thinking I have cancer. I can't stop worrying about it."

3. **Symptom Checking Behavior**
   - "I've been checking my symptoms online multiple times a day. Is this normal?"

4. **General Questions**
   - "What is health anxiety?"

## Manual Testing

### Using the API Directly

```bash
# Create a conversation
curl -X POST "http://localhost:8000/api/v1/new?user_id=$(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"content": "I have been having headaches. Should I be worried?"}'
```

### Using the Frontend (Optional)

```bash
cd frontend
npm install
npm start
```

Then open http://localhost:3000 in your browser.

## What to Look For

### ✅ Good Responses Should:
- Be supportive and empathetic
- Encourage seeing a doctor when appropriate
- Not provide medical diagnoses
- Help manage anxiety
- Be clear and understandable

### 📊 Check Langfuse

After testing, view results at: **https://us.cloud.langfuse.com**

You'll see:
- Exact prompts and responses
- Response times
- Token usage
- Cost per conversation

## Troubleshooting

**Backend won't start?**
- Check database: `docker ps | grep postgres`
- Check `.env` file exists in `backend/app/`
- Run migrations: `alembic upgrade head`

**No responses?**
- Check API keys in `.env`
- Check backend logs for errors
- Verify Langfuse keys are set

**Database errors?**
- Make sure PostgreSQL is running
- Check connection settings in `.env`

## Next Steps

1. ✅ Run the test script
2. ✅ Check Langfuse for metrics
3. ✅ Try different test questions
4. ✅ Compare Azure OpenAI vs ChatGPT (use `setup-chatgpt` instead)
