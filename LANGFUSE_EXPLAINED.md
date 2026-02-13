# Langfuse Explained: What It Does & How It Works

## The Big Picture

You're testing AI models (Azure OpenAI, ChatGPT, etc.) across many repositories. You need to:
- **Track costs**: How much does each model cost per request?
- **Measure performance**: Which model is faster?
- **Compare models**: Same prompt, different models, what's the difference?

**Langfuse does all of this automatically.**

## What Gets Tracked (Real Example)

### Before Langfuse
```python
# Your code makes an LLM call
response = llm.invoke("What is the weather?")
# You have no idea:
# - How many tokens were used?
# - How much did it cost?
# - How long did it take?
# - What was the exact prompt/response?
```

### After Langfuse
```python
# Same code, but with Langfuse callback
llm = ChatOpenAI(callbacks=[langfuse_handler])
response = llm.invoke("What is the weather?")

# Langfuse automatically records:
# ✅ Input tokens: 45
# ✅ Output tokens: 123
# ✅ Cost: $0.0023
# ✅ Latency: 1.2 seconds
# ✅ Full prompt: "What is the weather?"
# ✅ Full response: "I don't have access to..."
```

## The Data Flow

```
┌─────────────────┐
│  Your Code      │
│  (Python app)   │
└────────┬────────┘
         │
         │ Makes LLM call
         ↓
┌─────────────────┐
│  LangChain/     │
│  LangGraph      │
└────────┬────────┘
         │
         │ Callback intercepts
         ↓
┌─────────────────┐
│  Langfuse       │
│  Callback       │ ← Captures everything
└────────┬────────┘
         │
         │ Sends data
         ↓
┌─────────────────┐
│  Langfuse       │
│  Server         │ ← Stores in PostgreSQL
│  (Docker)       │
└────────┬────────┘
         │
         │ Query data
         ↓
┌─────────────────┐
│  Langfuse       │
│  Dashboard      │ ← Visualize analytics
│  (Web UI)       │
└─────────────────┘
```

## What You See in the Dashboard

### 1. Cost Dashboard
```
Total Spend This Month: $45.67
├─ Azure OpenAI (gpt-4.1): $32.10 (70%)
├─ ChatGPT (gpt-4o): $10.50 (23%)
└─ Other models: $3.07 (7%)

Cost Per Request:
├─ gpt-4.1: $0.021 avg
└─ gpt-4o: $0.015 avg
```

### 2. Performance Dashboard
```
Average Latency:
├─ gpt-4.1: 1.2s
└─ gpt-4o: 0.9s

Requests Per Day:
├─ Monday: 1,234 requests
├─ Tuesday: 1,567 requests
└─ ...

Error Rate: 0.5%
```

### 3. Individual Traces
Each request shows:
- **Timestamp**: When it happened
- **Model**: Which model was used
- **Prompt**: Full input text
- **Response**: Full output text
- **Tokens**: Input: 45, Output: 123
- **Cost**: $0.0023
- **Latency**: 1.2s
- **Status**: Success/Error

## Why This Matters for Your Research

### Compare Models
Run the same test on different models:
- **Cost comparison**: "gpt-4.1 costs $0.02, gpt-4o costs $0.015"
- **Performance comparison**: "gpt-4.1 takes 1.2s, gpt-4o takes 0.9s"
- **Quality comparison**: See actual responses side-by-side

### Track Improvements
Before refactoring:
- Cost: $0.025 per request
- Latency: 2.1s

After refactoring:
- Cost: $0.018 per request (28% reduction!)
- Latency: 1.3s (38% faster!)

### Debug Issues
"Request failed? Let me check Langfuse..."
- See exact prompt that failed
- See error message
- See which model was used
- See when it happened

### Budget Tracking
"Am I staying within budget?"
- Daily spend: $5.23
- Weekly spend: $36.50
- Monthly projection: $156.00

## Setup Summary

1. **Start Langfuse** (Docker container)
   ```bash
   docker compose -f docker-compose.langfuse.yml up -d
   ```
   
   **Note**: If Docker is not installed, install Docker Desktop first (see `DOCKER_INSTALL.md`).

2. **Get API Keys** (from web UI)
   - Open http://localhost:3000
   - Create account
   - Copy Public Key and Secret Key

3. **Add to master.env**
   ```env
   LANGFUSE_PUBLIC_KEY=pk-lf-xxxxx
   LANGFUSE_SECRET_KEY=sk-lf-xxxxx
   LANGFUSE_HOST=http://localhost:3000
   ```

4. **Use with harness**
   ```bash
   python testing_harness.py setup-langfuse
   ```

That's it! Now every LLM call is automatically tracked.

## Key Concepts

### Callback
A "callback" is a function that gets called automatically when something happens. Langfuse's callback gets called every time your code makes an LLM request, and it records all the details.

### Trace
A "trace" is one complete LLM interaction. It includes the prompt, response, tokens, cost, latency, and metadata.

### Session
A "session" groups related traces together. For example, all traces from one user conversation would be in the same session.

### Project
A "project" groups all traces for one application or repository. You can have multiple projects in Langfuse.

## Common Questions

**Q: Does this slow down my code?**
A: No, the callback runs asynchronously. It adds <1ms overhead.

**Q: What if I don't want to track something?**
A: Just don't add the callback to that LLM instance.

**Q: Can I track custom data?**
A: Yes! You can add metadata, tags, user IDs, etc.

**Q: Is my data secure?**
A: Yes, it runs locally in Docker. Data stays on your machine.

**Q: Can I export the data?**
A: Yes, you can export traces as JSON or CSV.

## Next Steps

1. Start Langfuse: `docker-compose -f docker-compose.langfuse.yml up -d`
2. Get your API keys from http://localhost:3000
3. Add keys to `master.env`
4. Run `python testing_harness.py setup-langfuse` in a repository
5. Run your code and watch the data appear in the dashboard!
