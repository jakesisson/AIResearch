#!/usr/bin/env npx tsx
/**
 * Runs cost/performance test for both prior and researched commits, then compares.
 * Only exercises the changed area (LangGraph agent node: trim → prompt → model).
 * Requires: run from repo root; prior and researched project dirs must exist and have npm install + test:cost-perf.
 *
 * Loads master.env from AIResearch (if present) so LANGFUSE_* and other vars are available.
 *
 * Usage:
 *   npx tsx tests/compare-cost-perf.mts
 *
 * Optional: set LANGFUSE_SECRET_KEY (or add to master.env) to send traces to Langfuse.
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Load master.env from AIResearch into process.env (no external deps). */
function loadMasterEnv(): void {
  const masterPath = path.join(__dirname, "..", "..", "..", "master.env");
  if (!fs.existsSync(masterPath)) return;
  const content = fs.readFileSync(masterPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.replace(/#.*$/, "").trim();
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
        value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const ROOT = path.resolve(__dirname, "..");
const PRIOR_DIR = path.join(ROOT, "Agente-de-IA-usando-Next-y-Langchain-bd049f6b662373f99f152ccbacebaea3b9936129");
const RESEARCHED_DIR = path.join(ROOT, "Agente-de-IA-usando-Next-y-Langchain-e7cd19cc538f3f5156dd717c457d73df6b6dae67");

function runTest(cwd: string, variant: "prior" | "researched"): Promise<{ success: boolean; resultsPath: string }> {
  return new Promise((resolve) => {
    const resultsPath = path.join(cwd, "tests", "cost-perf-results.json");
    const child = spawn("npm", ["run", "test:cost-perf"], {
      cwd,
      shell: true,
      env: { ...process.env, COST_PERF_VARIANT: variant },
      stdio: "inherit",
    });
    child.on("close", (code) => {
      resolve({ success: code === 0, resultsPath });
    });
  });
}

function loadResults(p: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function main() {
  loadMasterEnv();

  if (!fs.existsSync(PRIOR_DIR) || !fs.existsSync(RESEARCHED_DIR)) {
    console.error("Prior or researched project dir not found. Expected:");
    console.error("  ", PRIOR_DIR);
    console.error("  ", RESEARCHED_DIR);
    process.exit(1);
  }

  console.log("Running cost-perf test on PRIOR commit...\n");
  const priorOut = await runTest(PRIOR_DIR, "prior");
  if (!priorOut.success) {
    console.error("Prior run failed.");
    process.exit(1);
  }

  console.log("\nRunning cost-perf test on RESEARCHED commit...\n");
  const researchedOut = await runTest(RESEARCHED_DIR, "researched");
  if (!researchedOut.success) {
    console.error("Researched run failed.");
    process.exit(1);
  }

  const priorResults = loadResults(priorOut.resultsPath);
  const researchedResults = loadResults(researchedOut.resultsPath);

  if (!priorResults || !researchedResults) {
    console.error("Could not load one or both result files.");
    process.exit(1);
  }

  const priorUsage = (priorResults.usage as { inputTokens?: number; outputTokens?: number; totalTokens?: number }) ?? {};
  const researchedUsage = (researchedResults.usage as { inputTokens?: number; outputTokens?: number; totalTokens?: number }) ?? {};
  const priorMs = (priorResults.durationMs as number) ?? 0;
  const researchedMs = (researchedResults.durationMs as number) ?? 0;

  const report = {
    prior: {
      durationMs: priorMs,
      inputTokens: priorUsage.inputTokens,
      outputTokens: priorUsage.outputTokens,
      totalTokens: priorUsage.totalTokens,
    },
    researched: {
      durationMs: researchedMs,
      inputTokens: researchedUsage.inputTokens,
      outputTokens: researchedUsage.outputTokens,
      totalTokens: researchedUsage.totalTokens,
    },
    delta: {
      durationMs: researchedMs - priorMs,
      totalTokens: (researchedUsage.totalTokens ?? 0) - (priorUsage.totalTokens ?? 0),
    },
  };

  const reportPath = path.join(ROOT, "tests", "compare-cost-perf-report.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  console.log("\n--- Comparison (changed area only: agent node) ---\n");
  console.log("Prior:      ", report.prior);
  console.log("Researched: ", report.researched);
  console.log("Delta:      ", report.delta);
  console.log("\nReport written to", reportPath);
  if (process.env.LANGFUSE_SECRET_KEY) {
    console.log("Traces were sent to Langfuse (tags: cost-perf, prior | researched).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
