# OpenCode CI System

**Minimal, Beads-focused autonomous CI for GitHub Actions**

This repository uses a streamlined CI agent system optimized for autonomous GitHub issue implementation using Beads task management.

---

## System Overview

This is a **minimal CI-focused** OpenCode setup. Unlike the full OpenAgents framework, this system is laser-focused on:
- ✅ Autonomous GitHub issue implementation
- ✅ Beads-based task management (single source of truth)
- ✅ Parallel task execution in CI
- ✅ Automated PR creation with quality gates

**What's included:** Only the 11 essential files needed for CI workflows.

**What's removed:** Interactive agents, slash commands, and unused context files (67% reduction from standard OpenAgents).

---

## Quick Start

### For Users: Trigger CI

Comment on any GitHub issue:
```bash
/oc plan    # Break down and implement issue in parallel waves
/oc work    # Direct implementation without planning
```

### For Developers: Test Locally

See [CI Quickstart Guide](docs/ci-quickstart.md) for testing the CI system.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CI Orchestrator (Main Coordinator)                        │
├─────────────────────────────────────────────────────────────┤
│  Stage 1: Planning                                          │
│    - Creates Beads epic + child tasks (bd create)           │
│    - Adds task specs with bd note                           │
│    - Maps dependencies with bd dep add                      │
│    - Syncs to beads-sync branch                             │
│                                                             │
│  Stage 2: Wave Execution (Parallel)                        │
│    - Queries bd ready for unblocked tasks                  │
│    - Spawns CI Worker for each task concurrently           │
│    - Monitors progress via bd sync                         │
│    - Repeats waves until all tasks closed                  │
│                                                             │
│  Stage 3: Merge Task Branches                              │
│    - Fetches all task branches from origin                 │
│    - Merges sequentially into feature branch               │
│    - Resolves conflicts intelligently                       │
│    - Verifies final build passes                           │
│                                                             │
│  Stage 4: Create Pull Request                              │
│    - Generates comprehensive PR summary                     │
│    - Lists all completed tasks                             │
│    - Links to issue and task details                       │
│                                                             │
│  Stage 5: Cleanup (Optional)                               │
│    - Deletes remote task branches                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  CI Worker (Task Executor) - Runs in Parallel              │
├─────────────────────────────────────────────────────────────┤
│  1. Create isolated task branch (task-bd-abc.1)             │
│  2. Mark task in_progress in Beads + sync                   │
│  3. Load task spec: bd show $TASK_ID --json                 │
│  4. Load coding standards: code.md                          │
│  5. Delegate to implementation agent:                       │
│     - Simple/Moderate → Coder Agent                         │
│     - Complex → OpenCoder (with planning)                   │
│  6. Verify build passes: bun run build                      │
│  7. Commit and push to task branch                          │
│  8. Mark task closed in Beads + sync                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Implementation Agents                                      │
├─────────────────────────────────────────────────────────────┤
│  Coder Agent:   Simple, focused implementations             │
│  OpenCoder:     Complex, multi-file features                │
│  Reviewer:      Code review and quality (PR review cycle)   │
└─────────────────────────────────────────────────────────────┘
```

**Key Innovation:** All task specifications live in **Beads** (using `bd note`), not duplicated in files. This is the single source of truth.

For detailed architecture documentation, see [CI Architecture](docs/ci-architecture.md).

---

## File Structure

```
.opencode/
├── agent/
│   ├── ci-orchestrator.md                    # Main CI coordinator
│   ├── core/
│   │   └── opencoder.md                      # Complex task implementation
│   └── subagents/
│       ├── ci/
│       │   └── ci-worker.md                  # Parallel task executor
│       └── code/
│           ├── coder-agent.md                # Simple implementations
│           └── reviewer.md                   # Code review agent
├── context/
│   └── core/
│       └── standards/
│           └── code.md                       # Coding standards (TypeScript, React, Tailwind)
├── docs/
│   ├── ci-architecture.md                    # Complete architecture guide
│   ├── ci-quickstart.md                      # Local testing guide
│   └── monitoring-beads.md                   # Real-time monitoring guide
├── README.md                                 # This file
└── CLEANUP_PLAN.md                           # Documentation of what was removed
```

**Total: 11 files** (minimal CI-focused system)

---

## How It Works

### 1. Planning Phase (`/oc plan`)

```bash
# GitHub workflow runs:
opencode run --agent "ci-orchestrator" --model "opencode/big-pickle"

