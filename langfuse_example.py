"""
Example: How Langfuse Tracks Cost and Performance

This demonstrates how Langfuse automatically tracks:
1. Token usage (input/output)
2. Cost per request
3. Latency (response time)
4. Full request/response logs
"""

import os
from langchain_openai import ChatOpenAI
from langfuse.callback import CallbackHandler

# Initialize Langfuse callback
langfuse_handler = CallbackHandler(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST", "http://localhost:3000")
)

# Create LLM with Langfuse callback
llm = ChatOpenAI(
    model="gpt-4o",
    callbacks=[langfuse_handler]  # This enables tracking!
)

# Make a request - Langfuse automatically tracks:
# - Input tokens: ~50 tokens
# - Output tokens: ~100 tokens
# - Cost: ~$0.002 (example)
# - Latency: ~1.2 seconds
# - Full prompt and response
response = llm.invoke("What is 2+2?")

print(f"Response: {response.content}")

# What Langfuse Captures:
# =======================
# 1. COST TRACKING:
#    - Input tokens: 50
#    - Output tokens: 100
#    - Total cost: $0.002
#    - Model: gpt-4o
#
# 2. PERFORMANCE:
#    - Latency: 1.2s
#    - Timestamp: 2025-01-15 10:30:45
#
# 3. CONTENT:
#    - Full prompt: "What is 2+2?"
#    - Full response: "2+2 equals 4."
#    - Model parameters (temperature, etc.)
#
# 4. METADATA:
#    - User ID (if set)
#    - Session ID
#    - Project name
#    - Tags

# View in Dashboard:
# Go to http://localhost:3000 to see:
# - Cost dashboard (total spend, cost per model)
# - Performance dashboard (latency, throughput)
# - Traces (individual requests with full details)
# - Analytics (usage patterns, trends)
