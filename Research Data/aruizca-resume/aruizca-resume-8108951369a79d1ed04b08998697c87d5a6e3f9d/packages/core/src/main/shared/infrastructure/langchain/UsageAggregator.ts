/**
 * Callback handler for cost-perf mode: aggregates LLM token usage from handleLLMEnd.
 * When COST_PERF=1, pass an instance to chain.invoke({ callbacks: [aggregator] })
 * then read COST_PERF_USAGE.
 */
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import type { LLMResult } from '@langchain/core/outputs';

export interface TokenUsageEntry {
  input_tokens: number;
  output_tokens: number;
}

export const COST_PERF_USAGE: TokenUsageEntry[] = [];

export class UsageAggregator extends BaseCallbackHandler {
  name = 'usage_aggregator';

  override async handleLLMEnd(output: LLMResult): Promise<void> {
    const raw = (output as any).llmOutput;
    const usage = raw?.tokenUsage ?? raw?.usage;
    if (usage) {
      const input = usage.input_tokens ?? usage.prompt_tokens ?? usage.promptTokens ?? 0;
      const output_tokens = usage.output_tokens ?? usage.completion_tokens ?? usage.completionTokens ?? 0;
      if (input > 0 || output_tokens > 0) {
        COST_PERF_USAGE.push({ input_tokens: input, output_tokens });
        return;
      }
    }
    const gens = output.generations?.flat() ?? [];
    for (const g of gens) {
      const msg = (g as any).message;
      const meta = msg?.usage_metadata ?? msg?.response_metadata?.usage ?? msg?.usage;
      if (meta) {
        const input = meta.input_tokens ?? meta.prompt_tokens ?? meta.promptTokens ?? 0;
        const out = meta.output_tokens ?? meta.completion_tokens ?? meta.completionTokens ?? 0;
        if (input > 0 || out > 0) {
          COST_PERF_USAGE.push({ input_tokens: input, output_tokens: out });
        }
      }
    }
  }
}
