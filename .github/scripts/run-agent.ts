#!/usr/bin/env node
import { createOpenCodeServer } from "./opencode-client";

const DEFAULT_PROMPT = `You are an autonomous AI agent working on the Descope Trust Center repository.

Handle ONE task from highest to lowest priority:

1. PR REVIEWS:
  If there are open PRs with unresolved review comments, pick one and address all the comments.
  Check out the branch, read comments, make fixes if needed, reply to comments, resolve threads with graphql, commit and push.
  Ensure the PR meets the relevant spec in openspec folder.
  If no reviews left and code meets spec, merge the PR.

2. ISSUES:
  If no PR reviews, pick the highest priority open issue (P0 > P1 > P2 > P3 > unlabeled) without 'blocked' label.
  Claim it by changing issue status to 'In Progress' in the project.
  Implement the solution following AGENTS.md patterns, and according to openspec.
  Run checks, create PR.

Rules:
- Work on exactly ONE task per run
- Use conventional commits and proper PR descriptions
- Run 'pnpm typecheck && pnpm lint && (pnpm test || echo "Tests may fail in CI")' before committing
- Follow existing code patterns from AGENTS.md
- Use zod/v4, import { env } from '~/env', never suppress TS errors
- For PR reviews: resolve all comments in one go, don't leave partial work
- Always check git status and commit all changes before pushing
- When picking a task, make sure there's no PR already open for it, if exists - review it instead.`;

async function main() {
  const customTask = process.env.CUSTOM_TASK;
  const prompt = customTask || DEFAULT_PROMPT;

  console.log("🤖 Starting OpenCode agent...");
  console.log(`Prompt: ${prompt.slice(0, 200)}...`);

  let server: Awaited<ReturnType<typeof createOpenCodeServer>> | undefined;
  let exitCode = 0;

  try {
    console.log("🔧 Starting OpenCode server...");
    server = await createOpenCodeServer();
    console.log("✅ Connected to OpenCode server");

    console.log("📝 Creating session...");
    const session = await server.createSession();
    console.log(`   Session ID: ${session.id}`);

    console.log("💬 Sending prompt and streaming response...\n");
    await server.subscribeAndChat(session, prompt);

    console.log("\n✅ Agent completed");
  } catch (error) {
    console.error("\n❌ Agent failed:", error);
    exitCode = 1;
  } finally {
    if (server) {
      await server.cleanup();
    }
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
