# CI Orchestrator Architecture

## Overview

The CI Orchestrator system provides autonomous, parallel task execution for GitHub Issues using **Beads as the single source of truth** for task management. It eliminates duplication by storing all task information directly in Beads, making the system simpler and more efficient for agents to work with.

## Architecture Diagram

```
GitHub Issue
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│                    opencode.yml                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /oc plan Command                                    │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ 1. Create feature branch                       │  │  │
│  │  │ 2. Run CI Orchestrator (Planning Mode)         │  │  │
│  │  │    ├─> Task Manager breaks down issue          │  │  │
│  │  │    ├─> Creates tasks/subtasks/{feature}/       │  │  │
│  │  │    └─> Converts to Beads tasks                 │  │  │
│  │  │ 3. Dispatch to opencode-workers.yml            │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│               opencode-workers.yml                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CI Orchestrator (Execution Mode)                    │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Stage 0: Initialize                            │  │  │
│  │  │   - Verify tools, sync Beads                   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Stage 2: Wave Execution (Parallel)             │  │  │
│  │  │   ┌──────────────────────────────────────────┐ │  │  │
│  │  │   │ Wave 1: bd ready → 3 tasks ready         │ │  │  │
│  │  │   │  ├─> CI Worker (task bd-abc.1) ──────┐   │ │  │  │
│  │  │   │  ├─> CI Worker (task bd-abc.2) ──────┤   │ │  │  │
│  │  │   │  └─> CI Worker (task bd-abc.3) ──────┤   │ │  │  │
│  │  │   │                                       │   │ │  │  │
│  │  │   │ Each CI Worker:                      │   │ │  │  │
│  │  │   │   1. Create task branch              │   │ │  │  │
│  │  │   │   2. Mark in_progress in Beads       │   │ │  │  │
│  │  │   │   3. Delegate to Coder Agent/        │   │ │  │  │
│  │  │   │      OpenCoder for implementation    │   │ │  │  │
│  │  │   │   4. Verify build passes             │   │ │  │  │
│  │  │   │   5. Push to task branch             │   │ │  │  │
│  │  │   │   6. Close task in Beads             │   │ │  │  │
│  │  │   │                                       │   │ │  │  │
│  │  │   │ ◄─────────────────────────────────────┘   │ │  │  │
│  │  │   │ Wait for wave completion                  │ │  │  │
│  │  │   └──────────────────────────────────────────┘ │  │  │
│  │  │   ┌──────────────────────────────────────────┐ │  │  │
│  │  │   │ Wave 2: bd ready → 2 tasks ready         │ │  │  │
│  │  │   │  (tasks that depended on Wave 1)         │ │  │  │
│  │  │   │  ├─> CI Worker (task bd-abc.4) ──────┐   │ │  │  │
│  │  │   │  └─> CI Worker (task bd-abc.5) ──────┤   │ │  │  │
│  │  │   │                                       │   │ │  │  │
│  │  │   │ ◄─────────────────────────────────────┘   │ │  │  │
│  │  │   └──────────────────────────────────────────┘ │  │  │
│  │  │   Repeat until all tasks closed               │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Stage 3: Merge All Task Branches               │  │  │
│  │  │   - Fetch all task branches                    │  │  │
│  │  │   - Merge each into feature branch             │  │  │
│  │  │   - Resolve conflicts intelligently            │  │  │
│  │  │   - Verify final build                         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Stage 4: Create Pull Request                   │  │  │
│  │  │   - Generate PR with task summary              │  │  │
│  │  │   - Link to issue                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Stage 5: Cleanup                               │  │  │
│  │  │   - Delete task branches                       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│              opencode-review.yml                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Reviewer Agent                                      │  │
│  │    - Code review                                     │  │
│  │    - APPROVE or REQUEST_CHANGES                      │  │
│  │    - Trigger rework if needed (max 3 cycles)         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. CI Orchestrator Agent

**Location**: `.opencode/agent/ci-orchestrator.md`

**Purpose**: Master coordinator for the entire CI workflow

**Responsibilities**:
- Initialize environment and verify tools
- Delegate to Task Manager for issue breakdown
- Convert Task Manager output to Beads tasks
- Execute tasks in parallel waves using CI Workers
- Merge all task branches
- Create pull requests
- Handle errors and report status

**Key Features**:
- Structured workflow with 5 stages
- Parallel execution of independent tasks
- Intelligent conflict resolution
- Quality gates at every stage
- Comprehensive error handling

### 2. CI Worker Subagent

**Location**: `.opencode/agent/subagents/ci/ci-worker.md`

**Purpose**: Execute individual tasks on isolated branches

**Responsibilities**:
- Create dedicated task branch
- Load task specification and coding standards
- Delegate implementation to Coder Agent or OpenCoder
- Verify build passes
- Update Beads status
- Push completed work

**Key Features**:
- Branch isolation (no conflicts between parallel workers)
- Context-aware implementation
- Build verification before completion
- Automatic status tracking
- Error reporting

### 3. Task Manager Integration

**NOT USED** - Simplified to use Beads directly

**Why**: Beads already provides everything needed:
- ✅ Task storage (JSONL database)
- ✅ Hierarchy (epic + child tasks via `--parent`)
- ✅ Dependencies (`bd dep add`)
- ✅ Status tracking (open, in_progress, closed, blocked)
- ✅ Metadata (title, description via notes, priority)
- ✅ JSON export (`bd list --json`, `bd show --json`)

The CI Orchestrator creates tasks directly in Beads without an intermediate format.

### 4. Existing Agent Ecosystem

The CI system leverages your existing agents:

- **Coder Agent**: Simple, focused implementations
- **OpenCoder**: Complex features with full planning
- **Reviewer**: Automated code review (via opencode-review.yml)
- **Tester**: Test generation (can be invoked by CI Worker)

## Workflow Execution

### Planning Phase (`/oc plan`)

1. User comments `/oc plan` on GitHub issue
2. `opencode.yml` triggers:
   - Creates feature branch `opencode/issue-123`
   - Runs CI Orchestrator in planning mode
   - CI Orchestrator analyzes issue directly (no delegation)
   - Creates epic in Beads: `bd create "Issue #123: Title"`
   - Creates child tasks: `bd create "Task title" --parent $EPIC_ID`
   - Adds detailed specs to each task: `bd note $TASK_ID "## Objective..."`
   - Maps dependencies: `bd dep add $TASK_ID $DEPENDS_ON_ID`
   - Syncs to `beads-sync` branch
3. Posts planning summary to issue
4. Dispatches to `opencode-workers.yml`

### Execution Phase (Automatic)

1. `opencode-workers.yml` triggers
2. CI Orchestrator enters execution mode:
   - **Wave 1**: Query `bd ready` for tasks with no dependencies
     - Spawn CI Worker for each ready task (parallel)
     - Each worker creates task branch, implements, verifies, pushes
     - Workers update Beads status independently
   - **Wave 2**: After Wave 1 completes
     - Query `bd ready` again (new tasks unblocked)
     - Spawn workers for next wave
   - **Repeat** until all tasks closed
3. CI Orchestrator merges all task branches
4. Runs final build verification
5. Creates pull request
6. Cleans up task branches

### Review Phase (Automatic)

1. `opencode-review.yml` triggers on PR creation
2. Reviewer agent analyzes changes
3. Either approves or requests changes
4. If changes needed: triggers rework cycle (max 3)
5. If approved: requests human CODEOWNERS review

## Branch Strategy

```
main
├── opencode/issue-123 (feature branch)
│   ├── opencode/issue-123-task-bd-abc.1 (task branch)
│   ├── opencode/issue-123-task-bd-abc.2 (task branch)
│   ├── opencode/issue-123-task-bd-abc.3 (task branch)
│   ├── opencode/issue-123-task-bd-abc.4 (task branch)
│   └── opencode/issue-123-task-bd-abc.5 (task branch)
└── beads-sync (task database)
```

**Key Points**:
- Feature branch consolidates all work
- Each task gets isolated branch (no conflicts during parallel work)
- Task branches use `-task-` separator (not `/` to avoid git ref issues)
- All task branches merge into feature branch before PR
- Beads database on separate branch for isolation

## Beads Integration

### Task Storage Format

All task information is stored in Beads. No separate files needed.

**Task Structure**:
```bash
# Create epic
bd create "Issue #123: Add user authentication" -p 1

