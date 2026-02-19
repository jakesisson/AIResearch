#!/usr/bin/env python3
"""
Cost & performance entrypoint for sys-scan-graph (prior commit).
Runs the graph_pipeline with cost_perf_fixture_report.json, or cost_perf_fixture_report_stress.json when COST_PERF_STRESS=1.
Set COST_PERF_VARIANT=prior|researched for compare. Writes cost-perf-results.json to clone root.
"""
import os
import sys
import json
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FIXTURE = ROOT.parent / (
    "cost_perf_fixture_report_stress.json"
    if os.environ.get("COST_PERF_STRESS") == "1"
    else "cost_perf_fixture_report.json"
)


def main():
    if not FIXTURE.exists():
        print(f"Fixture not found: {FIXTURE}", file=sys.stderr)
        sys.exit(1)

    variant = os.environ.get("COST_PERF_VARIANT", "prior")
    os.environ["COST_PERF"] = "1"
    os.environ["COST_PERF_VARIANT"] = variant

    # Run graph_pipeline in-process so we can measure duration
    sys.path.insert(0, str(ROOT))
    os.chdir(ROOT)

    from agent.graph_pipeline import run_graph
    from agent.llm_provider import get_llm_provider

    provider = get_llm_provider()
    print("Cost-perf: graph_pipeline (prior)", flush=True)
    print(f"  LLM provider: {type(provider).__name__}", flush=True)
    print(f"  Azure env: API_KEY={'set' if os.environ.get('AZURE_OPENAI_API_KEY') else 'missing'}, ENDPOINT={'set' if os.environ.get('AZURE_OPENAI_ENDPOINT') else 'missing'}", flush=True)
    usage_out: dict = {}
    start = time.perf_counter()
    try:
        run_graph(Path(FIXTURE), checkpoint_dir=None, schema_path=None, index_dir=None, usage_out=usage_out)
    except Exception as e:
        print(f"Run failed: {e}", file=sys.stderr)
        sys.exit(1)
    duration_ms = (time.perf_counter() - start) * 1000.0

    result = {
        "variant": variant,
        "durationMs": round(duration_ms, 2),
        "usage": {
            "inputTokens": usage_out.get("inputTokens"),
            "outputTokens": usage_out.get("outputTokens"),
            "totalTokens": usage_out.get("totalTokens"),
        },
    }
    if usage_out.get("error"):
        result["usageError"] = usage_out.get("error")
    out_path = ROOT / "cost-perf-results.json"
    out_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
