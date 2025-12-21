#!/usr/bin/env bun
/**
 * OpenCode runner script - wrapper around `opencode run`
 *
 * Usage: bun run .github/scripts/opencode-run.ts --prompt "..." [--agent "..."] [--model "..."]
 *
 * Environment variables:
 * - ANTHROPIC_API_KEY: Required for Anthropic models
 * - OPENAI_API_KEY: Required for OpenAI models
 */

import { spawn } from "bun";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    prompt: { type: "string" },
    agent: { type: "string" },
    model: { type: "string", default: "opencode/big-pickle" },
  },
  strict: true,
});

if (!values.prompt) {
  console.error("Error: --prompt is required");
  process.exit(1);
}

const { prompt, agent, model } = values;

const args = ["run", "--model", model!];

if (agent) {
  args.push("--agent", agent);
}

args.push(prompt);

console.log(`Running: opencode ${args.join(" ").slice(0, 100)}...`);

const proc = spawn(["opencode", ...args], {
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

const exitCode = await proc.exited;
process.exit(exitCode);
