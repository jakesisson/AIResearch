# Langfuse Quick Start

## What Langfuse Does

Langfuse automatically tracks **every LLM call** your code makes and records:

### 💰 Cost Tracking
- **Token counts**: Input tokens + Output tokens
- **Cost per request**: Calculated based on model pricing
- **Total costs**: Daily/weekly/monthly spending
- **Cost by model**: Compare Azure OpenAI vs ChatGPT costs

### ⚡ Performance Tracking
- **Latency**: How long each request takes
- **Throughput**: Requests per second
- **Error rates**: Failed requests
- **Response times**: P50, P95, P99 percentiles

### 📝 Full Logging
- **Prompts**: Exact input sent to models
- **Responses**: Complete model outputs
- **Chains**: Multi-step LLM workflows
- **Errors**: Full error traces

## Quick Setup (3 Steps)

### 1. Start Langfuse
```bash
cd /Users/jsisson/Research
docker compose -f docker-compose.langfuse.yml up -d
```

**Note**: If you get "command not found", you need to install Docker Desktop first. See `DOCKER_INSTALL.md`.

Wait ~30 seconds, then open: http://localhost:3000

### 2. Get API Keys
1. Open http://localhost:3000
2. Create account (first time only)
3. Go to **Settings → API Keys**
4. Copy:
   - Public Key
   - Secret Key

### 3. Add to master.env
Edit `/Users/jsisson/Research/master.env`:

```env
LANGFUSE_PUBLIC_KEY=pk-lf-xxxxx
LANGFUSE_SECRET_KEY=sk-lf-xxxxx
LANGFUSE_HOST=http://localhost:3000
```

## Use with Testing Harness

```bash
# In any repository directory
python ../testing_harness.py setup-langfuse
```

This automatically:
- ✅ Adds Langfuse to requirements.txt
- ✅ Updates .env with Langfuse keys
- ✅ Adds Langfuse callback to LLM code

## View Your Data

1. **Cost Dashboard**: http://localhost:3000 → Analytics → Cost
   - See total spend
   - Compare model costs
   - Track spending trends

2. **Performance Dashboard**: http://localhost:3000 → Analytics → Performance
   - Average latency
   - Request rates
   - Error rates

3. **Traces**: http://localhost:3000 → Traces
   - Individual requests
   - Full prompts/responses
   - Token counts
   - Latency per request

## How It Works

```
Your Code
  ↓
LLM Call (ChatGPT/Azure OpenAI/etc.)
  ↓
Langfuse Callback (intercepts)
  ↓
Records: tokens, cost, latency, prompts
  ↓
Stores in PostgreSQL
  ↓
Dashboard shows analytics
```

## Example Output

After running your code, you'll see in Langfuse:

**Cost View:**
- Model: gpt-4.1
- Input tokens: 1,234
- Output tokens: 567
- Cost: $0.045
- Date: 2025-01-15

**Performance View:**
- Average latency: 1.2s
- P95 latency: 2.5s
- Requests: 150
- Errors: 2

**Trace View:**
- Prompt: "What is the weather?"
- Response: "I don't have access to..."
- Tokens: 45 input, 12 output
- Latency: 0.8s
- Cost: $0.001

## Troubleshooting

**Can't connect to Langfuse?**
```bash
# Check if running
docker ps | grep langfuse

# Restart if needed
docker compose -f docker-compose.langfuse.yml restart
```

**No data showing?**
- Check API keys in master.env
- Verify callback is added to LLM code
- Check Langfuse logs: `docker logs langfuse_server`

**Port 3000 already in use?**
- Change port in docker-compose.langfuse.yml
- Update LANGFUSE_HOST in master.env
