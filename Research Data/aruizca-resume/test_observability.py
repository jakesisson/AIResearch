#!/usr/bin/env python3
"""
Observability: run cost-perf once with captured stdout; assert that
performance monitoring output appears. Writes prior/researched markers to
.cost-perf-observability.json for comparison.
"""
import json
import sys
import subprocess
from pathlib import Path

from _cost_perf_common import (
    ROOT,
    PRIOR_DIR,
    RESEARCHED_DIR,
    load_master_env,
    build_core,
)

MARKERS = [b"Executing", b"Generate JSON Resume", b"\xe2\x8f\xb1", b"Calling OpenAI", b"Langchain"]
RESULT_FILE = ROOT / ".cost-perf-observability.json"


def run_cost_perf_capture(cwd: Path, variant: str) -> tuple[bool, bytes]:
    import os
    env = os.environ.copy()
    env["COST_PERF_VARIANT"] = variant
    env["COST_PERF"] = "1"
    proc = subprocess.run(
        ["node", str(cwd / "packages" / "core" / "dist" / "cost-perf.js")],
        cwd=cwd,
        env=env,
        capture_output=True,
    )
    return proc.returncode == 0, (proc.stdout or b"") + (proc.stderr or b"")


def test_clone(name: str, cwd: Path, variant: str) -> tuple[bool, dict]:
    """Returns (passed, metrics_dict with markers list)."""
    print(f"\n--- {name} ---")
    metrics = {}
    if not build_core(cwd):
        print("  Build failed.", file=sys.stderr)
        return False, metrics
    ok, out = run_cost_perf_capture(cwd, variant)
    if not ok:
        print("  Run failed.", file=sys.stderr)
        return False, metrics
    found = [m.decode("utf-8", errors="replace") for m in MARKERS if m in out]
    metrics = {"markers": found}
    if not found:
        print(f"  FAIL: no observability marker in stdout/stderr (tried {MARKERS})", file=sys.stderr)
        return False, metrics
    print(f"  PASS: found marker(s) in output: {found}")
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
    print("\nAll observability checks passed.")


if __name__ == "__main__":
    main()
