# Cost/Performance Targeted Testing Guide

**Purpose:** Run cost and performance comparisons only for the **nodes, graphs, or chains that were actually changed** in the research commit (targeted testing), instead of exercising the entire application (breadth testing). This document is intended for both humans and AI assistants as reference and step-by-step instructions.

---

## 1. Goal

- **Breadth testing:** Run the full app in prior vs researched clones and compare metrics (tokens, duration, etc.) for the whole run.
- **Targeted testing:** Identify which nodes/graphs/chains were modified in the research commit, then run **only those code paths** in prior and researched clones and compare metrics for that slice.

Targeted testing gives more relevant signal (changes in the refactored code) and can reduce noise and runtime.

---

## 2. Prerequisites

- Two clones (or checkouts): **prior** (baseline) and **researched** (after refactor).
- A way to run cost-perf in each clone (e.g. `run_cost_perf.py` or equivalent) that emits metrics (tokens, duration, etc.) in a consistent format (e.g. JSON).
- The research commit should address **Cost** or **Performance** refactoring (per Agents_Refactoring.pdf): token usage, latency, caching, etc.

---

## 3. Identifying “Touched” Scope from the Research Commit

**Input:** The diff between prior and researched (e.g. `git diff prior_sha researched_sha` or `git show researched_sha`).

**Output:** A scope list that the runner or scripts can use, e.g.:

- **Node names** (LangGraph): the string keys used in `add_node("node_name", ...)`.
- **Chain / runnable names** (LangChain): the function or chain that was refactored.
- **Tools:** if only tool implementations changed.

### 3.1 What to Extract from the Diff

1. **Changed files** – Which modules or files were modified (e.g. `graph.py`, `nodes/research.py`).
2. **Symbols in those files:**
   - Function definitions: `def research_node(`, `def create_analysis_plan_node(`.
   - Graph construction: `add_node("research", research_node)`, `workflow.add_node("analysis", ...)`.
   - Tool or chain names if they appear in the diff.
3. **Mapping to “runnable” concepts:**
   - For LangGraph: collect the **node names** (first argument of `add_node`) that correspond to changed functions.
   - For LangChain: collect the **chain or runnable** name/function that was changed.
   - For tool-only changes: the **tool name(s)**.

### 3.2 Scope Spec Format (Suggested)

Use a small machine-readable spec so scripts and AI can target the same scope. Examples:

**Option A – Node list (e.g. JSON):**

```json
{
  "target_type": "nodes",
  "target_nodes": ["research", "analysis", "synthesis"]
}
```

**Option B – Single chain (e.g. env or JSON):**

```json
{
  "target_type": "chain",
  "target_chain": "create_analysis_plan_node"
}
```

**Option C – Config file (e.g. `cost_perf_scope.json` in repo root or Research Data project folder):**

- Same structure as above; the cost-perf runner or `run_cost_perf.py` reads this file and runs only the listed nodes/chain.

### 3.3 Automation Level

- **Manual:** Read the diff, list touched nodes/chains, write the scope spec (e.g. `cost_perf_scope.json`) by hand.
- **Semi-automated:** Script that parses the diff (e.g. grep for `add_node(`, `def ..._node(`, changed filenames), suggests `target_nodes` or `target_chain`; a human confirms or edits.
- **Fully automated:** Diff parser + heuristics (e.g. “if only `graph.py` and `research_node` changed, target = node `research`”) and auto-generate the scope spec. More project-specific and brittle.

---

## 4. Running Only the Touched Scope

The app (or a dedicated script) must be able to execute **only** the targeted nodes/chain, not the full application. Three patterns:

### 4.1 Dedicated Cost-Perf Entrypoint (Recommended)

- **What:** A script (e.g. `run_cost_perf.py`) that, by design, runs only the slice you care about (one node, one chain, or a minimal subgraph).
- **Targeting:** When adding or updating a researched commit, **update this script** (or a config it reads, e.g. `cost_perf_scope.json`) so it invokes only the nodes/chains touched in that commit.
- **Prior vs Researched:** Both clones use the same script name and interface; only the implementation of the touched code differs. No need to run the rest of the app.

### 4.2 App “Target” Mode

- **What:** The main application reads a target spec (env var like `COST_PERF_TARGET_NODES=research,analysis` or a manifest file) and runs only those nodes (e.g. by building minimal state and invoking only that subgraph or those nodes in sequence).
- **Targeting:** Update the env or manifest per commit; the same app binary/script is used with different config.
- **Requirement:** The codebase must support “run only these nodes” (e.g. test mode or a dedicated entrypoint that does that).

### 4.3 Extracted Micro-Benchmark

- **What:** For each refactoring, add a small script that imports only the changed module(s), builds only the touched chain or a minimal graph (e.g. one or two nodes), invokes with fixed input, and reports duration and token usage.
- **Prior vs Researched:** Each clone has this script (same interface, different behavior). The runner runs that script in each clone and compares outputs.
- **Effort:** One-time extraction per refactoring; good when the full app is heavy or hard to “scope” internally.

---

## 5. Step-by-Step Instructions (Targeted Testing)

1. **Get the diff**  
   `git diff <prior_sha> <researched_sha>` (or `git show <researched_sha>`).

2. **Produce a scope spec**  
   From the diff, identify touched node names, chain names, or tools (see §3). Write a scope spec (e.g. `cost_perf_scope.json`) with `target_type` and either `target_nodes` or `target_chain`.

3. **Ensure the run is scoped**  
   - If the repo already has a narrow cost-perf script (e.g. only one node/chain): ensure it matches the touched scope; if the commit touches different nodes, update the script or config to run only those.
   - If the app supports a target mode: set env or manifest to the scope spec and run the app in that mode.
   - Otherwise: add or use a micro-benchmark script that runs only the touched components.

4. **Run in prior clone**  
   Checkout prior, run the scoped entrypoint (with same input/config as researched), capture metrics (tokens, duration, etc.) to a file (e.g. JSON).

5. **Run in researched clone**  
   Checkout researched, run the same scoped entrypoint with the same input/config, capture metrics.

6. **Compare**  
   Use existing compare logic (e.g. `compare-cost-perf.py` or equivalent) to diff the two metric outputs. The comparison is now over the **targeted** path only.

---

## 6. Reference for AI Assistants

- **Targeted testing** = run cost-perf only for code paths (nodes/graphs/chains) that were **modified in the research commit**.
- **Scope** comes from the commit diff: changed files → symbols (e.g. `add_node("x", ...)`, `def x_node(`) → list of node/chain names.
- **Execution** is via: (A) a dedicated cost-perf script that runs only that scope, (B) app target mode reading a scope spec, or (C) an extracted micro-benchmark for the touched components.
- **Runner** stays the same (prior run → researched run → compare); only the “what we run” is narrowed to the touched scope.
- **Scope spec** (e.g. `cost_perf_scope.json`) should be machine-readable and live in the repo or Research Data project folder so both humans and automation can use it consistently.

Use this guide when implementing or refining targeted cost-perf testing for any Research Data project (e.g. aruizca-resume, analytics_ai, aigie-io).
