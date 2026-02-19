#!/usr/bin/env node
/**
 * Cost-perf runner: runs resume LLM path with minimal data, writes cost-perf-results.json.
 * Set COST_PERF=1 and load master.env before running. Run from clone root.
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { PromptRunner, COST_PERF_USAGE, validateEnvironment } from '../index';

const variant = process.env.COST_PERF_VARIANT || 'prior';
const inputId = process.env.COST_PERF_INPUT_ID ?? '';

const MINIMAL_PARSED_DATA = {
  profile: { name: `Cost Perf Test${inputId ? ` ${inputId}` : ''}`, headline: 'Test' },
  positions: [],
  education: [],
  skills: []
};

async function main() {
  process.env.COST_PERF = '1';
  await validateEnvironment();
  COST_PERF_USAGE.length = 0;

  const forceRefresh = process.env.COST_PERF_FORCE_REFRESH !== '0';
  const start = performance.now();
  const runner = new PromptRunner();
  try {
    await runner.run(MINIMAL_PARSED_DATA, forceRefresh);
  } catch (err) {
    if (COST_PERF_USAGE.length === 0) throw err;
  }
  const durationMs = performance.now() - start;

  const inputTokens = COST_PERF_USAGE.reduce((s, u) => s + (u.input_tokens || 0), 0);
  const outputTokens = COST_PERF_USAGE.reduce((s, u) => s + (u.output_tokens || 0), 0);
  const out = {
    variant,
    durationMs: Math.round(durationMs * 100) / 100,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens
    }
  };
  const outPath = join(process.cwd(), 'cost-perf-results.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
