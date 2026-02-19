# Cost & performance (SSU_RAG – prior vs researched)

Compares **cost and performance** of the RAG answer chain (single LLM call with fixed context) between **prior** and **researched** commits. Follows the [cost-perf targeted testing guide](cost-perf-targeted-testing-guide.md): only the touched scope (RAG chain) is run.

---

## Repository states

| State        | Clone directory |
|-------------|-------------------|
| **Prior**   | `SSU_RAG-4228e4e133cd201ebb2e04d0e40c3bf27b775b4c` |
| **Researched** | `SSU_RAG-b9b2befc1271c08e73efc34212c8d4ea229f1b63` |

Prior uses `RagService` (condense + answer chain, history); researched uses a single `unified_rag_chain` (no condense). Cost-perf runs **only the answer chain** with a fixture query and fixed context so no Milvus/vector store is required. **LLM:** When `COST_PERF=1`, both clones use **Azure OpenAI** (see below); otherwise they use the existing OpenAI config.

---

## Scope

- **Scope spec:** `cost_perf_scope.json` (target_type: chain, target_chain: run_rag_qa).
- **What runs:** One RAG answer invocation: fixture query + minimal fixed context → LLM → duration and token usage. No vector search.
- **Fixture:** `cost_perf_fixture_query.txt` (one query line). Compare script passes it via `COST_PERF_FIXTURE_PATH`.

---

## Requirements

- **Python 3.12** and dependencies (langchain-openai, langchain-community, python-dotenv, etc.). The compare script prefers a shared `.venv` in this directory; create and install with:
  ```bash
  python3 -m venv .venv
  .venv/bin/pip install python-dotenv "langchain>=0.3" "langchain-openai>=0.3" langchain-community "openai>=1.0.0" "pymilvus>=2.6" beautifulsoup4 feedparser requests fastapi uvicorn
  ```
  Or use `uv run` from each clone (ensure `uv` is in PATH when running the compare script).
- **Azure OpenAI (cost-perf):** The compare script loads **repo-root** `master.env`, which should define `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_VERSION`, and deployment name via `AZURE_OPENAI_DEPLOYMENT` or **`MODEL_ID`** (e.g. `gpt-4.1`). When `COST_PERF=1`, both clones use Azure for the RAG answer chain so token usage is reported from Azure.

---

## How to run

From **Research Data/SSU_RAG**:

```bash
python3 compare-cost-perf.py
```

This runs `run_cost_perf.py` in each clone (prior then researched) and writes **compare-cost-perf-report.json**.

To run a single clone:

```bash
cd SSU_RAG-4228e4e133cd201ebb2e04d0e40c3bf27b775b4c
COST_PERF_VARIANT=prior COST_PERF_FIXTURE_PATH=../cost_perf_fixture_query.txt python3 run_cost_perf.py

cd SSU_RAG-b9b2befc1271c08e73efc34212c8d4ea229f1b63
COST_PERF_VARIANT=researched COST_PERF_FIXTURE_PATH=../cost_perf_fixture_query.txt python3 run_cost_perf.py
```

---

## Output files

| File | Location | Contents |
|------|----------|----------|
| **compare-cost-perf-report.json** | Research Data/SSU_RAG | prior, researched, delta (durationMs, tokens) |
| **cost-perf-results.json** | Each clone root | Single run: variant, durationMs, usage |

Delta: `researched - prior` for duration and totalTokens.
