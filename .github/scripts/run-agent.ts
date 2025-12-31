#!/usr/bin/env node
import { createOpenCodeClient } from "./opencode-client";

const DEFAULT_PROMPT = `You are an autonomous AI agent working on the Descope Trust Center repository.

Handle ONE task from highest to lowest priority:

1. PR REVIEWS: If there are open PRs with unresolved review comments, pick one and address all the comments. Check out the branch, read comments, make fixes, reply to comments, resolve threads, commit and push.

2. ISSUES: If no PR reviews, pick the highest priority open issue (P0 > P1 > P2 > P3 > unlabeled) without 'blocked' label. Claim it, implement the solution following AGENTS.md patterns, run checks, create PR.

Rules:
- Work on exactly ONE task per run
- Use conventional commits and proper PR descriptions
- Run 'pnpm typecheck && pnpm lint && (pnpm test || echo "Tests may fail in CI")' before committing
- Follow existing code patterns from AGENTS.md
- Use zod/v4, import { env } from '~/env', never suppress TS errors
- For PR reviews: resolve all comments in one go, don't leave partial work
- Always check git status and commit all changes before pushing`;

async function main() {
  const customTask = process.env.CUSTOM_TASK;
  const prompt = customTask || DEFAULT_PROMPT;

  console.log("🤖 Starting OpenCode agent...");
  console.log(`Prompt: ${prompt.slice(0, 200)}...`);

  let client;
  let exitCode = 0;

  try {
    console.log("🔧 Creating OpenCode client...");
    client = await createOpenCodeClient();

    console.log("📝 Creating session...");
    const sessionId = await client.createSession();

    console.log("💬 Sending prompt...");
    const response = await client.sendMessage(sessionId, prompt);

    console.log("✅ Agent completed");
    console.log("Response:", response.slice(0, 500));
  } catch (error) {
    console.error("❌ Agent failed:", error);
    exitCode = 1;
  } finally {
    if (client) {
      console.log("🧹 Cleaning up...");
      await client.cleanup();
    }
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
