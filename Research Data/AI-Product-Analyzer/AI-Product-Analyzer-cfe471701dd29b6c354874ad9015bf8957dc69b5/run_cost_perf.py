#!/usr/bin/env python3
"""
Cost & performance test for AI-Product-Analyzer (prior commit).
Exercises the changed path: LangChainService.create_comprehensive_context (process_scraped_data)
then one Azure OpenAI call. Loads master.env from AIResearch if present.
Set COST_PERF_VARIANT=prior|researched when run from compare script.
"""
import os
import sys
import json
import time
from pathlib import Path

# Load .env then master.env before importing project code that reads os.environ
from dotenv import load_dotenv
load_dotenv()
master_env = Path(__file__).resolve().parent / ".." / ".." / ".." / "master.env"
if master_env.exists():
    load_dotenv(master_env)

# Now import project modules
from openai import AzureOpenAI
from agent.research_agent.langchain_service import LangChainService


def main():
    variant = os.environ.get("COST_PERF_VARIANT", "prior")

    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
    deployment = os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1")

    if not api_key or not endpoint:
        print("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT required (e.g. from master.env)", file=sys.stderr)
        sys.exit(1)

    # Mock scraped data to exercise process_scraped_data (changed code path)
    mock_scraped = [
        {
            "scraped": True,
            "url": "https://example.com/review1",
            "title": "Product Review One",
            "content": "This product has a good camera and battery. Performance is solid. " * 20,
        },
    ]
    search_results = []
    youtube_reviews = []
    reddit_posts = []

    langchain = LangChainService()
    context = langchain.create_comprehensive_context(
        search_results, mock_scraped, youtube_reviews, reddit_posts
    )
    prompt = f"Based on this product data, reply in one sentence: is this product recommended?\n\n{context[:3000]}"

    client = AzureOpenAI(
        api_key=api_key,
        api_version=api_version,
        azure_endpoint=endpoint,
    )
    max_tokens = int(os.getenv("MAX_TOKENS", "150"))
    temperature = float(os.getenv("TEMPERATURE", "0.3"))

    start = time.perf_counter()
    response = client.chat.completions.create(
        model=deployment,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    duration_ms = (time.perf_counter() - start) * 1000

    usage = getattr(response, "usage", None)
    if usage is not None:
        input_tokens = getattr(usage, "input_tokens", None) or getattr(usage, "prompt_tokens", 0)
        output_tokens = getattr(usage, "output_tokens", None) or getattr(usage, "completion_tokens", 0)
        total_tokens = getattr(usage, "total_tokens", None) or (input_tokens + output_tokens)
    else:
        input_tokens = output_tokens = total_tokens = None

    results = {
        "variant": variant,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "durationMs": round(duration_ms),
        "usage": {
            "inputTokens": input_tokens,
            "outputTokens": output_tokens,
            "totalTokens": total_tokens,
        },
    }
    out_path = Path(__file__).resolve().parent / "cost-perf-results.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
