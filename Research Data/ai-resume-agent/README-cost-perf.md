# Cost & performance test (ai-resume-agent – prior vs researched)

Each clone has a **run_cost_perf.py** that runs one Azure OpenAI call (no DB/RAG). A **compare** script runs both and writes a prior-vs-researched report.

## Compare prior vs researched

From **Research Data/ai-resume-agent**:

```bash
python compare-cost-perf.py
```

- Loads **master.env** from AIResearch.
- Runs **run_cost_perf.py** in prior then researched (uses **.venv/bin/python** if present).
- Writes **compare-cost-perf-report.json** with prior, researched, and delta (durationMs, totalTokens).

**Requirements:** AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT (e.g. in master.env). Optional: create `.venv` with `openai` and `python-dotenv` so the compare script uses it.

## Run one clone only

From that clone’s directory:

```bash
./venv312/bin/python run_cost_perf.py   # or: python run_cost_perf.py
```

Output: **cost-perf-results.json** in the clone root. Set **COST_PERF_VARIANT** to `prior` or `researched` when running from the compare script.

## What the test does

Single Azure OpenAI chat completion (“What is 2 + 2? Reply with one number only.”), records duration and token usage (input/output/total). No vector store or RAG chain.
