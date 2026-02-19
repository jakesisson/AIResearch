# Cost & performance (aruizca-resume – prior vs researched)

Measures **cost and performance** of the resume LLM path (one LLM call to generate a JSON resume from minimal parsed data) between two repository states.

---

## The two repository states

| State | Clone directory | Meaning |
|-------|-----------------|--------|
| **Prior** | `aruizca-resume-efde30ea49726f13e830963f6d971117387bc2c8` | Baseline: direct `ChainFactory` + `OpenAICache`; usage via `UsageAggregator` when `COST_PERF=1`. |
| **Researched** | `aruizca-resume-8108951369a79d1ed04b08998697c87d5a6e3f9d` | After research: `LangchainPromptRunner` (caching + performance monitoring); same usage collection. |

Both run the **same** logical operation so that duration and token usage can be compared fairly.

---

## JSON outputs (where they are and what they contain)

All paths below are relative to **Research Data/aruizca-resume** unless noted.

| File | Produced by | Contents |
|------|-------------|----------|
| **compare-cost-perf-report.json** | `compare-cost-perf.py` | One cold run per clone: `prior`, `researched`, and `delta` (see [Report fields](#report-fields)). |
| **cost-perf-report.json** | `run_all_cost_perf_tests.py` | Combined report: `comparison` (prior vs researched one-shot run), plus `tests` with **prior** and **researched** metrics for each test so you can compare performance; `summary.all_passed` indicates whether all sanity checks passed. |
| **cost-perf-results.json** | `node …/cost-perf.js` (inside a clone) | Single-run result: `variant`, `durationMs`, `usage` (inputTokens, outputTokens, totalTokens). Written in **each clone’s root** when you run cost-perf from that clone. |
| **.cost-perf-*.json** (dot files) | Individual test scripts | Each test writes prior/researched metrics to e.g. `.cost-perf-cache_effectiveness.json`; these are merged into **cost-perf-report.json** by the full suite. |

**Detailed explanations and examples** for every field and file: see **[cost-perf-results-guide.md](cost-perf-results-guide.md)**.

---

## Report fields

**compare-cost-perf-report.json** (and `cost-perf-report.json` → `comparison`) looks like:

```json
{
  "prior": {
    "durationMs": 2294.31,
    "inputTokens": 216,
    "outputTokens": 319,
    "totalTokens": 535
  },
  "researched": {
    "durationMs": 3363.33,
    "inputTokens": 216,
    "outputTokens": 551,
    "totalTokens": 767
  },
  "delta": {
    "durationMs": 1069.02,
    "totalTokens": 232
  }
}
```

| Field | Meaning |
|-------|--------|
| **prior** / **researched** | One cold run (no cache) for that clone. |
| **durationMs** | Wall-clock time for the resume LLM call (ms). |
| **inputTokens** | Prompt tokens sent to the model. |
| **outputTokens** | Completion tokens returned. |
| **totalTokens** | inputTokens + outputTokens. |
| **delta** | `researched − prior` (duration and total tokens). |

---

## How to compare the two states

- **Delta duration:** `delta.durationMs > 0` → researched is slower; `< 0` → researched is faster. Same run can vary (API latency), so use multiple runs or the consistency test for stability.
- **Delta tokens:** `delta.totalTokens > 0` → researched used more tokens on that run (often due to output length variation); `< 0` → fewer. Input tokens are usually identical for the same minimal input; differences are mostly in output.
- **Interpretation:** Prefer comparing **averages** over single runs. Use **cost-perf-report.json** from `run_all_cost_perf_tests.py` to get the one-shot comparison plus **prior vs researched** metrics for cache (run1/run2 tokens and duration), consistency (mean, stdev, cv, p50, p95), cost-per-unique-request (total_tokens, ideal_tokens), and observability (markers). Compare `prior` and `researched` under each test to see performance differences.

---

## Running the comparison and tests

From **Research Data/aruizca-resume**:

```bash
# One comparison run only (writes compare-cost-perf-report.json)
python compare-cost-perf.py

# Full suite: comparison + all tests → cost-perf-report.json
python run_all_cost_perf_tests.py
```

**Requirements:** `master.env` (or env) with `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT`. Node and npm in each clone so `npm run build` and `node packages/core/dist/cost-perf.js` work.

### Individual tests (no JSON by default)

- `python test_cache_effectiveness.py` – Same input twice; second run should be cache hit (0 tokens).
- `python test_consistency.py` – Several cold runs; checks duration variance (e.g. CV &lt; 0.6).
- `python test_cost_per_unique_request.py` – M distinct inputs × K repeats; total tokens should reflect cache dedup.
- `python test_observability.py` – One run with captured output; checks that observability markers appear.

When you run `run_all_cost_perf_tests.py`, **cost-perf-report.json** includes under `tests` the **prior** and **researched** metrics for each (so you can compare the two states); `summary.all_passed` is true only if every test’s sanity check passed for both variants.

---

## Run one clone only

From that clone’s directory (env loaded, e.g. from master.env):

```bash
npm run build   # in packages/core
COST_PERF=1 node packages/core/dist/cost-perf.js
```

Output: **cost-perf-results.json** in the clone root (`durationMs`, `usage.inputTokens`, `usage.outputTokens`, `usage.totalTokens`).
