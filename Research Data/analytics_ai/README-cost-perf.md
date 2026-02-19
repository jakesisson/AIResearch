# Cost & performance (analytics_ai – prior vs researched)

Measures **cost and performance** of the analysis plan generation path (`create_analysis_plan_node`) between two repository states.

---

## The two repository states

| State | Clone directory | Meaning |
|-------|-----------------|--------|
| **Prior** | `analytics_ai-14c09b32e8384087c2b1747eab89c92556630661` | When `COST_PERF=1`, runs the **same** Azure OpenAI plan generation as researched (for comparable metrics). |
| **Researched** | `analytics_ai-8e53e7f5ef5ac140549db4b40eb2e299ddaad4a1` | Azure OpenAI function-calling for plan generation (real node). |

Both run the **same** logical operation (same user query through the real plan node) so duration and token usage can be compared fairly. There is **no application-level cache** for the plan node; repeat runs call the API again.

---

## JSON outputs (where they are and what they contain)

All paths below are relative to **Research Data/analytics_ai** unless noted.

| File | Produced by | Contents |
|------|-------------|----------|
| **compare-cost-perf-report.json** | `compare-cost-perf.py` | One cold run per clone: `prior`, `researched`, and `delta` (see [Report fields](#report-fields)). |
| **cost-perf-report.json** | `run_all_cost_perf_tests.py` | Combined report: `comparison` (prior vs researched one-shot run), plus `tests` with **prior** and **researched** metrics for each test; `summary.all_passed` indicates whether all sanity checks passed. |
| **cost-perf-results.json** | `run_cost_perf.py` (inside a clone) | Single-run result: `variant`, `durationMs`, `usage` (inputTokens, outputTokens, totalTokens). Written in **each clone’s root** when you run cost-perf from that clone. |
| **.cost-perf-*.json** (dot files) | Individual test scripts | Each test writes prior/researched metrics; these are merged into **cost-perf-report.json** by the full suite. |

**Detailed explanations and examples** for every field and file: see **[cost-perf-results-guide.md](cost-perf-results-guide.md)**.

---

## Report fields

**compare-cost-perf-report.json** (and `cost-perf-report.json` → `comparison`) looks like:

```json
{
  "prior": {
    "durationMs": 2500.0,
    "inputTokens": 1200,
    "outputTokens": 180,
    "totalTokens": 1380
  },
  "researched": {
    "durationMs": 2400.0,
    "inputTokens": 1200,
    "outputTokens": 200,
    "totalTokens": 1400
  },
  "delta": {
    "durationMs": -100.0,
    "totalTokens": 20
  }
}
```

| Field | Meaning |
|-------|--------|
| **prior** / **researched** | One cold run for that clone (same fixed query). |
| **durationMs** | Wall-clock time (ms) for the plan node (create_analysis_plan_node). |
| **inputTokens** | Prompt tokens sent to the model. |
| **outputTokens** | Completion tokens returned. |
| **totalTokens** | inputTokens + outputTokens. |
| **delta** | `researched − prior` (duration and total tokens). |

---

## Are these results accurate? Why does researched sometimes look worse?

**Yes.** When `COST_PERF=1`, **both** clones run the **same** Azure OpenAI plan-generation path (`create_analysis_plan_node` → same prompt, same function-calling API). The comparison is apples-to-apples.

Any run-to-run difference (e.g. researched slower or more tokens in one report) can be due to:

1. **API variance** – Same prompt can get different output length and latency; we run prior first, then researched, so a single comparison is one sample.
2. **Implementation detail** – Researched has extra validation/parsing; that can add a few ms or affect what gets sent/recorded.

So the measurements are accurate. For a **stable** comparison, use the **consistency** test (mean over 5 runs): if prior and researched means are close, the single-run “researched worse” was variance; if researched is consistently slower or heavier, that’s a real difference (e.g. extra logic in the researched path).

---

## How to compare the two states

- **Delta duration:** `delta.durationMs > 0` → researched is slower; `< 0` → faster. Use the consistency test for averages.
- **Delta tokens:** Differences are often from output length variation; input is usually the same.
- Use **cost-perf-report.json** from `run_all_cost_perf_tests.py` to get the one-shot comparison plus prior vs researched metrics for cache (run1/run2), consistency (mean, stdev, cv, p50, p95), cost-per-unique-request, and observability (markers).

---

## Running the comparison and tests

From **Research Data/analytics_ai** (with `.venv` created and deps installed):

```bash
# One comparison run only (writes compare-cost-perf-report.json)
python compare-cost-perf.py

# Full suite: comparison + all tests → cost-perf-report.json
python run_all_cost_perf_tests.py
```

**Requirements:** `master.env` with `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT`. A shared **.venv** with project deps (langchain, langchain-openai, python-dotenv, etc.) so both clones can run `run_cost_perf.py`.

### Individual tests

- `python test_cache_effectiveness.py` – Same input twice; records run1/run2 tokens and duration (no cache in this backend).
- `python test_consistency.py` – Five cold runs with distinct inputs; checks duration variance (cv < 0.6).
- `python test_cost_per_unique_request.py` – M=3 distinct inputs × K=2 runs; records total vs ideal tokens (ceiling allows no-cache behavior).
- `python test_observability.py` – One run with captured output; checks that cost-perf markers appear.

When you run `run_all_cost_perf_tests.py`, **cost-perf-report.json** includes under `tests` the **prior** and **researched** metrics for each; `summary.all_passed` is true only if every test passed for both variants.

---

## Run one clone only

From that clone’s directory (env loaded, e.g. from master.env):

```bash
python run_cost_perf.py
```

Output: **cost-perf-results.json** in the clone root (`durationMs`, `usage.inputTokens`, `usage.outputTokens`, `usage.totalTokens`).
