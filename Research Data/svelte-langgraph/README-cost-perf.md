# Cost-Perf for svelte-langgraph

Compares **prior** vs **researched** commits on duration and token usage by running the backend chat graph once with a fixed prompt.

## Prerequisites

- **Python 3.12** and a virtualenv with backend deps, **or** [uv](https://docs.astral.sh/uv/) in PATH.
- **API keys**: For real token usage, set either:
  - **Azure OpenAI**: `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_VERSION`, and deployment name via `AZURE_OPENAI_DEPLOYMENT` or **`MODEL_ID`** (e.g. `gpt-4.1`). The compare script loads **repo-root** `master.env` (e.g. `AIResearch/master.env`) so these can live there.
  - **OpenAI** (fallback when COST_PERF=1 and Azure not set): `OPENAI_API_KEY`, optionally `CHAT_MODEL_NAME` (default `gpt-4o-mini`).

Put keys in repo-root **master.env** or this directory’s `.env`; the compare script loads repo root first, then project.

## Setup (optional shared venv)

From `Research Data/svelte-langgraph`:

```bash
python3 -m venv .venv
.venv/bin/pip install "langchain[openai]>=0.3" "langgraph>=0.6" "python-dotenv>=1.1" langchain-openai
```

If you use **uv**, you can skip this and run from each clone's `apps/backend` with `uv run python run_cost_perf.py`.

## Run comparison

From `Research Data/svelte-langgraph`:

```bash
python3 compare-cost-perf.py
```

To stress the graph (recommended when comparing cost/performance improvements):

```bash
COST_PERF_STRESS=1 python3 compare-cost-perf.py
```

- Runs **prior** backend (`svelte-langgraph-80f19464.../apps/backend/run_cost_perf.py`), then **researched** (`svelte-langgraph-1ae88f75.../apps/backend/run_cost_perf.py`).
- Uses fixture prompt: **cost_perf_fixture_prompt.txt** (minimal) or **cost_perf_fixture_prompt_stress.txt** when `COST_PERF_STRESS=1` (heavier prompt for real-world validity).
- Writes **prior** and **researched** results to each clone's `cost-perf-results.json`, and a summary to `compare-cost-perf-report.json`.

## Output

- **prior** / **researched**: `durationMs`, `inputTokens`, `outputTokens`, `totalTokens`.
- **delta**: difference (researched − prior) for duration and totalTokens.

Token counts come from the LLM response metadata when using Azure OpenAI or OpenAI. If no API key is set, the run will fail with a clear error.

## Scope

- **Target**: Single `ainvoke` of the chat graph (create_react_agent) with one user message.
- **Scope spec**: `cost_perf_scope.json`.
