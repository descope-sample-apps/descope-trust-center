#!/usr/bin/env node
import { execSync } from "child_process";

import { createOpenCodeServer } from "./opencode-client";

const CONTEXT = `You are an autonomous AI agent working on the Descope Trust Center repository.

## RULES (always follow)
- ONE task per run only
- Never suppress TypeScript errors
- Never use process.env directly, use import { env } from '~/env'
- Use zod/v4 for validation (not zod)
- Conventional commits: feat:, fix:, chore:, docs:
- All changes must be committed before pushing
- Follow patterns in AGENTS.md`;

const DEFAULT_PROMPT = `${CONTEXT}

## SETUP (always do first)
1. Run: git fetch origin && git status
2. If uncommitted changes exist, stash them: git stash
3. Ensure you're on main and it's up to date: git checkout main && git pull origin main

## PRIORITY ORDER - Handle ONE task:

### 1. PR REVIEWS (highest priority)
Find PRs with pending reviews:
  gh pr list --state open --json number,title,url,reviewDecision

For each PR, check for review comments:
  gh api repos/{owner}/{repo}/pulls/{number}/comments --jq '.[].body'
  gh pr view <number> --json reviews,comments

If PR has unresolved review comments:
- Log: echo "📋 Working on PR #<number>: <title>"
- gh pr checkout <number>
- Read all comments and understand the requested changes
- Check openspec/changes/ for relevant spec if feature PR
- Make fixes addressing ALL comments
- Run: pnpm typecheck && pnpm lint && pnpm test
- Commit: git commit -m "fix: address review comments"
- Push: git push
- Reply to each comment explaining the fix using:
  gh api repos/{owner}/{repo}/pulls/{number}/comments/{comment_id}/replies -f body="<response>"

If PR has no unresolved comments and CI passes (check with gh pr checks <number>):
- gh pr merge <number> --squash --delete-branch

### 2. ISSUES (if no PR reviews needed)
Find issues:
  gh issue list --state open --json number,title,labels

Priority order: P0-critical > P1-high > P2-medium > P3-low > unlabeled
Skip issues with 'blocked' label

Before claiming, check no PR already exists for the issue:
  gh pr list --state all --search "head:feat/issue-<number>" --json number,state

To claim an issue:
- Log: echo "📋 Working on issue #<number>: <title>"
- Create branch: git checkout -b feat/issue-<number>-<short-slug>
- Add comment: gh issue comment <number> --body "🤖 Starting work on this issue"

Implementation:
- Check openspec/changes/ for relevant design docs matching the issue
- Follow patterns in AGENTS.md
- Write tests for new functionality

Before PR:
- pnpm typecheck (must pass, fix all errors)
- pnpm lint (must pass)
- pnpm test (must pass - if fails, fix the tests or code)
- git status (commit ALL changes including new files)
- git push -u origin HEAD

Create PR:
  gh pr create --title "feat: <description>" --body "Closes #<issue-number>"

## ERROR HANDLING
- If typecheck/lint/test fails: Fix the issues, don't skip them
- If issue is unclear: Add a comment asking for clarification, then pick another task
- If merge conflicts: git fetch origin main && git rebase origin/main, resolve conflicts
- If stuck after 3 attempts on same problem: Add blocker comment to issue and exit`;

interface WorkItem {
  type: "pr" | "issue";
  number: number;
  title: string;
}

/**
 * Get all open work items (PRs needing review and unblocked issues)
 */