# CI Orchestrator:
# 1. Analyzes GitHub issue
# 2. Creates Beads epic: bd create "Issue #123: Feature title"
# 3. Creates child tasks: bd create "Implement component X" --parent $EPIC_ID
# 4. Adds detailed specs: bd note $TASK_ID "## Objective\n..."
# 5. Maps dependencies: bd dep add task.2 task.1
# 6. Syncs to beads-sync branch
```

**Result:** Tasks ready in Beads, no file duplication.

### 2. Execution Phase (Automatic)

```bash
# CI Orchestrator coordinates waves:
bd ready  # Get unblocked tasks → [task.1, task.2, task.3]

# Spawn CI Workers in parallel (one message, multiple Task tool calls):
task(ci-worker, "Execute task.1")
task(ci-worker, "Execute task.2")
task(ci-worker, "Execute task.3")

# Each CI Worker:
# - Creates branch: opencode/issue-123-task-bd-abc.1
# - Marks in_progress + syncs
# - Loads spec: bd show $TASK_ID --json
# - Implements using Coder Agent or OpenCoder
# - Verifies build passes
# - Commits and pushes to task branch
# - Marks closed + syncs

# When wave completes:
bd ready  # Get newly unblocked tasks → [task.4, task.5]
# Repeat until all tasks closed
```

**Result:** All tasks implemented on separate branches in parallel waves.

### 3. Merge & PR Creation

```bash
# CI Orchestrator:
# 1. Fetches all task branches from origin
# 2. Merges each into feature branch sequentially
# 3. Resolves conflicts if needed
# 4. Verifies final build: bun run build
# 5. Creates PR with summary of all completed tasks
# 6. Requests human review via opencode-review.yml
```

**Result:** Single consolidated PR with all tasks merged.

---

## Beads Integration

### Single Source of Truth

All task information lives in Beads:

```bash
# Create task
bd create "Add user authentication" --parent $EPIC_ID

# Add detailed specification
bd note $TASK_ID "
## Objective
Implement JWT-based authentication

## Deliverables
- File: src/lib/auth.ts
- Function: authenticateUser(token: string)

## Steps
1. Create auth utility functions
2. Add token validation
3. Integrate with API endpoints

## Acceptance Criteria
- [ ] Token validation works
- [ ] API endpoints are protected
- [ ] Build passes: bun run build
"

# CI Worker reads this spec
bd show $TASK_ID --json | jq -r '.description'
```

### Real-Time Monitoring

```bash
# From any machine, sync and check progress
bd sync
bd list

# See task status
bd show $TASK_ID

