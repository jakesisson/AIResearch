# Cost-Perf Targeted Testing: Reference and Instructions

**Purpose:** Run cost and performance tests only for the **nodes, graphs, or entrypoints that were actually changed** in the research commit (targeted testing), instead of exercising the entire application (breadth testing).

**Audience:** Humans and AI agents setting up or running cost-perf comparisons for Research Data projects (e.g. aruizca-resume, analytics_ai, aigie-io).

---

## 1. Goal

- **Compare** prior vs researched commits on **cost** (token usage) and **performance** (e.g. duration, consistency, cache behavior).
- **Scope** the comparison to the **refactored code path only**: only the nodes, graphs, or chains that the research commit touched. This yields targeted testing, not breadth testing of the full app.

---

## 2. Two Parts of Targeting

| Part | Meaning |
|------|--------|
| **Scope (what to run)** | Which nodes, graphs, or chains were changed in the research commit. Derived from the commit diff (and optionally a small manifest). |
| **Execution (how to run only that)** | A way to run only that scope in both prior and researched clones—e.g. a dedicated script, a config-driven “target nodes” mode, or an extracted micro-benchmark. |

Targeting = **define scope from the commit** + **run only that scope** in each clone; the comparison workflow (prior run → researched run → diff) stays the same.

---

## 3. Defining Scope from the Research Commit

Use the **researched-commit diff** to determine what to run.

### 3.1 What to collect from the diff

- **Files:** Which modules or files changed (e.g. `graph.py`, `research_node.py`).
- **Symbols:** Which functions, nodes, or chains appear in the changed regions (e.g. `research_node`, `create_analysis_plan_node`, `add_node("research", ...)`).
- **Framework concepts:** Map the above to:
  - **Node names** (the string used in `add_node(...)` or in edges).
  - **Chains / runnables** (if the refactor is at chain level).
  - **Tools** (if only tool definitions changed).

### 3.2 How to get scope

