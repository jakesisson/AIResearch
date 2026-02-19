"""
Shared helpers for aruizca-resume cost-perf tests.
Load master.env, build core, run cost-perf with optional env overrides.
"""
import os
import subprocess
import json
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
                    continue
                if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                    value = value[1:-1]
                os.environ[key] = value
    if os.environ.get("AZURE_OPENAI_API_KEY") and not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = os.environ["AZURE_OPENAI_API_KEY"]


def build_core(cwd: Path) -> bool:
    env = os.environ.copy()
    env["COST_PERF"] = "1"
    proc = subprocess.run(
        ["npm", "run", "build"],
        cwd=cwd / "packages" / "core",
        env=env,
        capture_output=True,
        text=True,
    )
    return proc.returncode == 0


def run_cost_perf(
    cwd: Path,
    variant: str,
    input_id: str = "",
    force_refresh: bool = True,
    capture_output: bool = False,
) -> tuple[bool, dict | None]:
    """Run node packages/core/dist/cost-perf.js. Returns (success, results_dict or None)."""
    env = os.environ.copy()
    env["COST_PERF_VARIANT"] = variant
    env["COST_PERF"] = "1"
    env["COST_PERF_FORCE_REFRESH"] = "1" if force_refresh else "0"
    if input_id:
        env["COST_PERF_INPUT_ID"] = str(input_id)
    results_path = cwd / "cost-perf-results.json"
    proc = subprocess.run(
        ["node", str(cwd / "packages" / "core" / "dist" / "cost-perf.js")],
        cwd=cwd,
        env=env,
        capture_output=capture_output,
        text=True if capture_output else False,
    )
    if proc.returncode != 0:
        return False, None
    try:
        data = json.loads(results_path.read_text(encoding="utf-8"))
        return True, data
    except Exception:
        return False, None
