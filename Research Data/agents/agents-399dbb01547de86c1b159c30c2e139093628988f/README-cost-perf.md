# Cost & performance test (agents – prior vs researched)

This folder has **two** agent clones (prior and researched). Each has a single-run cost/performance test. A **compare** script runs both and writes a prior-vs-researched report.

## Compare prior vs researched (recommended)

From **Research Data/agents** (this folder’s parent):

```bash
cd "Research Data/agents"
npx tsx compare-cost-perf.mts
```

- Runs `npm run test:cost-perf` in the **prior** clone, then in the **researched** clone.
- Writes **compare-cost-perf-report.json** with `prior`, `researched`, and `delta` (durationMs, totalTokens).
- Requires `master.env` (or env) for Azure/Anthropic and optional Langfuse.

## Run the test in one clone only

From this directory (the agents clone):

```bash
npm run test:cost-perf
```

- **Environment**: The script loads `AIResearch/master.env` if present (path: `../../../master.env` from project root). Set `MODEL_PROVIDER=azure_openai` and Azure env vars (e.g. `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`) or use Anthropic/OpenAI vars for `getLLMConfig`.
- **Output**: Writes `cost-perf-results.json` in the project root with `variant`, `durationMs`, `usage` (input/output/total tokens), and `rawUsage`. If `LANGFUSE_SECRET_KEY` is set (e.g. in `master.env`), traces are sent to Langfuse.

## What it does

- Creates a `Run` with the **standard** graph and env-based LLM config (Azure if `MODEL_PROVIDER=azure_openai` or `AZURE_OPENAI_API_KEY` is set, else Anthropic).
- Sends one short message: “What is 2 + 2? Reply with one number only.”
- Uses `ModelEndHandler(collectedUsage)` to collect token usage and measures wall-clock time.
- Writes results to `cost-perf-results.json`.

## Requirements

- Run `npm install` in this directory first.
- Node run with the project’s loader (see `package.json` script `test:cost-perf`). If you see module-not-found errors (e.g. `@smithy/signature-v4`), the repo may need optional dependencies or a specific Node version; try `npm run simple` to confirm the environment.
- At least one LLM provider configured (Azure or Anthropic via env / `master.env`).