function getOpenWorkItems(): WorkItem[] {
  const items: WorkItem[] = [];

  try {
    // Get open PRs that aren't approved
    const prsJson = execSync(
      'gh pr list --state open --json number,title,reviewDecision --jq "[.[] | select(.reviewDecision != \\"APPROVED\\")]"',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
    ).trim();

    if (prsJson) {
      const prs = JSON.parse(prsJson) as Array<{
        number: number;
        title: string;
      }>;
      for (const pr of prs) {
        items.push({ type: "pr", number: pr.number, title: pr.title });
      }
    }
  } catch (error) {
    console.warn("⚠️  Could not fetch PRs:", error);
  }

  try {
    // Get open issues (excluding blocked ones and ones that already have PRs)
    const issuesJson = execSync(
      'gh issue list --state open --json number,title,labels --jq "[.[] | select(.labels | map(.name) | index(\\"blocked\\") | not)]"',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
    ).trim();

    if (issuesJson) {
      const issues = JSON.parse(issuesJson) as Array<{
        number: number;
        title: string;
      }>;

      // Filter out issues that already have an open PR
      for (const issue of issues) {
        try {
          const existingPr = execSync(
            `gh pr list --state open --search "head:feat/issue-${issue.number}" --json number --jq 'length'`,
            { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
          ).trim();

          if (existingPr === "0" || !existingPr) {
            items.push({
              type: "issue",
              number: issue.number,
              title: issue.title,
            });
          }
        } catch {
          // If check fails, include the issue anyway
          items.push({
            type: "issue",
            number: issue.number,
            title: issue.title,
          });
        }
      }
    }
  } catch (error) {
    console.warn("⚠️  Could not fetch issues:", error);
  }

  return items;
}

/**
 * Dispatch agents for all remaining work items
 */
function dispatchAgentsForRemainingWork(): void {
  // Only dispatch if running in GitHub Actions
  if (!process.env.GITHUB_ACTIONS) {
    console.log("⏭️  Not in GitHub Actions, skipping dispatch");
    return;
  }

  // Prevent infinite loops - only dispatch on wave 0 (the initial run)
  const waveCount = parseInt(process.env.AGENT_WAVE_COUNT || "0", 10);
  if (waveCount > 0) {
    console.log(
      `⏭️  Wave ${waveCount} agent, not dispatching more (only wave 0 dispatches)`,
    );
    return;
  }

  const workItems = getOpenWorkItems();

  if (workItems.length === 0) {
    console.log("✨ No remaining work to dispatch");
    return;
  }

  const repo =
    process.env.GITHUB_REPOSITORY || "descope-sample-apps/descope-trust-center";

  console.log(`\n🌊 Dispatching ${workItems.length} agent(s) for remaining work...`);

  let dispatched = 0;
  const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_AGENTS || "5", 10);

  for (const item of workItems.slice(0, maxConcurrent)) {
    try {
      const taskDescription =
        item.type === "pr"
          ? `Review and address any comments on PR #${item.number}: ${item.title}`
          : `Work on issue #${item.number}: ${item.title}`;

      // Use base64 to safely pass the task through the command line
      const encodedTask = Buffer.from(taskDescription).toString("base64");

      execSync(
        `gh workflow run opencode-agent.yml --repo "${repo}" -f wave_count=1 -f task_base64="${encodedTask}"`,
        { stdio: "inherit" },
      );

      console.log(
        `  ✅ Dispatched agent for ${item.type} #${item.number}: ${item.title}`,
      );
      dispatched++;

      // Small delay to avoid rate limiting
      if (dispatched < workItems.length) {
        execSync("sleep 1");
      }
    } catch (error) {
      console.error(
        `  ❌ Failed to dispatch agent for ${item.type} #${item.number}:`,
        error,
      );
    }
  }

  if (workItems.length > maxConcurrent) {
    console.log(
      `⚠️  Limited to ${maxConcurrent} concurrent agents. ${workItems.length - maxConcurrent} items will be picked up in next wave.`,
    );
  }

  console.log(`\n🚀 Dispatched ${dispatched} agent(s)`);
}

async function main() {
  const customTask = process.env.CUSTOM_TASK;
  // If custom task provided, prepend context so agent knows the rules
  const prompt = customTask ? `${CONTEXT}\n\n## YOUR TASK\n${customTask}` : DEFAULT_PROMPT;

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
    // dispatch agents for any remaining work items
    dispatchAgentsForRemainingWork();
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
