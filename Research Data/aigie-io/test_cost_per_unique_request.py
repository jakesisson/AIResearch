#!/usr/bin/env python3
"""
Cost per unique request: run M distinct inputs each K times (M=3, K=2).
aigie-io has no cache, so total_tokens will be ~ 2 * ideal; we allow ceiling = 2*ideal*1.2.
Writes .cost-perf-cost_per_unique_request.json.
"""
import json
import sys
from pathlib import Path

from _cost_perf_common import ROOT, PRIOR_DIR, RESEARCHED_DIR, load_master_env, run_cost_perf

M_UNIQUE = 3
K_REPEATS = 2
SLACK = 2.0 * 1.2
RESULT_FILE = ROOT / ".cost-perf-cost_per_unique_request.json"


def test_clone(name: str, cwd: Path, variant: str) -> tuple[bool, dict]:
    print(f"\n--- {name} ---")
    metrics = {}
    total_tokens = 0
    first_run_tokens_per_id = []
    for mid in range(1, M_UNIQUE + 1):
        for rep in range(K_REPEATS):
            force_refresh = rep == 0
            ok, r = run_cost_perf(cwd, variant, input_id=str(mid), force_refresh=force_refresh)
            if not ok or not r:
                print(f"  Run id={mid} rep={rep} failed.", file=sys.stderr)
                return False, metrics
            t = r.get("usage", {}).get("totalTokens", 0)
            total_tokens += t
            if rep == 0:
                first_run_tokens_per_id.append(t)
    ideal = sum(first_run_tokens_per_id)
    ceiling = ideal * SLACK
    metrics = {"total_tokens": total_tokens, "ideal_tokens": ideal}
    print(f"  Total tokens (M*K runs): {total_tokens}")
    print(f"  Ideal (M unique): {ideal}, ceiling (no-cache 2*ideal*1.2): {ceiling:.0f}")
    passed = total_tokens <= ceiling
    if not passed:
        print(f"  FAIL: total tokens {total_tokens} > {ceiling:.0f}", file=sys.stderr)
    else:
        print("  PASS: total tokens within expected range (no cache)")
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
    print("\nAll cost-per-unique-request checks passed.")


if __name__ == "__main__":
    main()
