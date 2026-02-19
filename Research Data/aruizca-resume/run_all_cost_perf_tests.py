#!/usr/bin/env python3
"""
Run the cost-perf comparison and all performance tests, then write a single
JSON report. The report compares prior vs researched for each metric (no pass/fail
in the tests section—only comparable numbers).

Usage (from Research Data/aruizca-resume):
  python run_all_cost_perf_tests.py

Output: cost-perf-report.json (comparison + per-test prior/researched metrics).
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMPARE_SCRIPT = ROOT / "compare-cost-perf.py"
COMPARE_REPORT = ROOT / "compare-cost-perf-report.json"
OUTPUT_REPORT = ROOT / "cost-perf-report.json"
# test_key -> result file written by that test
TESTS = [
    ("cache_effectiveness", "test_cache_effectiveness.py", ".cost-perf-cache_effectiveness.json"),
    ("consistency", "test_consistency.py", ".cost-perf-consistency.json"),
    ("cost_per_unique_request", "test_cost_per_unique_request.py", ".cost-perf-cost_per_unique_request.json"),
    ("observability", "test_observability.py", ".cost-perf-observability.json"),
]


def run_capture(args, cwd=None):
    p = subprocess.run(args, cwd=cwd or ROOT, capture_output=True, text=True)
    return p.returncode == 0, (p.stdout or "") + (p.stderr or "")


def main():
    report = {
        "comparison": None,
        "tests": {},
        "summary": {"all_passed": True},
    }

    # 1. Run comparison (writes compare-cost-perf-report.json)
    print("Running compare-cost-perf.py...")
    ok, _ = run_capture([sys.executable, str(COMPARE_SCRIPT)])
    if ok and COMPARE_REPORT.exists():
        report["comparison"] = json.loads(COMPARE_REPORT.read_text(encoding="utf-8"))
        print("  Comparison report loaded.")
    else:
        report["comparison"] = {"error": "compare-cost-perf.py failed or no report"}
        report["summary"]["all_passed"] = False
        print("  Comparison failed.", file=sys.stderr)

    # 2. Run each test; each writes prior/researched metrics to a dot file
    for key, script_name, result_file in TESTS:
        script = ROOT / script_name
        result_path = ROOT / result_file
        if not script.exists():
            report["tests"][key] = {"error": f"script not found: {script_name}"}
            report["summary"]["all_passed"] = False
            continue
        print(f"Running {script_name}...")
        passed, _ = run_capture([sys.executable, str(script)])
        if not passed:
            report["summary"]["all_passed"] = False
        print(f"  {'PASS' if passed else 'FAIL'}")

        if result_path.exists():
            try:
                data = json.loads(result_path.read_text(encoding="utf-8"))
                report["tests"][key] = data  # { "prior": {...}, "researched": {...} }
            except Exception:
                report["tests"][key] = {"error": f"could not load {result_file}"}
        else:
            report["tests"][key] = {"error": f"no results file: {result_file}"}

    OUTPUT_REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nReport written to {OUTPUT_REPORT}")
    return 0 if report["summary"]["all_passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
