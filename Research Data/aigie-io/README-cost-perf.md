# Cost & performance test (aigie-io – prior vs researched)

Each clone has **run_cost_perf.py**, which runs the **LangGraph example** (`examples/advanced_langgraph_features.py`) in cost-perf mode using **Azure OpenAI** (from master.env). **compare-cost-perf.py** runs both clones and writes a prior-vs-researched report.

- **Prior:** Mock tools, no LLM calls in the graph → duration only (tokens ≈ 0).
- **Researched:** Real LLM-powered tools (web search, analysis, synthesis) using Azure OpenAI → duration + token usage.

The only changed file between clones is `examples/advanced_langgraph_features.py`. When `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` are set, the example uses **Azure OpenAI** instead of Gemini.

## Compare prior vs researched

From **Research Data/aigie-io**:

```bash
.venv/bin/python compare-cost-perf.py
```

- Loads **master.env** from AIResearch.
- Runs **run_cost_perf.py** in prior then researched (uses **.venv** Python; set `COST_PERF_PYTHON` if needed).
- Writes **compare-cost-perf-report.json** with `prior`, `researched`, and `delta` (durationMs, tokens).

**Requirements:** `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` (e.g. in master.env). Use the repo **.venv** with: `langchain`, `langgraph`, `langchain-openai`, `langchain-google-genai`, `python-dotenv`, `openai`, `psutil`, `rich`, `structlog` (see clone `requirements.txt`).

## Run one clone only

From that clone’s directory:

```bash
COST_PERF=1 .venv/bin/python examples/advanced_langgraph_features.py
```

Or use the runner (loads master.env and writes **cost-perf-results.json** in the clone):

```bash
python run_cost_perf.py
```

Output: **cost-perf-results.json** (`durationMs`, `usage.inputTokens`, `usage.outputTokens`, `usage.totalTokens`).