# Check what's ready to work on
bd ready
```

See [Monitoring Guide](docs/monitoring-beads.md) for details.

---

## Agents

### CI Orchestrator
**File:** `agent/ci-orchestrator.md`  
**Purpose:** Main coordinator for GitHub CI workflows  
**Triggers:** GitHub Actions (opencode.yml, opencode-workers.yml)  
**Responsibilities:**
- Analyze issues and create Beads tasks
- Coordinate parallel task execution
- Merge task branches
- Create pull requests

### CI Worker
**File:** `agent/subagents/ci/ci-worker.md`  
**Purpose:** Execute individual tasks on isolated branches  
**Triggers:** Spawned by CI Orchestrator (via Task tool)  
**Responsibilities:**
- Create task branch
- Load specs from Beads
- Delegate to implementation agent
- Verify builds
- Update Beads status

### Coder Agent
**File:** `agent/subagents/code/coder-agent.md`  
**Purpose:** Simple, focused implementations  
**Triggers:** Delegated by CI Worker for simple/moderate tasks  
**Responsibilities:**
- Implement straightforward features (1-4 files)
- Follow coding standards
- Report implementation details

### OpenCoder
**File:** `agent/core/opencoder.md`  
**Purpose:** Complex, multi-file features with planning  
**Triggers:** Delegated by CI Worker for complex tasks  
**Responsibilities:**
- Plan complex implementations
- Execute multi-file changes
- Validate against requirements

### Reviewer
**File:** `agent/subagents/code/reviewer.md`  
**Purpose:** Code review and quality assurance  
**Triggers:** opencode-review.yml (PR review workflow)  
**Responsibilities:**
- Review consolidated PRs
- Check code quality
- Request changes or approve

---

## GitHub Workflows

### opencode.yml
Triggered by: `/oc plan` or `/oc work` issue comments

**Plan mode:**
1. Creates feature branch
2. Runs CI Orchestrator in planning mode
3. Creates Beads tasks
4. Posts summary to issue
5. Dispatches to opencode-workers.yml

**Work mode:**
1. Creates feature branch
2. Implements directly (no planning)
3. Creates PR immediately

### opencode-workers.yml
Triggered by: `opencode-batch` repository dispatch

**Execution:**
1. Syncs Beads from beads-sync branch
2. Runs CI Orchestrator in execution mode
3. Coordinates parallel wave execution
4. Merges all task branches
5. Creates consolidated PR

### opencode-review.yml
Triggered by: PR opened/updated on `opencode/*` branches

**Review cycle:**
1. Runs Reviewer agent
2. If approved → Request human review
3. If changes needed → Run rework cycle (max 3 attempts)
4. After 3 cycles → Request human intervention

---

## Coding Standards

All implementations follow standards in `context/core/standards/code.md`:

- **TypeScript** with strict types (no `any`)
- **React 19** with functional components
- **Tailwind CSS v4** for styling
- **Bun** as runtime and package manager

CI Workers load these standards before implementation.

---

## What Was Removed

This is a **minimal CI-focused** installation. We removed:

- ❌ Interactive agents (openagent)
- ❌ Task Manager (simplified to Beads-only)
- ❌ Slash commands (not used in CI)
- ❌ Unused context files (11 files)
- ❌ Tool directory and plugins

**Total reduction:** 67% fewer files than standard OpenAgents

See [CLEANUP_PLAN.md](CLEANUP_PLAN.md) for detailed rationale.

### If You Need More

If you want to add interactive development or other features:

```bash
# Install full OpenAgents framework
curl -fsSL https://raw.githubusercontent.com/darrenhinde/OpenAgents/main/install.sh | bash -s developer

# Or restore specific agents from archive
# See CLEANUP_PLAN.md for restoration guide
```

---

## Testing

### Manual Testing

See [CI Quickstart Guide](docs/ci-quickstart.md) for complete testing instructions.

Quick test:
1. Create GitHub issue
2. Comment `/oc plan`
3. Monitor with `bd sync && bd list`
4. Verify PR creation

### Verification

After setup or changes:
```bash
# Check file structure
tree .opencode

# Verify agent references
grep -r "ci-worker" .opencode/agent/ci-orchestrator.md
grep -r "code.md" .opencode/agent/subagents/ci/ci-worker.md

# Test Beads integration
bd sync
bd list
```

---

## Troubleshooting

### Common Issues

**Issue:** Tasks not created in Beads  
**Fix:** Check CI Orchestrator logs, verify Beads is initialized

**Issue:** Build failures in CI Worker  
**Fix:** Check coding standards, verify dependencies installed

**Issue:** Merge conflicts during consolidation  
**Fix:** CI Orchestrator attempts intelligent resolution, check logs

**Issue:** PR not created  
**Fix:** Verify feature branch exists, check orchestrator completion logs

### Debug Tips

```bash
# Check Beads state
bd sync
bd list --json | jq

# View task details
bd show $TASK_ID

# Check GitHub Actions logs
# Go to Actions tab → View workflow run → Expand steps

# Check local Beads config
cat .beads/config.yaml
```

---

## Documentation

- **[CI Architecture](docs/ci-architecture.md)** - Complete system architecture
- **[CI Quickstart](docs/ci-quickstart.md)** - Local testing guide
- **[Monitoring Beads](docs/monitoring-beads.md)** - Real-time monitoring
- **[CLEANUP_PLAN.md](CLEANUP_PLAN.md)** - What was removed and why

---

## Contributing

When modifying this system:

1. **Keep it minimal** - Only add files if truly needed by CI workflows
2. **Test thoroughly** - Use CI Quickstart guide
3. **Update docs** - Reflect changes in architecture docs
4. **Maintain Beads focus** - Beads is the single source of truth

---

## License

This project is licensed under the MIT License.

---

## Credits

Built on [OpenAgents framework](https://github.com/darrenhinde/OpenAgents) by Darren Hinde.

Optimized for CI workflows using:
- **OpenCode CLI** - AI agent orchestration
- **Beads** - Task management by Steve Yegge
- **GitHub Actions** - CI/CD automation

---

## Performance Characteristics

Based on research-backed patterns:
- **+20% routing accuracy** (LLM-based decisions vs. rule-based)
- **+25% consistency** (XML structure optimization)
- **80% context efficiency** (3-level allocation strategy)
- **True parallelism** (wave-based execution)

**Typical workflow:**
- Planning: 1-2 minutes
- Execution: 2-5 minutes per wave (parallel)
- Merging: 1-2 minutes
- Total: 5-15 minutes depending on complexity

---

**For questions or issues, see the documentation or check GitHub Actions logs.**
