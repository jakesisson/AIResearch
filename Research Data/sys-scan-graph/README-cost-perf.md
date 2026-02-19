# Cost & performance (sys-scan-graph – prior vs researched)

Measures **cost and performance** of the agent graph_pipeline (load → validate → augment → correlate → baseline → reduce → summarize → actions → output) between prior and researched commits. Scope is derived from **diffs/sys-scan-graph** (targeted testing).

---

## Repository states

| State        | Clone directory                                                                 | Commit   |
|-------------|-----------------------------------------------------------------------------------|----------|
| **Prior**   | `sys-scan-graph-d0e0ea8a9d030175fb196f8f4f30ecf378bd0f10`                         | d0e0ea8a |
| **Researched** | `sys-scan-graph-b9a4506472e8dd660ce3d5d2e2b4f2d076a4d16f`                       | b9a45064 |

Diff summary: `diffs/sys-scan-graph/DIFF_SUMMARY.md`. Touched files include `agent/graph.py`, `agent/graph_pipeline.py`, `agent/pipeline.py`, `agent/graph_nodes_performance.py` (new), `agent/graph_nodes_reliability.py` (new), `agent/graph_nodes_scalability.py` (new).

---

## Target scope

- **Scope:** Full graph_pipeline run (same node sequence in both clones). Defined in **cost_perf_scope.json**.
- **Fixture:** By default **cost_perf_fixture_report.json** (minimal: no findings). For real-world validity use **stress** so cost/performance deltas are visible under load:
  - **cost_perf_fixture_report.json** – minimal (empty results).
  - **cost_perf_fixture_report_stress.json** – 22 findings across network, kernel_params, process, suid, world_writable; use with `COST_PERF_STRESS=1`.
- **LLM:** Azure OpenAI only (see Research Data/cost-perf-targeted-testing.md §10). Token usage is reported when the Azure call succeeds; duration is always reported.

---

## Why is token usage null?

Token usage will be **null** if the run does not get real usage from Azure. Two common causes:

1. **langchain-openai not installed**  
   The Azure provider requires `langchain-openai`. Install it in the same venv used to run cost-perf, e.g.:
   ```bash
   .venv/bin/pip install langchain-openai
   ```
   If the install upgrades `langchain-core` and breaks langgraph, try pinning:  
   `pip install 'langchain-core>=0.2.22,<0.3'` then `pip install 'langchain-openai>=0.2,<0.3'`.

2. **Azure deployment not found (404 DeploymentNotFound)**  
   The code uses **AZURE_OPENAI_DEPLOYMENT** (default `gpt-4o`) as the deployment name. It must match a deployment that exists on your Azure OpenAI resource. Set it in **master.env** (repo root) or in the environment, e.g.:
   ```bash
   AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
   ```
   Use the exact deployment name shown in the Azure portal for your resource.

When usage is null due to an Azure error, the run prints the error (e.g. `Cost-perf: Azure invoke failed: ...`) and the report includes **usageError** so you can see the reason.

---

## Requirements

- A **shared** `.venv` in this directory (Research Data/sys-scan-graph) with the agent dependencies installed. Create it once with:
  - `python3 -m venv .venv`
  - `.venv/bin/pip install -r sys-scan-graph-b9a4506472e8dd660ce3d5d2e2b4f2d076a4d16f/agent/requirements.txt`
- **compare-cost-perf.py** uses `.venv/bin/python` when present, then falls back to a clone’s `agent/venv` or the current `python`.

---

## How to run

From **Research Data/sys-scan-graph**:

```bash
python compare-cost-perf.py
```

To stress the pipeline (recommended when comparing cost/performance improvements):

```bash
COST_PERF_STRESS=1 python compare-cost-perf.py
```

This runs `run_cost_perf.py` in each clone (using each clone’s `agent/venv` if present) and writes **compare-cost-perf-report.json**.

To run a single clone:

```bash
cd sys-scan-graph-d0e0ea8a9d030175fb196f8f4f30ecf378bd0f10
COST_PERF_VARIANT=prior python run_cost_perf.py
# or
cd sys-scan-graph-b9a4506472e8dd660ce3d5d2e2b4f2d076a4d16f
COST_PERF_VARIANT=researched python run_cost_perf.py
```

---

## Output files

| File                         | Location              | Contents |
|-----------------------------|------------------------|----------|
| **compare-cost-perf-report.json** | Research Data/sys-scan-graph | prior, researched, delta (durationMs, tokens) |
| **cost-perf-results.json**  | Each clone root        | Single run: variant, durationMs, usage |

Delta: `researched - prior` for duration and totalTokens.
