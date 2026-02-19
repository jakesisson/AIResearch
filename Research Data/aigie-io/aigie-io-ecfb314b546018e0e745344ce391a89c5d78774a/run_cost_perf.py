#!/usr/bin/env python3
"""
Cost & performance test for aigie-io (prior commit).
Runs the LangGraph example (advanced_langgraph_features.py) in cost-perf mode with Azure OpenAI.
Loads master.env from AIResearch. Set COST_PERF_VARIANT=researched|prior for compare.
"""
import os
import sys
import json
import subprocess
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()
master_env = Path(__file__).resolve().parent / ".." / ".." / "master.env"
if master_env.exists():
    load_dotenv(master_env)

ROOT = Path(__file__).resolve().parent
# Prefer explicit venv from compare-cost-perf.py so subprocess uses same env
PYTHON = os.environ.get("COST_PERF_PYTHON")
if not PYTHON:
    VENV_PY = (ROOT / ".." / ".venv" / "bin" / "python").resolve()
    if not VENV_PY.exists():
        VENV_PY = (ROOT / ".." / ".venv" / "Scripts" / "python.exe").resolve()
    PYTHON = str(VENV_PY) if VENV_PY.exists() else sys.executable


def main():
    variant = os.environ.get("COST_PERF_VARIANT", "prior")
    env = os.environ.copy()
    env["COST_PERF"] = "1"
    env["COST_PERF_VARIANT"] = variant
    if master_env.exists():
        env["COST_PERF_ENV"] = str(master_env.resolve())

    proc = subprocess.run(
        [PYTHON, "examples/advanced_langgraph_features.py"],
        cwd=ROOT,
        env=env,
    )
    if proc.returncode != 0:
        sys.exit(proc.returncode)

    results_path = ROOT / "cost-perf-results.json"
    if not results_path.exists():
        print("cost-perf-results.json not found after run", file=sys.stderr)
        sys.exit(1)
    data = json.loads(results_path.read_text(encoding="utf-8"))
    data["variant"] = variant
    data["timestamp"] = data.get("timestamp")
    results_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(json.dumps(data, indent=2))
    print(f"\nWrote {results_path}")


if __name__ == "__main__":
    main()
