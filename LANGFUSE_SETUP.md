# Langfuse Setup Guide - Cost & Performance Tracking

## What is Langfuse?

**Langfuse** is an open-source LLM observability platform that helps you track:

### 📊 What It Tracks

1. **Cost Tracking**
   - Token usage (input/output tokens)
   - Cost per request
   - Total costs over time
   - Cost by model, user, or project

2. **Performance Metrics**
   - Latency (time per request)
   - Throughput (requests per second)
   - Error rates
   - Response times

3. **Usage Analytics**
   - Which models are being used
   - How many requests per model
   - User activity
   - Request patterns

4. **Debugging & Tracing**
   - Full request/response logs
   - Chain of LLM calls
   - Error tracking
   - Prompt versions

## How It Works

```
Your Application
    ↓
LangChain/LangGraph (with Langfuse callback)
    ↓
Langfuse Server (collects data)
    ↓
PostgreSQL Database (stores metrics)
    ↓
Langfuse Dashboard (visualizes data)
```

**The Flow:**
1. Your code makes LLM calls (via LangChain/LangGraph)
2. Langfuse callback intercepts each call
3. Langfuse records: tokens, cost, latency, prompts, responses
4. Data is stored in PostgreSQL
5. You view analytics in the Langfuse web dashboard

## Setup Instructions

### Step 1: Start Langfuse with Docker

Langfuse runs as a Docker container with its own PostgreSQL database.

```bash
cd /Users/jsisson/Research
docker compose -f docker-compose.langfuse.yml up -d
```

**Note**: Modern Docker uses `docker compose` (space), not `docker-compose` (hyphen). If Docker is not installed, see `DOCKER_INSTALL.md`.

This will:
- Start Langfuse server on port 3000
- Start PostgreSQL for Langfuse on port 5434
- Create web UI at http://localhost:3000

### Step 2: Get Your API Keys

1. Open http://localhost:3000 in your browser
2. Create an account (first time only)
3. Go to Settings → API Keys
4. Copy:
   - **Public Key** (LANGFUSE_PUBLIC_KEY)
   - **Secret Key** (LANGFUSE_SECRET_KEY)
   - **Host** (usually http://localhost:3000)

### Step 3: Add to master.env

Add these to your `master.env` file:

```env
# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=your_public_key_here
LANGFUSE_SECRET_KEY=your_secret_key_here
LANGFUSE_HOST=http://localhost:3000
```

### Step 4: Integrate with Your Code

Langfuse integrates via callbacks in LangChain/LangGraph. The harness can automatically add this to your repositories.

## What You'll See in Langfuse

### Cost Dashboard
- Total spend per day/week/month
- Cost breakdown by model
- Cost per user/project
- Token usage charts

### Performance Dashboard
- Average latency per model
- P95/P99 latency
- Requests per second
- Error rates

### Traces
- Individual request/response pairs
- Full conversation chains
- Token counts
- Exact prompts and responses

## Benefits for Your Research

1. **Compare Models**: See cost/performance differences between Azure OpenAI, ChatGPT, etc.
2. **Optimize Costs**: Identify expensive operations
3. **Track Performance**: Measure latency improvements
4. **Debug Issues**: See exactly what prompts/responses were used
5. **Consistency Testing**: Compare same prompts across different models
