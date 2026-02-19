#!/usr/bin/env python3
"""
Runs cost-perf test on both prior and researched aigie-io clones, then writes a comparison report.
Loads master.env from AIResearch so Azure vars are available.

Usage (from Research Data/aigie-io):
  python compare-cost-perf.py
"""
import os
import sys
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PRIOR_DIR = ROOT / "aigie-io-ecfb314b546018e0e745344ce391a89c5d78774a"
RESEARCHED_DIR = ROOT / "aigie-io-de4c24820cd5967f1abff5f4af6dafab0207e618"
MASTER_ENV = ROOT / ".." / ".." / "master.env"


def load_master_env():
    if not MASTER_ENV.exists():
        return
    with open(MASTER_ENV, encoding="utf-8") as f:
        for line in f:
            line = line.split("#", 1)[0].strip()
            if "=" in line:
                key, _, value = line.partition("=")
                key, value = key.strip(), value.strip()
                if key and os.environ.get(key) is None:
                    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                        value = value[1:-1]
                    os.environ[key] = value


def run_test(cwd: Path, variant: str):
    results_path = cwd / "cost-perf-results.json"
    venv_py = ROOT / ".venv" / "bin" / "python"
    if not venv_py.exists():
        venv_py = ROOT / ".venv" / "Scripts" / "python.exe"
    # Use venv path as-is (do not resolve: .venv/bin/python may symlink to system python)
    python_exe = str(venv_py) if venv_py.exists() else sys.executable
    env = os.environ.copy()
    env["COST_PERF_VARIANT"] = variant
    env["COST_PERF_PYTHON"] = python_exe  # so run_cost_perf.py uses same venv for subprocess
    proc = subprocess.run([python_exe, "run_cost_perf.py"], cwd=cwd, env=env, capture_output=False)
    return proc.returncode == 0, results_path


def load_results(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def main():
    load_master_env()
    if not PRIOR_DIR.is_dir() or not RESEARCHED_DIR.is_dir():
        print("Prior or researched clone not found.", file=sys.stderr)
        sys.exit(1)

    print("Running cost-perf on PRIOR commit...\n")
    ok_prior, path_prior = run_test(PRIOR_DIR, "prior")
    if not ok_prior:
        print("Prior run failed.", file=sys.stderr)
        sys.exit(1)

    print("\nRunning cost-perf on RESEARCHED commit...\n")
    ok_researched, path_researched = run_test(RESEARCHED_DIR, "researched")
    if not ok_researched:
        print("Researched run failed.", file=sys.stderr)
        sys.exit(1)

    prior_results = load_results(path_prior)
    researched_results = load_results(path_researched)
    if not prior_results or not researched_results:
        print("Could not load one or both result files.", file=sys.stderr)
        sys.exit(1)

    pu = prior_results.get("usage") or {}
    ru = researched_results.get("usage") or {}
    report = {
        "prior": {"durationMs": prior_results.get("durationMs", 0), "inputTokens": pu.get("inputTokens"), "outputTokens": pu.get("outputTokens"), "totalTokens": pu.get("totalTokens")},
        "researched": {"durationMs": researched_results.get("durationMs", 0), "inputTokens": ru.get("inputTokens"), "outputTokens": ru.get("outputTokens"), "totalTokens": ru.get("totalTokens")},
        "delta": {"durationMs": researched_results.get("durationMs", 0) - prior_results.get("durationMs", 0), "totalTokens": (ru.get("totalTokens") or 0) - (pu.get("totalTokens") or 0)},
    }
    report_path = ROOT / "compare-cost-perf-report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("\n--- Comparison (prior vs researched) ---\n")
    print("Prior:      ", report["prior"])
    print("Researched: ", report["researched"])
    print("Delta:      ", report["delta"])
    print(f"\nReport written to {report_path}")


if __name__ == "__main__":
    main()
