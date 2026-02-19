#!/usr/bin/env python3
"""
Observability: run cost-perf once with captured stdout; assert that
cost-perf output appears (e.g. "Cost-perf", "advanced_langgraph_features"). Writes .cost-perf-observability.json.
"""
import json
import os
import sys
import subprocess
from pathlib import Path

from _cost_perf_common import (
    ROOT,
    PRIOR_DIR,
    RESEARCHED_DIR,
    load_master_env,
    _python_exe,
)

MARKERS = [b"Cost-perf", b"advanced_langgraph_features", b"durationMs", b"variant"]
RESULT_FILE = ROOT / ".cost-perf-observability.json"


def run_cost_perf_capture(cwd: Path, variant: str) -> tuple[bool, bytes]:
    python_exe = _python_exe()
    if not python_exe:
        return False, b""
    env = os.environ.copy()
    env["COST_PERF_VARIANT"] = variant
    env["COST_PERF"] = "1"
    env["COST_PERF_PYTHON"] = python_exe
    proc = subprocess.run(
        [python_exe, "run_cost_perf.py"],
        cwd=cwd,
        env=env,
        capture_output=True,
    )
    return proc.returncode == 0, (proc.stdout or b"") + (proc.stderr or b"")


def test_clone(name: str, cwd: Path, variant: str) -> tuple[bool, dict]:
    """Returns (passed, metrics_dict with markers list)."""
    print(f"\n--- {name} ---")
    metrics = {}
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