# Create child task with detailed description
TASK_ID=$(bd create "Implement OAuth login flow" -p 2 --parent $EPIC_ID --json | jq -r '.id')

# Add detailed specification as note
bd note $TASK_ID "## Objective
Implement OAuth 2.0 login flow with Google provider

## Deliverables
- File: src/auth/oauth.ts
- Function: handleOAuthCallback
- Tests: src/auth/oauth.test.ts

## Steps
1. Create OAuth client configuration
2. Implement authorization URL generation
3. Handle callback and token exchange
4. Store user session

## Acceptance Criteria
- [ ] Users can initiate OAuth login
- [ ] Callback handler validates state
- [ ] User session created on success
- [ ] Build passes without errors

## Validation
\`\`\`bash
bun run build
bun test src/auth/oauth.test.ts
\`\`\`"

# Add dependencies
bd dep add $TASK_ID $OTHER_TASK_ID
```

**View Task**:
```bash
# Simple view
bd show $TASK_ID

# JSON for agents
bd show $TASK_ID --json
```

### Status Flow

1. **open**: Task created, not started
2. **in_progress**: CI Worker picked up task
3. **closed**: Task implemented, build verified, pushed
4. **blocked**: Task failed (build error, implementation error)

### Key Commands

```bash
bd ready              # List tasks ready to start (no blockers)
bd update <id> --status in_progress  # Mark task started
bd close <id>         # Mark task complete
bd sync               # Sync to beads-sync branch
bd list --json        # Export all tasks (for automation)
```

