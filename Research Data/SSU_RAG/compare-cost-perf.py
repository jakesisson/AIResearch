#!/usr/bin/env python3
"""
Runs cost-perf on both prior and researched SSU_RAG clones, then writes a comparison report.
Scope: RAG answer chain only (fixture query + fixed context; no vector search). See cost_perf_scope.json.

Usage (from Research Data/SSU_RAG):
  python compare-cost-perf.py
"""
import os
import sys
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PRIOR_DIR = ROOT / "SSU_RAG-4228e4e133cd201ebb2e04d0e40c3bf27b775b4c"
RESEARCHED_DIR = ROOT / "SSU_RAG-b9b2befc1271c08e73efc34212c8d4ea229f1b63"
FIXTURE_PATH = ROOT / "cost_perf_fixture_query.txt"


def get_run_cmd(clone_dir: Path) -> list:
    """Return [python_exe, 'run_cost_perf.py'] or ['uv', 'run', 'python', 'run_cost_perf.py']."""
    shared_venv = ROOT / ".venv" / "bin" / "python"
    if shared_venv.exists():
        return [str(shared_venv), "run_cost_perf.py"]
    shared_venv_exe = ROOT / ".venv" / "Scripts" / "python.exe"
    if shared_venv_exe.exists():
        return [str(shared_venv_exe), "run_cost_perf.py"]
    clone_venv = clone_dir / ".venv" / "bin" / "python"
    if clone_venv.exists():
        return [str(clone_venv), "run_cost_perf.py"]
    clone_venv_exe = clone_dir / ".venv" / "Scripts" / "python.exe"
    if clone_venv_exe.exists():
        return [str(clone_venv_exe), "run_cost_perf.py"]
    # Prefer uv run so clone's pyproject.toml/uv.lock provide deps
    if (clone_dir / "uv.lock").exists():
        return ["uv", "run", "python", "run_cost_perf.py"]
    return [sys.executable, "run_cost_perf.py"]


def load_env_file(path: Path) -> dict:
    out = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def run_test(cwd: Path, variant: str) -> tuple[bool, Path]:
    results_path = cwd / "cost-perf-results.json"
    cmd = get_run_cmd(cwd)
    env = os.environ.copy()
    env["COST_PERF_VARIANT"] = variant
    env["COST_PERF"] = "1"
    env["COST_PERF_FIXTURE_PATH"] = str(FIXTURE_PATH)
    for base in (ROOT.parent.parent, ROOT):
        for name in ("master.env", ".env"):
            env.update(load_env_file(base / name))
    proc = subprocess.run(cmd, cwd=cwd, env=env, capture_output=False)
    return proc.returncode == 0, results_path


def load_results(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def main():
    if not PRIOR_DIR.is_dir() or not RESEARCHED_DIR.is_dir():
        print("Prior or researched clone not found.", file=sys.stderr)
        sys.exit(1)
    if not FIXTURE_PATH.exists():
        print(f"Fixture not found: {FIXTURE_PATH}", file=sys.stderr)
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
        "prior": {
            "durationMs": prior_results.get("durationMs", 0),
            "inputTokens": pu.get("inputTokens"),
            "outputTokens": pu.get("outputTokens"),
            "totalTokens": pu.get("totalTokens"),
            "usageError": prior_results.get("usageError"),
        },
        "researched": {
            "durationMs": researched_results.get("durationMs", 0),
            "inputTokens": ru.get("inputTokens"),
            "outputTokens": ru.get("outputTokens"),
            "totalTokens": ru.get("totalTokens"),
            "usageError": researched_results.get("usageError"),
        },
        "delta": {
            "durationMs": (researched_results.get("durationMs") or 0) - (prior_results.get("durationMs") or 0),
            "totalTokens": (ru.get("totalTokens") or 0) - (pu.get("totalTokens") or 0),
        },
    }
    report_path = ROOT / "compare-cost-perf-report.json"
    report_json = json.dumps(report, indent=2)
    report_path.write_text(report_json, encoding="utf-8")
    print("\n--- Comparison (prior vs researched) ---\n")
    print("Prior:      ", report["prior"])
    print("Researched: ", report["researched"])
    print("Delta:      ", report["delta"])
    for label, key in [("Prior", "prior"), ("Researched", "researched")]:
        err = report[key].get("usageError")
        if err and report[key].get("totalTokens") is None:
            print(f"\n{label} token usage is null because: {err}")
    print("\n--- Report JSON ---\n")
    print(report_json)
    print(f"\nReport written to {report_path}")


if __name__ == "__main__":
    main()
