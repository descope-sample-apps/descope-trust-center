#!/usr/bin/env bun
/**
 * OpenCode runner script using serve + SDK
 * 
 * Usage: bun run .github/scripts/opencode-run.ts --prompt "..." [--agent "..."] [--model "..."]
 * 
 * Environment variables:
 * - ANTHROPIC_API_KEY: Required for Anthropic models
 * - OPENAI_API_KEY: Required for OpenAI models
 */

import { spawn, type Subprocess } from "bun";
import { parseArgs } from "util";

const HOST = "127.0.0.1";
const PORT = 4096;
const BASE_URL = `http://${HOST}:${PORT}`;

// Parse command line arguments
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

// Parse model into provider/model
const [providerID, ...modelParts] = model!.split("/");
const modelID = modelParts.join("/");

if (!providerID || !modelID) {
  console.error(`Invalid model format: ${model}. Expected "provider/model"`);
  process.exit(1);
}

let server: Subprocess | null = null;

async function waitForServer(maxRetries = 30, delayMs = 300): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return true;
    } catch {
      // Server not ready yet
    }
    await Bun.sleep(delayMs);
  }
  return false;
}

async function startServer(): Promise<Subprocess> {
  console.log("Starting opencode serve...");
  
  const proc = spawn(["opencode", "serve", `--hostname=${HOST}`, `--port=${PORT}`], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const ready = await waitForServer();
  if (!ready) {
    proc.kill();
    throw new Error("Failed to start opencode server");
  }

  console.log("OpenCode server ready");
  return proc;
}

async function createSession(): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function chat(sessionId: string, text: string): Promise<string> {
  console.log("Sending message to opencode...");
  
  const body: Record<string, unknown> = {
    providerID,
    modelID,
    parts: [{ type: "text", text }],
  };

  if (agent) {
    body.agent = agent;
  }

  const res = await fetch(`${BASE_URL}/session/${sessionId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Chat failed: ${res.status} ${res.statusText} - ${errorText}`);
  }

  const data = await res.json();
  
  // Find the text response
  const textPart = data.parts?.findLast?.((p: { type: string; text?: string }) => p.type === "text");
  if (!textPart?.text) {
    console.log("Response data:", JSON.stringify(data, null, 2));
    throw new Error("No text response found");
  }

  return textPart.text;
}

async function main() {
  try {
    server = await startServer();
    
    const session = await createSession();
    console.log("Session created:", session.id);

    const response = await chat(session.id, prompt!);
    
    console.log("\n=== Response ===\n");
    console.log(response);
    console.log("\n================\n");

  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  } finally {
    if (server) {
      console.log("Stopping opencode server...");
      server.kill();
    }
  }
}

main();
