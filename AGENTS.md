# Agent Instructions

This repository uses an autonomous development workflow powered by OpenCode with OhMyOpenCode plugin.

## Overview

This project supports AI-powered autonomous development through GitHub Issues and Pull Requests.

### Commands

Comment on a GitHub Issue with:

| Command | Description |
|---------|-------------|
| `/oc plan` | Analyze the issue and break it into parallelizable tasks with dependencies |
| `/oc work` | Directly implement the fix/feature in the issue (no planning phase) |

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              /oc plan                                       │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  opencode.yml (plan job)                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Create feature branch: opencode/issue-123                        │    │
│  │ 2. Planner-Sisyphus creates epic + tasks with dependencies          │    │
│  │ 3. Compute dependency batches (topological sort)                    │    │
│  │ 4. Dispatch opencode-batch event (batch 0)                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  opencode-workers.yml (batch processing)                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        BATCH 1 (parallel)                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │    │
│  │  │ Task A   │  │ Task B   │  │ Task C   │  (no dependencies)       │    │
│  │  │ Sisyphus │  │ Sisyphus │  │ Sisyphus │                          │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘                          │    │
│  │       │             │             │                                 │    │
│  │       ▼             ▼             ▼                                 │    │
│  │  Push to:      Push to:      Push to:                              │    │
│  │  .../bd-abc.1  .../bd-abc.2  .../bd-abc.3                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ batch-complete job: More batches? → dispatch next : dispatch merge  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        BATCH 2 (parallel)                           │    │
│  │  ┌──────────┐  ┌──────────┐                                        │    │
│  │  │ Task D   │  │ Task E   │  (depend on batch 1)                   │    │
│  │  │ Sisyphus │  │ Sisyphus │                                        │    │
│  │  └──────────┘  └──────────┘                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                  │                                          │
│                          (repeat until done)                                │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  opencode-merge.yml                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Merge all task sub-branches into opencode/issue-123              │    │
│  │ 2. If conflicts → Sisyphus resolves                                 │    │
│  │ 3. Create SINGLE PR closing #123                                    │    │
│  │ 4. Delete task sub-branches                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  opencode-review.yml                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     ┌──────────────┐                                │    │
│  │                     │    Oracle    │                                │    │
│  │                     │   reviews    │                                │    │
│  │                     └──────┬───────┘                                │    │
│  │                            │                                        │    │
│  │              ┌─────────────┴─────────────┐                          │    │
│  │              ▼                           ▼                          │    │
│  │        ┌──────────┐               ┌──────────────┐                  │    │
│  │        │ APPROVE  │               │ REQ CHANGES  │                  │    │
│  │        └────┬─────┘               └──────┬───────┘                  │    │
│  │             │                            │                          │    │
│  │             │                            ▼                          │    │
│  │             │                     ┌──────────────┐                  │    │
│  │             │                     │  Sisyphus    │                  │    │
│  │             │                     │  reworks     │ (max 3 cycles)   │    │
│  │             │                     └──────┬───────┘                  │    │
│  │             │                            │                          │    │
│  │             │                            └────────► (loop back)     │    │
│  │             ▼                                                       │    │
│  │   ┌─────────────────────┐                                           │    │
│  │   │  Request CODEOWNERS │                                           │    │
│  │   │  human review       │                                           │    │
│  │   └─────────────────────┘                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Branch Structure

```
main                                      # Production code
├── opencode/issue-123                    # Feature branch (consolidated)
├── opencode/issue-123-task-bd-abc.1      # Task sub-branch (temporary)
├── opencode/issue-123-task-bd-abc.2      # Task sub-branch (temporary)
├── opencode/issue-123-task-bd-abc.3      # Task sub-branch (temporary)
└── beads-db                              # Task database (isolated)
```

> **Note**: Task sub-branches use `-task-` suffix instead of `/` to avoid git ref conflicts
> (git cannot have a branch that is both a name and a prefix for other branches).

## OhMyOpenCode Agents

This repository uses OhMyOpenCode's built-in agents:

| Agent | Purpose |
|-------|---------|
| **Sisyphus** | Main orchestrator - implements features, coordinates work |
| **Planner-Sisyphus** | Breaks down issues into atomic tasks with dependencies |
| **Oracle** | Code review, architecture decisions, debugging assistance |
| **Librarian** | Documentation lookup, OSS implementation examples |
| **Explore** | Fast codebase exploration and pattern matching |

## Task Tracking with Beads

This project uses [Beads](https://github.com/steveyegge/beads) for task tracking.

### Key Commands

```bash
bd ready                      # List ready tasks (no blockers)
bd create "Task title" -p 1   # Create a new task
bd show <task-id>             # Show task details
bd update <task-id> --status done  # Update task status
bd dep add <task> <depends-on>     # Add dependency
bd list --json                # Export tasks as JSON
```

### Task Hierarchy

- `bd-a1b2` - Epic/Parent task (one per issue)
- `bd-a1b2.1` - Child task (atomic work unit)
- `bd-a1b2.1.1` - Sub-task (if needed)

### Dependency-Based Batching

Tasks are organized into batches based on dependencies:
- **Batch 1**: Tasks with no dependencies (can run in parallel)
- **Batch 2**: Tasks that depend on Batch 1 (run after Batch 1 completes)
- **Batch N**: Tasks that depend on Batch N-1

Example:
```
bd-abc.1 "Setup types"           # No deps → Batch 1
bd-abc.2 "Create component"      # No deps → Batch 1
bd-abc.3 "Add styling"           # Deps: .2 → Batch 2
bd-abc.4 "Write tests"           # Deps: .1, .2 → Batch 2
bd-abc.5 "Integration"           # Deps: .3, .4 → Batch 3
```

## Project Structure

```
.github/
├── workflows/
│   ├── opencode.yml          # Entry point: /oc plan, /oc work
│   ├── opencode-workers.yml  # Batch processing with parallel workers
│   ├── opencode-merge.yml    # Merge sub-branches, create PR
│   └── opencode-review.yml   # Oracle review + Sisyphus rework cycle
├── CODEOWNERS                # Human reviewers

.opencode/
└── config.json               # OpenCode + OhMyOpenCode configuration

.beads/                       # Task database (on beads-db branch)
```

## For AI Agents

When working on this repository:

1. **Always use Beads** for task tracking
2. **Check existing tasks** before creating new ones: `bd list`
3. **Update task status** as you work
4. **Leverage OhMyOpenCode agents** - use `@oracle` for review, `@librarian` for docs
5. **Respect dependencies** - don't start tasks until their dependencies are complete

### Code Standards

- TypeScript with strict types (no `any`)
- React 19 with functional components
- Tailwind CSS v4 for styling
- Bun as runtime and package manager

### Before Committing

```bash
bun run build    # Verify no build errors
bun test         # Run tests (if they exist)
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
