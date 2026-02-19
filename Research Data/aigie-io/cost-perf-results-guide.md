# Cost-perf results: what each file means (aigie-io)

This document explains each JSON output from the cost-perf comparison and tests for **aigie-io** (LangGraph advanced_langgraph_features workflow), with field meanings and example interpretations.

---

## compare-cost-perf-report.json

**Produced by:** `compare-cost-perf.py`  
**Purpose:** One run per clone of the LangGraph workflow. When `COST_PERF=1`, both clones use the **same** LLM-powered tools (web search, analysis, synthesis), so the comparison is apples-to-apples.

### Example

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

### Fields

| Field | Meaning |
|-------|--------|
| **prior** / **researched** | One workflow run for that clone (same fixed query, same tools when COST_PERF=1). |
| **durationMs** | Wall-clock time (ms) for the workflow. |
| **inputTokens** / **outputTokens** / **totalTokens** | Token usage from the run. |
| **delta** | `researched − prior` (duration and total tokens). |

### How to read it

- When COST_PERF=1, both clones use the same real LLM tools; **delta** reflects implementation or API variance. Use the consistency test for a stable comparison.
- The same structure appears as **comparison** in **cost-perf-report.json** when you run the full suite.

---

## .cost-perf-cache_effectiveness.json

**Produced by:** `test_cache_effectiveness.py`  
**Purpose:** Same input run twice; records run1 vs run2 tokens and duration. **aigie-io has no application-level cache**, so run2 will also consume tokens; the test records both runs for comparison.

### Example

```json
{
  "prior": {
    "run1_tokens": 150,
    "run2_tokens": 148,
    "run1_durationMs": 5000.0,
    "run2_durationMs": 4900.0
  },
  "researched": {
    "run1_tokens": 2500,
    "run2_tokens": 2480,
    "run1_durationMs": 12000.0,
    "run2_durationMs": 11800.0
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **run1_tokens** / **run2_tokens** | Total tokens for each run. |
| **run1_durationMs** / **run2_durationMs** | Wall-clock time (ms) for each run. |

### How to read it

- Compare **run1_durationMs** and **run1_tokens** between prior and researched. run2 will not be 0 (no cache); the test passes as long as both runs complete.

---

## .cost-perf-consistency.json

**Produced by:** `test_consistency.py`  
**Purpose:** Five runs with distinct inputs (COST_PERF_INPUT_ID=1..5); computes duration statistics. Compare prior vs researched on **stability** (mean, spread, percentiles).

### Example

```json
{
  "prior": {
    "mean_durationMs": 5100.0,
    "stdev": 200.0,
    "cv": 0.039,
    "p50_ms": 5050.0,
    "p95_ms": 5400.0
  },
  "researched": {
    "mean_durationMs": 12100.0,
    "stdev": 600.0,
    "cv": 0.05,
    "p50_ms": 12000.0,
    "p95_ms": 13000.0
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **mean_durationMs** | Average duration (ms) over 5 runs. |
| **stdev** | Standard deviation (ms). |
| **cv** | Coefficient of variation. Test passes if cv < 0.6. |
| **p50_ms** / **p95_ms** | Median and 95th percentile duration (ms). |

### How to read it

- Compare **mean_durationMs** and **cv** between prior and researched.

---

## .cost-perf-cost_per_unique_request.json

**Produced by:** `test_cost_per_unique_request.py`  
**Purpose:** M=3 distinct inputs, each run K=2 times (6 runs total). **aigie-io has no cache**, so total_tokens ≈ 2 × ideal_tokens; the test allows a ceiling of 2×ideal×1.2.

### Example

```json
{
  "prior": {
    "total_tokens": 900,
    "ideal_tokens": 450
  },
  "researched": {
    "total_tokens": 15000,
    "ideal_tokens": 7500
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **ideal_tokens** | Sum of tokens from the first run only for each of the 3 inputs. |
| **total_tokens** | Sum over all 6 runs. With no cache, total ≈ 2 × ideal. |

### How to read it

- total_tokens should be ≤ 2×ideal×1.2. Compare prior vs researched on total_tokens and ideal_tokens.

---

## .cost-perf-observability.json

**Produced by:** `test_observability.py`  
**Purpose:** Records which **log/monitoring phrases** appeared when cost-perf ran (e.g. "Cost-perf", "advanced_langgraph_features").

### Example

```json
{
  "prior": {
    "markers": ["Cost-perf", "advanced_langgraph_features", "durationMs", "variant"]
  },
  "researched": {
    "markers": ["Cost-perf", "advanced_langgraph_features", "durationMs", "variant"]
  }
}
```

### Fields

| Field | Meaning |
|-------|--------|
| **markers** | List of strings found in stdout/stderr. |

### How to read it

- Both variants typically show the same markers. The test confirms that cost-perf output is visible.

---

## cost-perf-report.json (combined)

**Produced by:** `run_all_cost_perf_tests.py`  
**Purpose:** Single file that combines the one-shot comparison and all test metrics.

- **comparison** – Same structure as **compare-cost-perf-report.json** (prior, researched, delta).
- **tests** – One key per test; each value is the same **prior** / **researched** structure as in the corresponding `.cost-perf-*.json` file.
- **summary.all_passed** – `true` if the comparison and every test’s sanity check passed for both variants.

Use this file to compare prior vs researched across all metrics in one place.
