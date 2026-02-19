#!/usr/bin/env python3
"""
Cache effectiveness: run cost-perf twice with same input; record run1 vs run2 tokens and duration.
aigie-io workflow has no application-level cache, so run2 will also use tokens; we record prior/researched for comparison.
Writes .cost-perf-cache_effectiveness.json.
"""
import json
import sys
from pathlib import Path

from _cost_perf_common import (
    ROOT,
    PRIOR_DIR,
    RESEARCHED_DIR,
    load_master_env,
    run_cost_perf,
)

RESULT_FILE = ROOT / ".cost-perf-cache_effectiveness.json"


def test_clone(name: str, cwd: Path, variant: str) -> tuple[bool, dict]:
    """Returns (passed, metrics_dict). Pass = both runs completed successfully."""
    print(f"\n--- {name} ---")
    metrics = {}
    ok1, r1 = run_cost_perf(cwd, variant, force_refresh=True)
    if not ok1 or not r1:
        print(f"  Run 1 failed.", file=sys.stderr)
        return False, metrics
    t1 = r1.get("usage", {}).get("totalTokens", 0)
    d1 = r1.get("durationMs", 0)
    print(f"  Run 1: {t1} tokens, {d1:.0f} ms")

    ok2, r2 = run_cost_perf(cwd, variant, force_refresh=False)
    if not ok2 or not r2:
        print(f"  Run 2 failed.", file=sys.stderr)
        return False, metrics
    t2 = r2.get("usage", {}).get("totalTokens", 0)
    d2 = r2.get("durationMs", 0)
    print(f"  Run 2: {t2} tokens, {d2:.0f} ms")

    metrics = {
        "run1_tokens": t1,
        "run2_tokens": t2,
        "run1_durationMs": round(d1, 2),
        "run2_durationMs": round(d2, 2),
    }
    print(f"  PASS: both runs completed (no cache in this backend; run2 tokens={t2})")
    return True, metrics


def main():
    load_master_env()
    if not PRIOR_DIR.is_dir() or not RESEARCHED_DIR.is_dir():
        print("Clones not found.", file=sys.stderr)
        sys.exit(1)

    prior_ok, prior_m = test_clone("Prior", PRIOR_DIR, "prior")
    researched_ok, researched_m = test_clone("Researched", RESEARCHED_DIR, "researched")

    result = {"prior": prior_m, "researched": researched_m}
    RESULT_FILE.write_text(json.dumps(result, indent=2), encoding="utf-8")

    if not prior_ok or not researched_ok:
        sys.exit(1)
    print("\nAll cache effectiveness checks passed.")


if __name__ == "__main__":
    main()
