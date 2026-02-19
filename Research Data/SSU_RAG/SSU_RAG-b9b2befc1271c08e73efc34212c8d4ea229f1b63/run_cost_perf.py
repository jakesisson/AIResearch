#!/usr/bin/env python3
"""
Cost-perf entrypoint for SSU_RAG (researched clone).
Runs the RAG answer chain only with fixture query + fixed context (no vector search).
Set COST_PERF=1, COST_PERF_VARIANT=prior|researched, COST_PERF_FIXTURE_PATH=<query file>.
Writes cost-perf-results.json to clone root.
"""
import os
import sys
import json
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Default fixture: query only; compare script can set COST_PERF_FIXTURE_PATH to Research Data file
FIXTURE_PATH = Path(os.environ.get("COST_PERF_FIXTURE_PATH", "")) or (ROOT.parent / "cost_perf_fixture_query.txt")
# Minimal context so we don't need Milvus
DEFAULT_CONTEXT = "[1] Title: Cost-perf test\nSnippet: This is minimal context for cost-perf.\nLink: https://example.com/1"


def main():
    if not FIXTURE_PATH.exists():
        print(f"Fixture not found: {FIXTURE_PATH}", file=sys.stderr)
        sys.exit(1)

    os.environ["COST_PERF"] = "1"
    variant = os.environ.get("COST_PERF_VARIANT", "researched")

    # Load env (repo root master.env, then Research Data/SSU_RAG, then clone)
    from dotenv import load_dotenv
    for base in (ROOT.parent.parent, ROOT.parent, ROOT):
        for name in ("master.env", ".env"):
            p = base / name
            if p.exists():
                load_dotenv(p)

    if os.environ.get("AZURE_OPENAI_API_VERSION") and not os.environ.get("OPENAI_API_VERSION"):
        os.environ["OPENAI_API_VERSION"] = os.environ["AZURE_OPENAI_API_VERSION"]

    sys.path.insert(0, str(ROOT))
    os.chdir(ROOT)

    from chains import run_rag_qa_cost_perf

    query = FIXTURE_PATH.read_text(encoding="utf-8").strip() or "한국어로 간단히 인사해 주세요."
    context = DEFAULT_CONTEXT

    print("Cost-perf: RAG answer chain (researched)", flush=True)
    print(f"  Azure env: API_KEY={'set' if os.environ.get('AZURE_OPENAI_API_KEY') else 'missing'}, ENDPOINT={'set' if os.environ.get('AZURE_OPENAI_ENDPOINT') else 'missing'}", flush=True)
    usage_out = {}
    start = time.perf_counter()
    try:
        out = run_rag_qa_cost_perf(query=query, context=context)
        usage_out = out.get("usage") or {}
    except Exception as e:
        print(f"Run failed: {e}", file=sys.stderr)
        sys.exit(1)
    duration_ms = (time.perf_counter() - start) * 1000.0

    # Normalize usage keys (OpenAI/LangChain use input_tokens/output_tokens or prompt_tokens/completion_tokens)
    def get_tokens(d: dict, in_keys: tuple, out_keys: tuple):
        inc = sum(int(d.get(k) or 0) for k in in_keys)
        outc = sum(int(d.get(k) or 0) for k in out_keys)
        return inc, outc

    inc, outc = get_tokens(
        usage_out,
        ("input_tokens", "prompt_tokens"),
        ("output_tokens", "completion_tokens"),
    )
    total = int(usage_out.get("total_tokens") or 0) or (inc + outc)

    result = {
        "variant": variant,
        "durationMs": round(duration_ms, 2),
        "usage": {
            "inputTokens": inc or None,
            "outputTokens": outc or None,
            "totalTokens": total or None,
        },
    }
    out_path = ROOT / "cost-perf-results.json"
    out_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