- **Manual:** Read the diff; write a small config or manifest listing the target nodes/chains (see [Target spec format](#5-target-spec-format)).
- **Semi-automated:** Script that parses the diff (e.g. grep for `add_node(`, `def ..._node(`, `workflow.add_node`, changed filenames) and suggests “candidate nodes/chains”; a human confirms or edits.

### 3.3 Output

A **scope list** per commit, e.g. “nodes: `research`, `analysis`” or “chain: `create_analysis_plan_node`”. This drives what the runner executes (see [Target spec format](#5-target-spec-format)).

---

## 4. Running Only the Touched Scope

You need a way to execute **only** that scope in both prior and researched clones.

### Option A – Dedicated cost-perf entrypoint

- One script per repo (e.g. `run_cost_perf.py`) that **by design** runs only the slice you care about (one node, one chain, or one subgraph).
- **Targeting:** When adding a new researched commit, **update** that script (or a config it reads) so it invokes only the nodes/chains this commit touched.
- Prior and researched use the same “shape” of script; only the implementation of the touched code differs. No need to run the rest of the app.

### Option B – Main app accepts a “target”

- The application reads e.g. `COST_PERF_TARGET_NODES=research,analysis` or a small manifest file.
- It builds the graph but runs only the listed nodes (e.g. minimal state and invoke only that subgraph or those nodes in sequence).
- Requires the app to support “run only these nodes” (e.g. a test/cost-perf mode).
- Targeting = updating the env or manifest per commit; no separate script per slice.

### Option C – Extracted micro-benchmark

- For each refactoring, add a **small script** that imports only the changed module(s), builds only the touched chain or a minimal graph (one or two nodes), invokes with fixed input, and reports duration and tokens.
- Prior and researched each have this script (same interface, different behavior).
- Runner runs that script in each clone; no need to boot the full application.

---

## 5. Target Spec Format

Use a machine-readable spec so the runner (or an AI) knows what to execute. Examples:

**Environment variables:**

```bash
COST_PERF_TARGET_TYPE=nodes
COST_PERF_TARGET_NODES=research,analysis,synthesis
# OR
COST_PERF_TARGET_TYPE=chain
COST_PERF_TARGET_CHAIN=create_analysis_plan_node
```

**JSON manifest (e.g. `cost_perf_scope.json`):**

```json
{
  "target_type": "nodes",
  "target_nodes": ["research", "analysis", "synthesis"]
}
```

or

```json
{
  "target_type": "chain",
  "target_chain": "create_analysis_plan_node"
}
```

The runner or `run_cost_perf.py` should read this and execute only the specified nodes or chain.

---

## 6. Step-by-Step Instructions (for AI or human)

### Step 1 – Identify touched scope from the commit

1. Get the diff:  
   `git diff <prior_sha> <researched_sha>` or `git show <researched_sha>`.
2. From the diff, collect:
   - Changed file paths.
   - Function names (e.g. `def research_node`, `def create_analysis_plan_node`).
   - Graph node names (e.g. `add_node("research", research_node)` → node name `"research"`).
3. Produce a **target spec**: list of node names and/or chain name(s) that were touched (see [Target spec format](#5-target-spec-format)).
4. Optional: use a script that greps the diff for `add_node(`, `def.*_node(`, and similar to suggest candidates; confirm or edit.

### Step 2 – Make the run respect the scope

- **If the repo already has a narrow cost-perf script** (e.g. only runs one chain): ensure that script runs **exactly** the path the commit touched. If the commit only touches one node, update the script to run only that node (with minimal state) instead of the full graph.
- **If the app normally runs the whole graph:** add a mode (env or config) that runs only the nodes/chains in the target spec (e.g. build state, invoke only those nodes or that subgraph).
- **If using a micro-benchmark:** add a script that imports only the touched components, builds a minimal runnable, invokes with fixed input, and reports duration and tokens. Use that script for both prior and researched.

### Step 3 – Run and compare (unchanged)

- Checkout **prior** → run the **targeted** script (or app in targeted mode) with the same env/config → capture duration and token usage (e.g. to `cost-perf-results.json`).
- Checkout **researched** → run the same targeted script/mode → capture metrics.
- Compare (e.g. with `compare-cost-perf.py` or equivalent). Cost = token usage; performance = duration (and optionally variance, cache effectiveness).

---

## 7. Automation Levels

| Level | Description |
|-------|-------------|
| **Manual** | For each researched commit, read the diff, identify touched nodes/chains, update the cost-perf script or `cost_perf_scope.json` to run only those. |
| **Semi-auto** | Tool parses the diff and suggests “touched nodes: research_node, analysis_node”; human confirms or edits; script or config is updated. |
| **Full auto** | Diff parser + conventions (e.g. “if only `graph.py` and `research_node` changed, target node `research`”) and auto-generate a script that invokes only that node with mock state. More complex and repo-dependent. |

Start with manual or semi-auto; add full auto only if the repo structure is consistent enough.

---

## 8. References

- **Diffs:** Prior vs researched commit diffs are stored in a **diffs folder** (location may vary per workspace); use them when defining scope (see [§3](#3-defining-scope-from-the-research-commit)).
- **LLM constraint:** We only have Azure OpenAI; see [§10 LLM access constraint (Azure-only)](#10-llm-access-constraint-azure-only).
- **Per-project cost-perf docs:**  
  - `Research Data/<project>/README-cost-perf.md`  
  - `Research Data/<project>/cost-perf-results-guide.md`
- **Metrics:** Cost = token usage (input/output/total); performance = duration (and optionally consistency, cache effectiveness, time-to-first-token, etc.).
- **Runner contract:** Each project exposes a cost-perf entrypoint (e.g. `run_cost_perf.py`) that writes a result JSON (e.g. `cost-perf-results.json` with `durationMs`, `usage`). The compare step diffs prior vs researched outputs.

---

## 9. Quick Checklist for Adding Targeted Testing to a Project

- [ ] Get diff for the researched commit and list **touched files** and **symbols** (functions, node names).
- [ ] Write a **target spec** (env vars or `cost_perf_scope.json`) listing only the touched nodes or chain.
- [ ] Ensure the **cost-perf entrypoint** (script or app mode) runs **only** that spec—update the script or add “target nodes” support.
- [ ] Run prior clone with the targeted entrypoint → capture JSON.
- [ ] Run researched clone with the same targeted entrypoint → capture JSON.
- [ ] Compare; document results in the project’s cost-perf docs.

---

## 10. LLM access constraint (Azure-only)

**Situation:** Many repositories were built for different LLM providers or models (OpenAI, Anthropic, Ollama, etc.). We only have access to **Azure OpenAI**. Cost-perf runs must use Azure OpenAI so that prior vs researched comparisons are on a single, consistent baseline.

**Implications:**

- Cost and latency are model- and provider-specific. We do **not** reproduce each repo’s original model choice; we compare prior vs researched **under Azure OpenAI**.
- Document this clearly so results are interpreted correctly: “Prior vs researched, both run on Azure OpenAI (model X).”

**How to handle:**

| Approach | Use when |
|----------|----------|
| **Single Azure model for all** | Default. One model (e.g. `gpt-4o`) for every repo’s cost-perf run. Comparable across repos; simple. |
| **Per-repo mapping** | A repo was written for a specific model (e.g. gpt-4, or “claude”); map to an Azure equivalent (e.g. Azure gpt-4, or gpt-4o as stand-in) and document the mapping. |
| **Explicit baseline** | State in docs: “All cost-perf uses Azure OpenAI with [model/deployment]. Per-repo overrides: [list or path to manifest].” |

**Implementation:**

- Drive model/deployment via **env or config** (e.g. `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_MODEL`) so the same code path runs in prior and researched; only the backend is swapped when cost-perf mode is on (e.g. `COST_PERF=1`).
- Optional: small manifest per repo or global list: “for cost-perf, use this Azure model” so overrides are explicit and AI/humans know the rule.

**References in this setup:**

- **Diffs:** Prior vs researched diffs are stored in a **diffs folder** (path may vary per workspace); use them to define [scope](#3-defining-scope-from-the-research-commit).
- **Constraint:** Do not assume access to OpenAI direct, Anthropic, or local models; assume **Azure OpenAI only** unless stated otherwise.

---

*Document version: 1.0. Use this file as the single reference for “targeted” cost-perf testing (nodes/graphs touched by the research commit) when briefing an AI or onboarding someone to the process.*
