#!/usr/bin/env python3
"""
Runs cost-perf on both prior and researched aruizca-resume clones (resume LLM path),
then writes a comparison report. Loads master.env from AIResearch.

Usage (from Research Data/aruizca-resume):
  python compare-cost-perf.py
"""
import os
import sys
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PRIOR_DIR = ROOT / "aruizca-resume-efde30ea49726f13e830963f6d971117387bc2c8"
RESEARCHED_DIR = ROOT / "aruizca-resume-8108951369a79d1ed04b08998697c87d5a6e3f9d"
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
                if not key or value.strip().startswith("${"):
                    continue  # skip placeholders / unexpanded vars
                if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                    value = value[1:-1]
                os.environ[key] = value
    # Some LangChain/OpenAI code paths expect OPENAI_API_KEY; use Azure key if set
    if os.environ.get("AZURE_OPENAI_API_KEY") and not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = os.environ["AZURE_OPENAI_API_KEY"]


def run_test(cwd: Path, variant: str) -> tuple[bool, Path]:
    results_path = cwd / "cost-perf-results.json"
    env = os.environ.copy()
    env["COST_PERF_VARIANT"] = variant
    env["COST_PERF"] = "1"
    # Build core (npm in packages/core)
    build = subprocess.run(
        ["npm", "run", "build"],
        cwd=cwd / "packages" / "core",
        env=env,
        capture_output=False,
    )
    if build.returncode != 0:
        return False, results_path
    # Run cost-perf from clone root so process.cwd() is clone root for output path
    proc = subprocess.run(
        ["node", str(cwd / "packages" / "core" / "dist" / "cost-perf.js")],
        cwd=cwd,
        env=env,
        capture_output=False,
    )
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
    prior_total = pu.get("totalTokens", 0)
    researched_total = ru.get("totalTokens", 0)
    prior_ms = prior_results.get("durationMs", 0)
    researched_ms = researched_results.get("durationMs", 0)

    report = {
        "prior": {
            "durationMs": prior_ms,
            "inputTokens": pu.get("inputTokens", 0),
            "outputTokens": pu.get("outputTokens", 0),
            "totalTokens": prior_total,
        },
        "researched": {
            "durationMs": researched_ms,
            "inputTokens": ru.get("inputTokens", 0),
            "outputTokens": ru.get("outputTokens", 0),
            "totalTokens": researched_total,
        },
        "delta": {
            "durationMs": round(researched_ms - prior_ms, 2),
            "totalTokens": researched_total - prior_total,
        },
    }

    report_path = ROOT / "compare-cost-perf-report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print("\n--- Comparison (prior vs researched) ---")
    print("Prior:      ", report["prior"])
    print("Researched: ", report["researched"])
    print("Delta:      ", report["delta"])
    print(f"\nReport written to {report_path}")


if __name__ == "__main__":
    main()
