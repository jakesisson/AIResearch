# Cost-perf results: what each file means (analytics_ai)

This document explains each JSON output from the cost-perf comparison and tests for **analytics_ai** (create_analysis_plan_node), with field meanings and example interpretations.

---

## compare-cost-perf-report.json

**Produced by:** `compare-cost-perf.py`  
**Purpose:** One cold run (no cache) per clone. Lets you compare prior vs researched on a single execution of the plan node.

### Example

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

### Fields

| Field | Meaning |
|-------|--------|
| **prior** / **researched** | One cold run for that clone (same fixed user query). |
| **durationMs** | Wall-clock time (ms) for create_analysis_plan_node. |
| **inputTokens** | Prompt tokens sent to the model. |
| **outputTokens** | Completion tokens returned. |
| **totalTokens** | inputTokens + outputTokens. |
| **delta** | `researched − prior` (duration and total tokens). |

### How to read it

- **delta.durationMs > 0** → researched was slower on this run; **< 0** → faster. Use the consistency test for averages.
- **delta.totalTokens** → difference in token usage (often output length variation).
- The same structure appears as **comparison** in **cost-perf-report.json** when you run the full suite.

---

## .cost-perf-cache_effectiveness.json

**Produced by:** `test_cache_effectiveness.py`  
**Purpose:** Same input run twice; records run1 vs run2 tokens and duration for prior and researched. **analytics_ai has no application-level cache**, so run2 will also consume tokens; the test still records both runs for comparison.

### Example

```json
{
  "prior": {
    "run1_tokens": 1380,
    "run2_tokens": 1390,
    "run1_durationMs": 2500.0,
    "run2_durationMs": 2480.0
  },
  "researched": {
    "run1_tokens": 1400,
    "run2_tokens": 1410,
    "run1_durationMs": 2400.0,
    "run2_durationMs": 2380.0
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **run1_tokens** | Total tokens on the first run (cold). |
| **run2_tokens** | Total tokens on the second run (in this backend, also cold; no cache). |
| **run1_durationMs** / **run2_durationMs** | Wall-clock time (ms) for each run. |

### How to read it

- Compare **run1_durationMs** and **run1_tokens** between prior and researched to see which variant is faster or heavier on a cold run.
- run2_tokens will not be 0 in analytics_ai (no cache); the test passes as long as both runs complete.

---

## .cost-perf-consistency.json

**Produced by:** `test_consistency.py`  
**Purpose:** Five cold runs with distinct inputs (COST_PERF_INPUT_ID=1..5); computes duration statistics. Lets you compare prior vs researched on **stability** (mean, spread, percentiles).

### Example

```json
{
  "prior": {
    "mean_durationMs": 2520.5,
    "stdev": 120.3,
    "cv": 0.0477,
    "p50_ms": 2510.0,
    "p95_ms": 2680.0
  },
  "researched": {
    "mean_durationMs": 2380.2,
    "stdev": 95.1,
    "cv": 0.04,
    "p50_ms": 2375.0,
    "p95_ms": 2520.0
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **mean_durationMs** | Average wall-clock time (ms) over the 5 runs. |
| **stdev** | Standard deviation of those durations (ms). |
| **cv** | Coefficient of variation = stdev ÷ mean. Test passes if cv < 0.6. |
| **p50_ms** | Median duration (ms). |
| **p95_ms** | 95th percentile duration (ms). |

### How to read it

- Compare **mean_durationMs** and **cv** between prior and researched to see average latency and consistency.

---

## .cost-perf-cost_per_unique_request.json

**Produced by:** `test_cost_per_unique_request.py`  
**Purpose:** M=3 distinct inputs, each run K=2 times (6 runs total). Records total_tokens and ideal_tokens. **analytics_ai has no cache**, so total_tokens will be about **2 × ideal_tokens**; the test allows a ceiling of 2×ideal×1.2.

### Example

```json
{
  "prior": {
    "total_tokens": 4200,
    "ideal_tokens": 2100
  },
  "researched": {
    "total_tokens": 4100,
    "ideal_tokens": 2050
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **ideal_tokens** | Sum of tokens from the **first run only** for each of the 3 inputs (cost of 3 unique requests). |
| **total_tokens** | Sum of tokens over all 6 runs. With no cache, total ≈ 2 × ideal. |

### How to read it

- total_tokens should be ≤ 2×ideal×1.2 (test ceiling). Compare prior vs researched on total_tokens and ideal_tokens.

---

## .cost-perf-observability.json

**Produced by:** `test_observability.py`  
**Purpose:** Records which **log/monitoring phrases** appeared when cost-perf ran in each clone (e.g. "Cost-perf", "create_analysis_plan_node").

### Example

```json
{
  "prior": {
    "markers": ["Cost-perf", "create_analysis_plan_node", "durationMs", "variant"]
  },
  "researched": {
    "markers": ["Cost-perf", "create_analysis_plan_node", "durationMs", "variant"]
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **markers** | List of strings found in stdout/stderr (observability markers). |

### How to read it

- Both variants typically show the same markers (run_cost_perf.py prints "Cost-perf: create_analysis_plan_node" and the JSON result). The test confirms that cost-perf output is visible.

---

## cost-perf-report.json (combined)

**Produced by:** `run_all_cost_perf_tests.py`  
**Purpose:** Single file that combines the one-shot comparison and all test metrics.

- **comparison** – Same structure as **compare-cost-perf-report.json** (prior, researched, delta).
- **tests** – One key per test; each value is the same **prior** / **researched** structure as in the corresponding `.cost-perf-*.json` file.
- **summary.all_passed** – `true` if the comparison and every test’s sanity check passed for both variants.

Use this file to compare prior vs researched across all metrics in one place.
