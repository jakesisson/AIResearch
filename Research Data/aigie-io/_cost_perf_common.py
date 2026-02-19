"""
Shared helpers for aigie-io cost-perf tests.
Load master.env, run cost-perf (run_cost_perf.py → advanced_langgraph_features.py) in each clone.
"""
import os
import subprocess
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PRIOR_DIR = ROOT / "aigie-io-ecfb314b546018e0e745344ce391a89c5d78774a"
RESEARCHED_DIR = ROOT / "aigie-io-de4c24820cd5967f1abff5f4af6dafab0207e618"
MASTER_ENV = ROOT / ".." / ".." / "master.env"


def _python_exe():
    venv_py = ROOT / ".venv" / "bin" / "python"
    if not venv_py.exists():
        venv_py = ROOT / ".venv" / "Scripts" / "python.exe"
    return str(venv_py) if venv_py.exists() else None


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
                if os.environ.get(key) is None:
                    os.environ[key] = value


def run_cost_perf(
    cwd: Path,
    variant: str,
    input_id: str = "",
    force_refresh: bool = True,
    capture_output: bool = False,
) -> tuple[bool, dict | None]:
    """Run run_cost_perf.py in clone (which runs advanced_langgraph_features.py). Returns (success, results_dict or None)."""
    python_exe = _python_exe()
    if not python_exe:
        return False, None
    env = os.environ.copy()
    env["COST_PERF_VARIANT"] = variant
    env["COST_PERF"] = "1"
    env["COST_PERF_FORCE_REFRESH"] = "1" if force_refresh else "0"
    if input_id:
        env["COST_PERF_INPUT_ID"] = str(input_id)
    # So run_cost_perf.py uses same venv for subprocess
    env["COST_PERF_PYTHON"] = python_exe
    results_path = cwd / "cost-perf-results.json"
    proc = subprocess.run(
        [python_exe, "run_cost_perf.py"],
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
