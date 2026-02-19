#!/usr/bin/env python3
"""
Consistency: run cost-perf N times with distinct inputs (COST_PERF_INPUT_ID=1..5), compute
mean and stddev of duration; assert variance is bounded (cv < 0.6).
Writes .cost-perf-consistency.json.
"""
import json
import sys
import statistics
from pathlib import Path

from _cost_perf_common import (
    ROOT,
    PRIOR_DIR,
    RESEARCHED_DIR,
    load_master_env,
    run_cost_perf,
)

N_RUNS = 5
MAX_CV = 0.6
RESULT_FILE = ROOT / ".cost-perf-consistency.json"


def test_clone(name: str, cwd: Path, variant: str) -> tuple[bool, dict]:
    """Returns (passed, metrics_dict)."""
    print(f"\n--- {name} ---")
    metrics = {}
    durations = []
    tokens_list = []
    for i in range(1, N_RUNS + 1):
        ok, r = run_cost_perf(cwd, variant, input_id=str(i))
        if not ok or not r:
            print(f"  Run {i} failed.", file=sys.stderr)
            return False, metrics
        durations.append(r.get("durationMs", 0))
        tokens_list.append(r.get("usage", {}).get("totalTokens", 0))
        print(f"  Run {i}: {durations[-1]:.0f} ms, {tokens_list[-1]} tokens")

    if len(durations) < 2:
        return True, metrics
    mean_d = statistics.mean(durations)
    stdev_d = statistics.stdev(durations)
    cv = stdev_d / mean_d if mean_d else 0
    sorted_d = sorted(durations)
    p50 = sorted_d[len(sorted_d) // 2]
    p95 = sorted_d[int(len(sorted_d) * 0.95)] if len(sorted_d) > 1 else sorted_d[0]

    metrics = {
        "mean_durationMs": round(mean_d, 2),
        "stdev": round(stdev_d, 2),
        "cv": round(cv, 4),
        "p50_ms": round(p50, 2),
        "p95_ms": round(p95, 2),
    }
    print(f"  duration: mean={mean_d:.0f} ms, stdev={stdev_d:.0f}, cv={cv:.2f}, p50={p50:.0f}, p95={p95:.0f}")

    passed = cv <= MAX_CV
    if not passed:
        print(f"  FAIL: coefficient of variation {cv:.2f} > {MAX_CV}", file=sys.stderr)
    else:
        print("  PASS: variance within bounds")
    return passed, metrics


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
    print("\nAll consistency checks passed.")


if __name__ == "__main__":
    main()
