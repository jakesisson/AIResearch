# Cost-perf results: what each file means

This document explains each JSON output from the cost-perf comparison and tests, with field meanings and example interpretations.

---

## compare-cost-perf-report.json

**Produced by:** `compare-cost-perf.py`  
**Purpose:** One cold run (no cache) per clone. Lets you compare prior vs researched on a single execution.

### Example

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

### Fields

| Field | Meaning |
|-------|--------|
| **prior** / **researched** | One cold run for that clone (same minimal input). |
| **durationMs** | Wall-clock time (ms) for the resume LLM call. |
| **inputTokens** | Prompt tokens sent to the model. |
| **outputTokens** | Completion tokens returned. |
| **totalTokens** | inputTokens + outputTokens. |
| **delta** | `researched − prior` (duration and total tokens). |

### How to read it

- **delta.durationMs > 0** → researched was slower on this run; **< 0** → faster. Single-run variance is normal; use the consistency test for averages.
- **delta.totalTokens** → difference in token usage (usually from output length variation; input is typically the same).
- The same structure appears as **comparison** in **cost-perf-report.json** when you run the full suite.

---

## .cost-perf-cache_effectiveness.json

**Produced by:** `test_cache_effectiveness.py` (when run directly or via `run_all_cost_perf_tests.py`)  
**Purpose:** Same input run twice; second run should be a cache hit (0 tokens, much lower duration). Compares prior vs researched on cold run vs cache-hit.

### Example

```json
{
  "prior": {
    "run1_tokens": 514,
    "run2_tokens": 0,
    "run1_durationMs": 2009.98,
    "run2_durationMs": 4.49
  },
  "researched": {
    "run1_tokens": 726,
    "run2_tokens": 0,
    "run1_durationMs": 2784.08,
    "run2_durationMs": 4.22
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **run1_tokens** | Total tokens used on the first run (cold; calls the API). |
| **run2_tokens** | Total tokens on the second run (should be **0** if cache hit). |
| **run1_durationMs** | Wall-clock time (ms) for the first run. |
| **run2_durationMs** | Wall-clock time (ms) for the second run (should be much lower if cache hit). |

### How to read it

- **run2_tokens** should be **0** for both prior and researched; if not, the cache did not serve the repeat.
- **run2_durationMs** should be much smaller than **run1_durationMs** (e.g. single-digit ms vs thousands).
- Compare **run1_durationMs** and **run1_tokens** between prior and researched to see which variant is faster or heavier on the cold path.

---

## .cost-perf-consistency.json

**Produced by:** `test_consistency.py`  
**Purpose:** Multiple cold runs (5) with different inputs; computes duration statistics. Lets you compare prior vs researched on **stability** (mean, spread, percentiles), not just one run.

### Example

```json
{
  "prior": {
    "mean_durationMs": 1920.77,
    "stdev": 106.98,
    "cv": 0.0557,
    "p50_ms": 1950.24,
    "p95_ms": 2066.48
  },
  "researched": {
    "mean_durationMs": 1957.29,
    "stdev": 155.32,
    "cv": 0.0794,
    "p50_ms": 1954.32,
    "p95_ms": 2129.84
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **mean_durationMs** | Average wall-clock time (ms) over the 5 cold runs. |
| **stdev** | Standard deviation of those durations (ms). Higher = more run-to-run variation. |
| **cv** | Coefficient of variation = stdev ÷ mean. Scale-free measure of variability (e.g. 0.06 ≈ 6%). The test passes if cv < 0.6. |
| **p50_ms** | Median (50th percentile) duration in ms. |
| **p95_ms** | 95th percentile duration in ms; only 5% of runs were slower than this. |

### How to read it

- Compare **mean_durationMs** between prior and researched for average latency.
- Compare **stdev** and **cv**: lower values mean more consistent latency. In the example, researched has a slightly higher mean and more spread (higher stdev and cv).
- Both cvs well under 0.6 means “reasonably consistent” for both variants.

---

## .cost-perf-cost_per_unique_request.json

**Produced by:** `test_cost_per_unique_request.py`  
**Purpose:** Runs **M = 3 distinct inputs** each **K = 2 times** (first run cold, second run should hit cache). Checks that you pay for **unique** requests, not every repeat.

### Example

```json
{
  "prior": {
    "total_tokens": 1520,
    "ideal_tokens": 1520
  },
  "researched": {
    "total_tokens": 1452,
    "ideal_tokens": 1452
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **ideal_tokens** | Sum of tokens from the **first run only** for each of the 3 inputs (the three cold runs). This is “cost of 3 unique requests.” |
| **total_tokens** | Sum of tokens over **all 6 runs** (3 cold + 3 cache hits). With a working cache, the 3 repeat runs use 0 tokens, so total_tokens should equal ideal_tokens. |

### How to read it

- **total_tokens ≈ ideal_tokens** for a variant means the cache is working: repeats are served from cache and don’t add token cost.
- If total_tokens were much larger than ideal_tokens, repeats would be calling the API again (cache not deduplicating).
- The difference between prior (1520) and researched (1452) in the example is normal variation in LLM output length across the 3 cold runs; what matters is that each variant has total = ideal.

---

## .cost-perf-observability.json

**Produced by:** `test_observability.py`  
**Purpose:** Records which **log/monitoring phrases** appeared when cost-perf ran in each clone. Confirms that each variant produces observable output (so runs are visible and measurable).

### Example

```json
{
  "prior": {
    "markers": ["Calling OpenAI", "Langchain"]
  },
  "researched": {
    "markers": ["Executing", "Generate JSON Resume"]
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **markers** | List of strings that were found in stdout/stderr. Each is a known “observability marker” (e.g. a log line or timing message). |

### How to read it

- **Prior** typically shows markers like "Calling OpenAI" and "Langchain" from the older path (direct log before the LLM call).
- **Researched** typically shows "Executing" and "Generate JSON Resume" from the performance/monitoring layer (e.g. “Executing … Generate JSON Resume (LLM)” and timing).
- The test only requires that **at least one** marker appear per variant; the JSON shows **which** markers each implementation produced. Different markers are expected—they reflect different logging/monitoring in the two codebases.

---

## cost-perf-report.json (combined)

**Produced by:** `run_all_cost_perf_tests.py`  
**Purpose:** Single file that combines the one-shot comparison and all test metrics.

- **comparison** – Same structure as **compare-cost-perf-report.json** (prior, researched, delta).
- **tests** – Object with one key per test (`cache_effectiveness`, `consistency`, `cost_per_unique_request`, `observability`). Each value is the same **prior** / **researched** structure as in the corresponding `.cost-perf-*.json` file above.
- **summary.all_passed** – `true` if the comparison and every test’s sanity check passed for both variants.

Use this file to compare prior vs researched across all metrics without opening the individual dot files.
