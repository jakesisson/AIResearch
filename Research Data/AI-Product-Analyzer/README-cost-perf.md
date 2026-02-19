# Cost & performance test (AI-Product-Analyzer – prior vs researched)

This folder has two clones (prior and researched). Each has a cost-perf script that exercises the **changed code path** (LangChain RAG context building + one Azure OpenAI call), then a **compare** script runs both and writes a prior-vs-researched report.

## Compare prior vs researched (recommended)

From **Research Data/AI-Product-Analyzer**:

```bash
python compare-cost-perf.py
```

- Loads **master.env** from `AIResearch` so Azure (and optional env) are set.
- Runs **run_cost_perf.py** in the **prior** clone, then in the **researched** clone (using each clone’s **venv312** Python if present).
- Writes **compare-cost-perf-report.json** with `prior`, `researched`, and `delta` (durationMs, totalTokens).

**Requirements:**

- Both clone dirs present:  
  `AI-Product-Analyzer-cfe471701dd29b6c354874ad9015bf8957dc69b5` (prior),  
  `AI-Product-Analyzer-6779ffda3a8a21dec8afb5b57bfee345a8a19798` (researched).
- In each clone, a working Python env (e.g. **venv312** with `pip install -r requirements.txt`). If you see `ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'`, fix the venv (e.g. reinstall pydantic/pydantic-core for your platform).
- **AZURE_OPENAI_API_KEY** and **AZURE_OPENAI_ENDPOINT** (e.g. in **master.env** at repo root).

## Run the test in one clone only

From that clone’s directory (e.g. researched):

```bash
cd AI-Product-Analyzer-6779ffda3a8a21dec8afb5b57bfee345a8a19798
./venv312/bin/python run_cost_perf.py
```

Optional: `COST_PERF_VARIANT=researched` (or `prior` in the prior clone). Output is **cost-perf-results.json** in that clone’s root.

## What the test does

- Builds **mock scraped data** and calls **LangChainService.create_comprehensive_context** (uses the changed **process_scraped_data** / **process_youtube_data** formatting).
- Sends a short prompt (including that context) to **Azure OpenAI** and records **duration** and **token usage** (input/output/total).
- Writes **cost-perf-results.json** with `variant`, `durationMs`, `usage`.