## Parallel Execution

### How It Works

CI Orchestrator spawns multiple CI Workers in **parallel** using the `task` tool:

```python
# Single message with MULTIPLE task() calls
task(subagent_type="subagents/ci/ci-worker", ...) # Task 1
task(subagent_type="subagents/ci/ci-worker", ...) # Task 2
task(subagent_type="subagents/ci/ci-worker", ...) # Task 3
```

This achieves **true parallelism** vs sequential execution.

### Wave-Based Execution

Tasks execute in waves based on dependencies:

**Wave 1**: Tasks with no dependencies
- bd-abc.1, bd-abc.2 (run in parallel)

**Wave 2**: Tasks that depend on Wave 1
- bd-abc.3 (depends on bd-abc.2)
- bd-abc.4 (depends on bd-abc.1, bd-abc.2)

**Wave 3**: Tasks that depend on Wave 2
- bd-abc.5 (depends on bd-abc.3, bd-abc.4)

### Benefits

- **Speed**: Independent tasks execute simultaneously
- **Safety**: Dependencies enforced via Beads
- **Isolation**: Each task on separate branch (no conflicts)
- **Resilience**: One task failure doesn't block others

## Quality Gates

### Task Level (CI Worker)

- ✓ Task specification loaded
- ✓ Coding standards applied
- ✓ Build verification passes
- ✓ Acceptance criteria met

### Merge Level (CI Orchestrator)

- ✓ All tasks closed in Beads
- ✓ All task branches merged
- ✓ Final build passes
- ✓ No uncommitted changes

### PR Level (Reviewer)

- ✓ Code quality check
- ✓ Pattern consistency
- ✓ Security scan
- ✓ Human review (CODEOWNERS)

## Error Handling

### Task Failure

```
CI Worker detects build failure
    ↓
Mark task as blocked in Beads
    ↓
Sync status to beads-sync
    ↓
Report error to Orchestrator
    ↓
Orchestrator posts error to issue
    ↓
Stop workflow (no PR creation)
```

### Dependency Deadlock

```
All tasks open, none ready
    ↓
Detect circular dependency
    ↓
Report stuck tasks
    ↓
Request human intervention
    ↓
Stop workflow
```

### Merge Conflict

```
Automatic merge fails
    ↓
Analyze conflict context
    ↓
Intelligently combine both sides
    ↓
Remove conflict markers
    ↓
Verify build still passes
    ↓
If build fails: stop and report
```

## Configuration

### Required Secrets

```yaml
APP_ID: GitHub App ID
APP_PRIVATE_KEY: GitHub App private key
ANTHROPIC_API_KEY: API key for Claude
```

### Beads Configuration

`.beads/config.yaml`:
```yaml
sync-branch: "beads-sync"
```

### Agent Configuration

Agents use frontmatter for configuration:
```yaml
temperature: 0.1  # Low for deterministic output
model: "anthropic/claude-sonnet-4-5"
tools: [read, write, edit, bash, task]
```

## Performance Characteristics

### Planning Stage

- **Single Task Manager invocation**: ~30-60 seconds
- Creates structured task files + Beads tasks
- Scales with issue complexity (not linearly)

### Execution Stage

- **Parallel execution**: N tasks in ~same time as 1 task
- Wave overhead: ~10-20 seconds between waves
- Total time: ~1-3 minutes for simple features, ~5-10 for complex

### Merge Stage

- **Sequential merging**: ~5-10 seconds per task branch
- Conflict resolution: adds ~30-60 seconds per conflict
- Final build: ~20-40 seconds

### Total Workflow

- **Simple feature** (3 tasks): ~3-5 minutes
- **Moderate feature** (8 tasks): ~8-12 minutes  
- **Complex feature** (15 tasks): ~15-25 minutes

Compare to sequential execution: **2-5x faster** with parallelism.

## Monitoring and Debugging

### GitHub Issue Comments

CI Orchestrator posts progress updates:
- Planning started
- Planning complete (task count)
- Implementation started
- Wave status updates
- Merge status
- PR created
- Errors and failures

### Workflow Logs

