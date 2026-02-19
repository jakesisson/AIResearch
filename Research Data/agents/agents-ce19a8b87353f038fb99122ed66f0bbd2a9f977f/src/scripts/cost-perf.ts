/**
 * Cost & performance test for the agents LangGraph workflow (prior commit).
 * Tracks tokens (cost) and latency (performance). Loads master.env from AIResearch if present.
 * Set COST_PERF_VARIANT=prior when run from compare script.
 */
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

config();
const masterEnvPath = path.join(process.cwd(), '..', '..', '..', 'master.env');
if (fs.existsSync(masterEnvPath)) {
  config({ path: masterEnvPath });
}

import type { UsageMetadata } from '@langchain/core/messages';

async function main() {
  const [{ v4: uuidv4 }, { HumanMessage }, { ChatModelStreamHandler, createContentAggregator }, { ToolEndHandler, ModelEndHandler }, { GraphEvents, Providers }, { getLLMConfig }, { Run }] = await Promise.all([
    import('uuid'),
    import('@langchain/core/messages'),
    import('@/stream'),
    import('@/events'),
    import('@/common'),
    import('@/utils/llmConfig'),
    import('@/run'),
  ]);

  const collectedUsage: UsageMetadata[] = [];
  const variant = process.env.COST_PERF_VARIANT || 'prior';

  const provider =
    process.env.MODEL_PROVIDER === 'azure_openai' || process.env.AZURE_OPENAI_API_KEY
      ? Providers.AZURE
      : Providers.ANTHROPIC;
  const llmConfig = getLLMConfig(provider);

  const { aggregateContent } = createContentAggregator();
  const customHandlers = {
    [GraphEvents.TOOL_END]: new ToolEndHandler(),
    [GraphEvents.CHAT_MODEL_END]: new ModelEndHandler(collectedUsage),
    [GraphEvents.CHAT_MODEL_STREAM]: new ChatModelStreamHandler(),
    [GraphEvents.ON_RUN_STEP_COMPLETED]: {
      handle: (
        _e: string,
        data: import('@/types').StreamEventData
      ): void => {
        aggregateContent({
          event: GraphEvents.ON_RUN_STEP_COMPLETED,
          data: data as unknown as { result: import('@/types').ToolEndEvent },
        });
      },
    },
  };

  const run = await Run.create<import('@/types').IState>({
    runId: uuidv4(),
    graphConfig: {
      type: 'standard',
      llmConfig,
      instructions: 'You are a helpful assistant. Reply briefly.',
      additional_instructions: 'Answer in one short sentence.',
    },
    returnContent: true,
    customHandlers,
  });

  const runConfig = {
    run_id: 'cost-perf-run',
    configurable: {
      user_id: 'cost-perf-user',
      thread_id: 'cost-perf-thread',
    },
    streamMode: 'values' as const,
    version: 'v2' as const,
  };

  const messages = [new HumanMessage('What is 2 + 2? Reply with one number only.')];
  const inputs = { messages };

  const start = performance.now();
  await run.processStream(inputs, runConfig);
  const durationMs = performance.now() - start;

  const inputTokens = collectedUsage.reduce((sum, u) => sum + (u.input_tokens ?? 0), 0);
  const outputTokens = collectedUsage.reduce((sum, u) => sum + (u.output_tokens ?? 0), 0);
  const totalTokens = collectedUsage.reduce((sum, u) => sum + (u.total_tokens ?? 0), 0) || inputTokens + outputTokens;

  const results = {
    variant,
    timestamp: new Date().toISOString(),
    durationMs: Math.round(durationMs),
    usage: {
      inputTokens: inputTokens || undefined,
      outputTokens: outputTokens || undefined,
      totalTokens: totalTokens || undefined,
    },
    rawUsage: collectedUsage,
  };

  const outPath = path.join(process.cwd(), 'cost-perf-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(JSON.stringify(results, null, 2));
  console.log('\nWrote', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
