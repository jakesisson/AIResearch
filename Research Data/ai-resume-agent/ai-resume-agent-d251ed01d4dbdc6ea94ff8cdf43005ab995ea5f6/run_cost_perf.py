#!/usr/bin/env python3
"""
Cost & performance test for ai-resume-agent (prior commit).
Single Azure OpenAI call to measure tokens and latency. No DB or RAG chain.
Loads master.env from AIResearch if present. Set COST_PERF_VARIANT=prior|researched for compare.
"""
import os
import sys
import json
import time
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()
master_env = Path(__file__).resolve().parent / ".." / ".." / "master.env"
if master_env.exists():
    load_dotenv(master_env)

from openai import AzureOpenAI


def main():
    variant = os.environ.get("COST_PERF_VARIANT", "prior")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
    deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1")

    if not api_key or not endpoint:
        print("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT required (e.g. from master.env)", file=sys.stderr)
        sys.exit(1)

    client = AzureOpenAI(api_key=api_key, api_version=api_version, azure_endpoint=endpoint)
    max_tokens = int(os.getenv("MAX_TOKENS", "150"))
    temperature = float(os.getenv("TEMPERATURE", "0.3"))
    prompt = "What is 2 + 2? Reply with one number only."

    start = time.perf_counter()
    response = client.chat.completions.create(
        model=deployment,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    duration_ms = (time.perf_counter() - start) * 1000

    usage = getattr(response, "usage", None)
    if usage:
        input_tokens = getattr(usage, "input_tokens", None) or getattr(usage, "prompt_tokens", 0)
        output_tokens = getattr(usage, "output_tokens", None) or getattr(usage, "completion_tokens", 0)
        total_tokens = getattr(usage, "total_tokens", None) or (input_tokens + output_tokens)
    else:
        input_tokens = output_tokens = total_tokens = None

    results = {
        "variant": variant,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "durationMs": round(duration_ms),
        "usage": {"inputTokens": input_tokens, "outputTokens": output_tokens, "totalTokens": total_tokens},
    }
    out_path = Path(__file__).resolve().parent / "cost-perf-results.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
