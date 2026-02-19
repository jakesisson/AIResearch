# Cost & performance test (prior vs researched commit)

This test tracks **cost** (token usage) and **performance** (latency) for the **changed area only**: the LangGraph agent node in `lib/langgraph.ts` (message trimming → prompt → model invoke). It compares the **prior** commit (no trimming) with the **researched** commit (with `trimMessages`).

## What it does

- **Prior**: runs the workflow without message trimming (full history to the model).
- **Researched**: runs the workflow with `trimMessages` (trimmed history), then prompt and model.

Same minimal input is used for both so the comparison is fair. Results are written to each project’s `tests/cost-perf-results.json` and to `tests/compare-cost-perf-report.json` when using the compare script.

## Prerequisites

- Node 18+ and `npm install` in both project folders:
  - `Agente-de-IA-usando-Next-y-Langchain-bd049f6b662373f99f152ccbacebaea3b9936129` (prior)
  - `Agente-de-IA-usando-Next-y-Langchain-e7cd19cc538f3f5156dd717c457d73df6b6dae67` (researched)
- LLM env vars for the app (e.g. `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, or Groq keys as in the original diff).
- **WxFlows:** the workflow loads tools at startup. Set `WXFLOWS_ENDPOINT` and `WXFLOWS_APIKEY` (e.g. in `AIResearch/master.env`) to a valid WxFlows URL and key; otherwise the test will fail with "Only absolute URLs are supported".

## Run per-commit (single variant)

From the **prior** or **researched** project directory:

```bash
# Prior
cd Agente-de-IA-usando-Next-y-Langchain-bd049f6b662373f99f152ccbacebaea3b9936129
COST_PERF_VARIANT=prior npm run test:cost-perf

# Researched
cd Agente-de-IA-usando-Next-y-Langchain-e7cd19cc538f3f5156dd717c457d73df6b6dae67
COST_PERF_VARIANT=researched npm run test:cost-perf
```

Output: `tests/cost-perf-results.json` with `durationMs`, `usage` (input/output/total tokens), and `variant`.

## Run compare (prior + researched, then diff)

From the **parent** repo root (`Agente-de-IA-usando-Next-y-Langchain`):

```bash
npx tsx tests/compare-cost-perf.mts
```

This runs `npm run test:cost-perf` in the prior project, then in the researched project, then writes `tests/compare-cost-perf-report.json` with prior/researched/delta (duration and tokens).

## Langfuse (optional)

To send traces to Langfuse (for cost and latency in the Langfuse UI):

1. Set env vars (e.g. in `.env` or shell):
   - `LANGFUSE_SECRET_KEY`
   - `LANGFUSE_PUBLIC_KEY`
   - `LANGFUSE_BASE_URL` (e.g. `https://cloud.langfuse.com` or `https://us.cloud.langfuse.com`)
2. Run the test or compare script as above. Traces will be tagged `cost-perf` and `prior` or `researched`.

Dependencies: `@langfuse/core` and `@langfuse/langchain` are already in both projects’ `devDependencies`. If you don’t set `LANGFUSE_SECRET_KEY`, the test still runs and writes local JSON only.
