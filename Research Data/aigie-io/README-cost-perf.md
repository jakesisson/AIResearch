# Cost & performance (aigie-io – prior vs researched)

Measures **cost and performance** of the LangGraph example workflow (`advanced_langgraph_features.py`) between two repository states.

---

## The two repository states

| State | Clone directory | Meaning |
|-------|-----------------|--------|
| **Prior** | `aigie-io-ecfb314b546018e0e745344ce391a89c5d78774a` | When `COST_PERF=1`, uses the **same** LLM-powered tools (web search, analysis, synthesis) as researched so the comparison is apples-to-apples. |
| **Researched** | `aigie-io-de4c24820cd5967f1abff5f4af6dafab0207e618` | Real LLM-powered tools (research, analysis, synthesis) with Azure OpenAI. |

The only changed file between clones is `examples/advanced_langgraph_features.py`. When `COST_PERF=1`, **both** clones run the workflow with the **same** real LLM tools (same tool invocations); compare-cost-perf and the test suite compare duration and token usage on that shared path. There is **no application-level cache**; repeat runs call the API again.

---

## JSON outputs (where they are and what they contain)

All paths below are relative to **Research Data/aigie-io** unless noted.

| File | Produced by | Contents |
|------|-------------|----------|
| **compare-cost-perf-report.json** | `compare-cost-perf.py` | One run per clone: `prior`, `researched`, and `delta` (see [Report fields](#report-fields)). |
| **cost-perf-report.json** | `run_all_cost_perf_tests.py` | Combined report: `comparison` (prior vs researched one-shot run), plus `tests` with **prior** and **researched** metrics for each test; `summary.all_passed` indicates whether all sanity checks passed. |
| **cost-perf-results.json** | `run_cost_perf.py` (inside a clone) | Single-run result: `variant`, `durationMs`, `usage` (inputTokens, outputTokens, totalTokens). Written in **each clone’s root**. |
| **.cost-perf-*.json** (dot files) | Individual test scripts | Each test writes prior/researched metrics; merged into **cost-perf-report.json** by the full suite. |

**Detailed explanations and examples** for every field and file: see **[cost-perf-results-guide.md](cost-perf-results-guide.md)**.

---

## Report fields

**compare-cost-perf-report.json** (and `cost-perf-report.json` → `comparison`) looks like:

```json
{
  "prior": {
    "durationMs": 5000.0,
    "inputTokens": 100,
    "outputTokens": 50,
    "totalTokens": 150
  },
  "researched": {
    "durationMs": 12000.0,
    "inputTokens": 2000,
    "outputTokens": 500,
    "totalTokens": 2500
  },
  "delta": {
    "durationMs": 7000.0,
    "totalTokens": 2350
  }
}
```

| Field | Meaning |
|-------|--------|
| **prior** / **researched** | One run of the LangGraph workflow for that clone. |
| **durationMs** | Wall-clock time (ms) for the workflow run. |
| **inputTokens** / **outputTokens** / **totalTokens** | Token usage from the run. |
| **delta** | `researched − prior` (duration and total tokens). |

---

## Are these results accurate?

**Yes.** For **aigie-io** the comparison is intentionally asymmetric:

- **Prior** uses **mock / minimal LLM usage** in the workflow (lightweight path).
- **Researched** uses **real LLM-powered tools** (research, analysis, synthesis) with Azure OpenAI.

So researched is **expected** to use more tokens and often take longer—it is doing more real work. The numbers are accurate; “researched worse” here means “researched does more,” not a measurement bug. Use the report to see the cost of the full (researched) path vs the prior baseline.

---

## How to compare the two states

- **Delta duration:** `delta.durationMs > 0` → researched is slower; `< 0` → faster.
- **Delta tokens:** Both use the same tools when COST_PERF=1; differences are from API or implementation variance.
- Use **cost-perf-report.json** from `run_all_cost_perf_tests.py` to get the one-shot comparison plus prior vs researched metrics for cache (run1/run2), consistency (mean, stdev, cv, p50, p95), cost-per-unique-request, and observability (markers).

---

## Running the comparison and tests

From **Research Data/aigie-io** (with **.venv** and deps installed):

```bash
# One comparison run only (writes compare-cost-perf-report.json)
python compare-cost-perf.py

# Full suite: comparison + all tests → cost-perf-report.json
python run_all_cost_perf_tests.py
```

**Requirements:** `master.env` with `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT`. Repo **.venv** with langchain, langgraph, langchain-openai, python-dotenv, etc. (see clone `requirements.txt`).

### Individual tests

- `python test_cache_effectiveness.py` – Same input twice; records run1/run2 tokens and duration (no cache).
- `python test_consistency.py` – Five cold runs with distinct inputs; checks duration variance (cv < 0.6).
- `python test_cost_per_unique_request.py` – M=3 distinct inputs × K=2 runs; records total vs ideal (ceiling allows no-cache).
- `python test_observability.py` – One run with captured output; checks that cost-perf markers appear.

When you run `run_all_cost_perf_tests.py`, **cost-perf-report.json** includes under `tests` the **prior** and **researched** metrics for each; `summary.all_passed` is true only if every test passed for both variants.

---

## Run one clone only

From that clone’s directory (env loaded):

```bash
python run_cost_perf.py
```

Or: `COST_PERF=1 python examples/advanced_langgraph_features.py`

Output: **cost-perf-results.json** in the clone root (`durationMs`, `usage.inputTokens`, `usage.outputTokens`, `usage.totalTokens`).
