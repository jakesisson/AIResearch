#!/usr/bin/env python3
"""
Cache effectiveness: run cost-perf twice with same input; second run should be cache hit
(0 tokens, much lower duration). Runs against both prior and researched clones.
Writes prior/researched metrics to .cost-perf-cache_effectiveness.json for comparison.
"""
import json
import sys
from pathlib import Path

from _cost_perf_common import (
    ROOT,
    PRIOR_DIR,
    RESEARCHED_DIR,
    load_master_env,
    build_core,
    run_cost_perf,
)

RESULT_FILE = ROOT / ".cost-perf-cache_effectiveness.json"


def test_clone(name: str, cwd: Path, variant: str) -> tuple[bool, dict]:
    """Returns (passed, metrics_dict)."""
    print(f"\n--- {name} ---")
    metrics = {}
    if not build_core(cwd):
        print(f"  Build failed.", file=sys.stderr)
        return False, metrics
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
    passed = t2 == 0
    if not passed:
        print(f"  FAIL: expected 0 tokens on run 2 (cache hit), got {t2}", file=sys.stderr)
    elif d1 > 0 and d2 >= d1 * 0.5:
        print(f"  WARN: run 2 duration {d2:.0f} ms not much lower than run 1 {d1:.0f} ms (expected <50%)", file=sys.stderr)
    else:
        print(f"  PASS: cache hit on run 2 (0 tokens)")
    return passed, metrics


def main():
    load_master_env()
    if not PRIOR_DIR.is_dir() or not RESEARCHED_DIR.is_dir():
        print("Clones not found.", file=sys.stderr)
        sys.exit(1)

    prior_ok, prior_m = test_clone("Prior", PRIOR_DIR, "prior")
    researched_ok, researched_m = test_clone("Researched", RESEARCHED_DIR, "researched")

    result = {
        "prior": prior_m,
        "researched": researched_m,
    }
    RESULT_FILE.write_text(json.dumps(result, indent=2), encoding="utf-8")

    if not prior_ok or not researched_ok:
        sys.exit(1)
    print("\nAll cache effectiveness checks passed.")


if __name__ == "__main__":
    main()
