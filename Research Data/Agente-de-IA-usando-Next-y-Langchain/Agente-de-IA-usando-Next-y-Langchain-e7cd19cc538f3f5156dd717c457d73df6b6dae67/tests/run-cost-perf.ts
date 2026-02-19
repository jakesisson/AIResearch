/**
 * Cost & performance test for the LangGraph workflow (changed area only).
 * Tracks tokens (cost) and latency (performance) for prior vs researched commit.
 * Set COST_PERF_VARIANT=prior|researched when running. Optionally use Langfuse (set LANGFUSE_SECRET_KEY).
 */
import { HumanMessage } from "@langchain/core/messages";
import { createWorkflow } from "../lib/langgraph";
import * as fs from "fs";
import * as path from "path";

const VARIANT = process.env.COST_PERF_VARIANT || "researched";

// Minimal test input that hits only the changed path: agent node (trim → prompt → model)
const TEST_MESSAGES = [
  new HumanMessage("What is 2 + 2? Reply briefly."),
];

type Usage = { inputTokens?: number; outputTokens?: number; totalTokens?: number };
const usageAccumulator: Usage = {};

const collectUsageCallback = {
  handleLLMEnd: async (output: { llmOutput?: { usage?: Usage } }) => {
    const usage = output.llmOutput?.usage;
    if (usage) {
      usageAccumulator.inputTokens = (usageAccumulator.inputTokens ?? 0) + (usage.promptTokens ?? usage.inputTokens ?? 0);
      usageAccumulator.outputTokens = (usageAccumulator.outputTokens ?? 0) + (usage.completionTokens ?? usage.outputTokens ?? 0);
      usageAccumulator.totalTokens = (usageAccumulator.totalTokens ?? 0) + (usage.total_tokens ?? (usageAccumulator.inputTokens! + usageAccumulator.outputTokens!));
    }
  },
};

async function main() {
  const callbacks: unknown[] = [collectUsageCallback];

  if (process.env.LANGFUSE_SECRET_KEY) {
    try {
      const { CallbackHandler } = await import("@langfuse/langchain");
      const langfuseHandler = new CallbackHandler({
        sessionId: `cost-perf-${VARIANT}-${Date.now()}`,
        tags: ["cost-perf", VARIANT],
      });
      callbacks.push(langfuseHandler);
    } catch (e) {
      console.warn("Langfuse not available, tracing without it:", (e as Error).message);
    }
  }

  const graph = createWorkflow().compile();
  const start = performance.now();
  await graph.invoke(
    { messages: TEST_MESSAGES },
    { callbacks }
  );
  const durationMs = performance.now() - start;

  const results = {
    variant: VARIANT,
    timestamp: new Date().toISOString(),
    durationMs: Math.round(durationMs),
    usage: usageAccumulator,
    testMessagesCount: TEST_MESSAGES.length,
  };

  const outPath = path.join(__dirname, "cost-perf-results.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(JSON.stringify(results, null, 2));
  console.log("\nWrote", outPath);
}

main().catch((err) => {
  const msg = String(err?.message ?? err);
  if (msg.includes("absolute URLs") || msg.includes("WXFLOWS") || msg.includes("fetch")) {
    console.error("\nThis test loads the LangGraph workflow, which fetches tools from WxFlows.");
    console.error("Set WXFLOWS_ENDPOINT and WXFLOWS_APIKEY in master.env (or your environment), then re-run.");
  }
  console.error(err);
  process.exit(1);
});
