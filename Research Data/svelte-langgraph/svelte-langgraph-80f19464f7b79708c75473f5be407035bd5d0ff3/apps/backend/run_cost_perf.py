#!/usr/bin/env python3
"""
Cost-perf entrypoint for svelte-langgraph backend (prior commit).
Runs the chat graph once with a fixture prompt and reports duration + token usage.
Set COST_PERF=1 and Azure env vars. Writes cost-perf-results.json to clone root.
"""
import asyncio
import json
import os
import sys
import time
from pathlib import Path

# Run from apps/backend; clone root is parent.parent; repo root is clone's parent.parent
SCRIPT_DIR = Path(__file__).resolve().parent
CLONE_ROOT = SCRIPT_DIR.parent.parent
REPO_ROOT = CLONE_ROOT.parent.parent
sys.path.insert(0, str(SCRIPT_DIR / "src"))
os.chdir(SCRIPT_DIR)

# Load env before importing graph (repo root master.env first, then clone/project)
from dotenv import load_dotenv
for base in (REPO_ROOT, SCRIPT_DIR, CLONE_ROOT):
    for name in ("master.env", ".env"):
        p = base / name
        if p.exists():
            load_dotenv(p)
os.environ["COST_PERF"] = "1"
# LangChain Azure client may expect OPENAI_API_VERSION; mirror from Azure env
if os.environ.get("AZURE_OPENAI_API_VERSION") and not os.environ.get("OPENAI_API_VERSION"):
    os.environ["OPENAI_API_VERSION"] = os.environ["AZURE_OPENAI_API_VERSION"]

from langgraph.prebuilt.chat_agent_executor import AgentState
from langchain_core.runnables import RunnableConfig

from graph import make_graph


def _usage_from_messages(messages) -> tuple[int, int]:
    """Sum input/output tokens from all AI message response_metadata or usage_metadata."""
    total_in, total_out = 0, 0
    for msg in messages or []:
        usage = None
        um = getattr(msg, "usage_metadata", None)
        if um is not None and hasattr(um, "get"):
            usage = um
        elif um is not None and hasattr(um, "input_tokens"):
            total_in += int(getattr(um, "input_tokens", 0) or 0)
            total_out += int(getattr(um, "output_tokens", 0) or 0)
            continue
        if not usage:
            meta = getattr(msg, "response_metadata", None) or {}
            usage = meta.get("usage") or meta.get("token_usage") or {}
        if isinstance(usage, dict):
            total_in += int(usage.get("input_tokens") or usage.get("prompt_tokens") or 0)
            total_out += int(usage.get("output_tokens") or usage.get("completion_tokens") or 0)
    return total_in, total_out


def main():
    variant = os.environ.get("COST_PERF_VARIANT", "prior")
    fixture_path = Path(os.environ.get("COST_PERF_FIXTURE_PATH", "")) or (CLONE_ROOT / "cost_perf_fixture_prompt.txt")
    if not fixture_path.exists():
        print(f"Fixture not found: {fixture_path}", file=sys.stderr)
        sys.exit(1)
    prompt = fixture_path.read_text(encoding="utf-8").strip() or "What's the weather in Amsterdam?"

    config: RunnableConfig = {"configurable": {"thread_id": "cost-perf", "user_name": "CostPerf"}}
    agent = make_graph(config)

    print("Cost-perf: chat graph (prior)", flush=True)
    print(f"  Azure env: API_KEY={'set' if os.environ.get('AZURE_OPENAI_API_KEY') else 'missing'}, ENDPOINT={'set' if os.environ.get('AZURE_OPENAI_ENDPOINT') else 'missing'}", flush=True)
    start = time.perf_counter()
    usage_error = None
    try:
        result: AgentState = asyncio.run(
            agent.ainvoke(
                {"messages": [{"role": "user", "content": prompt}]},
                config,
            )
        )
    except Exception as e:
        usage_error = str(e)
        print(f"Run failed: {e}", file=sys.stderr)
        duration_ms = (time.perf_counter() - start) * 1000.0
        out = {
            "variant": variant,
            "durationMs": round(duration_ms, 2),
            "usage": {"inputTokens": None, "outputTokens": None, "totalTokens": None},
            "usageError": usage_error,
        }
        results_path = CLONE_ROOT / "cost-perf-results.json"
        results_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
        print(json.dumps(out, indent=2))
        print(f"\nWrote {results_path}")
        sys.exit(1)
    duration_ms = (time.perf_counter() - start) * 1000.0

    messages = result.get("messages") or []
    input_tokens, output_tokens = _usage_from_messages(messages)

    out = {
        "variant": variant,
        "durationMs": round(duration_ms, 2),
        "usage": {
            "inputTokens": input_tokens if input_tokens else None,
            "outputTokens": output_tokens if output_tokens else None,
            "totalTokens": (input_tokens + output_tokens) or None,
        },
    }
    if usage_error:
        out["usageError"] = usage_error
    results_path = CLONE_ROOT / "cost-perf-results.json"
    results_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(json.dumps(out, indent=2))
    print(f"\nWrote {results_path}")


if __name__ == "__main__":
    main()