Check GitHub Actions logs for:
- CI Orchestrator output
- CI Worker outputs (one per task)
- Build verification results
- Beads sync status

### Beads Database

```bash
# Check current status
bd list

# View specific task
bd show bd-abc.1

# Check ready tasks
bd ready

# Export for analysis
bd list --json > tasks.json
```

### Git History

```bash
# View task branches
git branch -r | grep task-

# View merge commits
git log --grep="Merge.*task"

# Check feature branch status
git log opencode/issue-123
```

## Extending the System

### Adding Custom Agents

1. Create agent file in `.opencode/agent/subagents/`
2. Add frontmatter with configuration
3. Reference in CI Worker routing logic

### Customizing Task Breakdown

Modify Task Manager agent:
- Adjust task granularity
- Change dependency strategy
- Add custom validation rules

### Adding Quality Gates

In CI Worker stage 4 (Verification):
- Add test execution
- Add linting
- Add security scans
- Add performance checks

### Integrating External Tools

In CI Orchestrator or CI Worker:
- Add tool installation to setup stage
- Add tool invocation in verification
- Report results in PR summary

## Troubleshooting

### Tasks Not Executing

**Check**:
1. `bd ready` shows tasks?
2. Dependencies correctly set?
3. Previous wave completed?

**Fix**: Review dependency graph, close blockers

### Build Failures

**Check**:
1. Local build passes?
2. Dependencies installed?
3. Correct Node/Bun version?

**Fix**: Run `bun install && bun run build` locally

### Merge Conflicts

**Check**:
1. Task branches overlap functionality?
2. Same files modified by multiple tasks?

**Fix**: Replan with better task separation

### Beads Sync Issues

**Check**:
1. `beads-sync` branch exists?
2. Config has `sync-branch: "beads-sync"`?
3. Permissions to push?

**Fix**: `bd sync --force`, check repo settings

## Best Practices

### Issue Writing

- Clear acceptance criteria
- Break complex features into smaller issues
- Tag related issues for dependency tracking

### Task Breakdown

- Atomic tasks (completable independently)
- Clear deliverables
- Measurable acceptance criteria
- Minimal dependencies

### Branch Management

- One task = one branch
- Regular feature branch updates
- Clean up after PR merge

### Beads Usage

- Sync after every mutation
- Clear task titles
- Document blocking reasons
- Use priorities (1-4)

## Comparison to Previous System

| Aspect | Old (Sisyphus) | New (CI Orchestrator) |
|--------|----------------|------------------------|
| Architecture | Monolithic prompt | Structured agents |
| Planning | Inline | Dedicated Task Manager |
| Execution | Sequential hints | True parallelism |
| Task Tracking | Comments only | Beads + Task files |
| Reusability | None | Agent ecosystem |
| Error Handling | Ad-hoc | Structured gates |
| Extensibility | Hard | Easy (add agents) |
| Debuggability | Difficult | Clear stages |

## Future Enhancements

### Planned

- [ ] Automatic test generation per task
- [ ] Performance regression detection
- [ ] Security scanning integration
- [ ] Deployment preview per PR

### Possible

- [ ] Multi-repo task coordination
- [ ] Dynamic resource allocation
- [ ] ML-based task estimation
- [ ] Automatic rollback on failures

---

## Quick Reference

### Commands

```bash
# GitHub Issue
/oc plan          # Plan and execute
/oc work          # Skip planning, execute directly

# Beads
bd ready          # Show ready tasks
bd list           # Show all tasks
bd show <id>      # Task details
bd sync           # Sync to remote

# Git
git checkout opencode/issue-123              # Feature branch
git checkout opencode/issue-123-task-bd-abc.1  # Task branch
```

### File Locations

```
.opencode/agent/
├── ci-orchestrator.md           # Main CI coordinator
└── subagents/
    ├── ci/
    │   └── ci-worker.md         # Task executor
    └── code/
        ├── coder-agent.md       # Simple implementation
        └── reviewer.md          # Code review

.github/workflows/
├── opencode.yml                 # Entry point
├── opencode-workers.yml         # Execution
└── opencode-review.yml          # Review

.beads/
├── config.yaml                  # Beads config
└── issues.jsonl                 # Task database (single source of truth)
```

### Agent Invocation

```bash
# CI Orchestrator (planning)
opencode run --agent ci-orchestrator "MODE: plan, ISSUE_NUMBER: 123"

# CI Orchestrator (execution)  
opencode run --agent ci-orchestrator "MODE: execute ..."

# CI Worker (single task) - reads from Beads
opencode run --agent subagents/ci/ci-worker "TASK_ID: bd-abc.1 ..."

# View task in Beads
bd show bd-abc.1 --json
```

---

**For more details**, see individual agent files and workflow definitions.
