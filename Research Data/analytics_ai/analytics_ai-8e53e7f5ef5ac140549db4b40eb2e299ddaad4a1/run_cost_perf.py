#!/usr/bin/env python3
"""
Cost-perf for analytics_ai researched commit: runs real create_analysis_plan_node (Azure OpenAI).
Measures duration and token usage. Writes cost-perf-results.json to clone root.
"""
import os
import sys
import json
import time
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = lambda _: None
master_env = Path(__file__).resolve().parent / ".." / ".." / "master.env"
if master_env.exists():
    load_dotenv(master_env)
os.environ["COST_PERF"] = "1"

def main():
    variant = os.environ.get("COST_PERF_VARIANT", "researched")
    input_id = os.environ.get("COST_PERF_INPUT_ID", "")
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))

    print("Cost-perf: create_analysis_plan_node", flush=True)

    import files.backend_codes as backend_codes
    from files.backend_codes import create_analysis_plan_node

    if hasattr(backend_codes, "COST_PERF_PLAN_USAGE"):
        backend_codes.COST_PERF_PLAN_USAGE.clear()

    base_input = "Show me the total sales by category"
    if input_id:
        base_input = base_input + " [cost-perf-id=" + str(input_id) + "]"
    state = {
        "input": base_input,
        "intent_list": ["データ取得"],
        "query_history": [],
    }
    start = time.perf_counter()
    create_analysis_plan_node(state)
    duration_ms = (time.perf_counter() - start) * 1000

    usage_list = getattr(backend_codes, "COST_PERF_PLAN_USAGE", [])
    input_tokens = sum(u.get("input_tokens", 0) for u in usage_list)
    output_tokens = sum(u.get("output_tokens", 0) for u in usage_list)
    total = input_tokens + output_tokens

    out = {
        "variant": variant,
        "durationMs": round(duration_ms, 2),
        "usage": {
            "inputTokens": input_tokens,
            "outputTokens": output_tokens,
            "totalTokens": total,
        },
    }
    path = root / "cost-perf-results.json"
    path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(json.dumps(out, indent=2))
    print(f"\nWrote {path}")

if __name__ == "__main__":
    main()
