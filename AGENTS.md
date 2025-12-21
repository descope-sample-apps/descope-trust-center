# Agent Instructions

This repository uses an autonomous development workflow powered by OpenCode with OhMyOpenCode plugin.

## Overview

This project supports AI-powered autonomous development through GitHub Issues and Pull Requests.

### Commands

Comment on a GitHub Issue with:

| Command | Description |
|---------|-------------|
| `/oc plan` | Analyze the issue and break it into parallelizable tasks |
| `/oc work` | Directly implement the fix/feature in the issue |

### How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   /oc plan      │────►│Planner-Sisyphus │────►│ Creates tasks   │
│   (on issue)    │     │  breaks down    │     │ & spawns workers│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Parallel Workers│
                                               │   (Sisyphus)    │
                                               └────────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Creates PRs   │
                                               └────────┬────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Human reviews  │◄────│     Oracle      │◄────│   PR Created    │
│  & merges       │     │  reviews code   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## OhMyOpenCode Agents

This repository uses OhMyOpenCode's built-in agents:

| Agent | Purpose |
|-------|---------|
| **Sisyphus** | Main orchestrator - implements features, coordinates work |
| **Planner-Sisyphus** | Breaks down issues into atomic, parallelizable tasks |
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
```

### Task Hierarchy

- `bd-a1b2` - Epic/Parent task
- `bd-a1b2.1` - Child task
- `bd-a1b2.1.1` - Sub-task

## Project Structure

```
.github/
├── workflows/
│   ├── opencode.yml          # Main entry point
│   ├── opencode-workers.yml  # Parallel task workers
│   └── opencode-review.yml   # PR review cycle
├── CODEOWNERS                # Human reviewers

.opencode/
└── config.json               # OpenCode + OhMyOpenCode configuration

.beads/                       # Task database (auto-managed)
```

## For AI Agents

When working on this repository:

1. **Always use Beads** for task tracking
2. **Check existing tasks** before creating new ones: `bd list`
3. **Update task status** as you work
4. **Leverage OhMyOpenCode agents** - use `@oracle` for review, `@librarian` for docs

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
