# Monitoring CI Progress via Beads

## Overview

The CI Orchestrator system syncs Beads state frequently throughout workflow execution, allowing you to **monitor progress externally** in real-time from any machine with access to the repository.

## Why Periodic Syncing?

Beads uses a **remote sync branch** (`beads-sync`) to share task state across machines. By syncing frequently during CI execution, you can:

✅ **Monitor progress** - See which tasks are in-progress, completed, or blocked  
✅ **Debug failures** - Identify stuck tasks before CI completes  
✅ **Track waves** - Observe parallel execution in real-time  
✅ **Audit history** - Full log of task state changes via git commits  

## Sync Points

The CI system syncs Beads at these key points:

### CI Orchestrator Syncs

| Stage | Sync Point | Message | Purpose |
|-------|-----------|---------|---------|
| **Stage 0: Init** | Start | `ci: start workflow for issue #N` | Mark workflow start |
| **Stage 1: Planning** | After task creation | `chore: create epic and tasks for issue #N` | Share task breakdown |
| **Stage 2: Wave Execution** | Before each wave | `ci: start wave with N tasks` | Signal wave start |
| **Stage 2: Wave Execution** | After each wave | `ci: wave complete - N success, M failed` | Report wave results |
| **Stage 2: Wave Execution** | All tasks done | `ci: all tasks complete` | Signal execution done |
| **Stage 3: Merging** | Before merging | `ci: start merging phase` | Signal merge start |
| **Stage 3: Merging** | After merging | `ci: merged N branches, resolved M conflicts` | Report merge status |
| **Stage 3: Merging** | Build passed | `ci: merge complete, build passed` | Confirm quality gate |
| **Stage 4: PR Creation** | After PR | `ci: PR #N created` | Link PR to tasks |
| **Stage 5: Cleanup** | After cleanup | `ci: cleanup complete - deleted N branches` | Final status |

### CI Worker Syncs

| Stage | Sync Point | Message | Purpose |
|-------|-----------|---------|---------|
| **Stage 1: Setup** | Before start | `(pull from remote)` | Get latest state |
| **Stage 1: Setup** | Task claimed | `worker: start task TASK_ID` | Mark task claimed |
| **Stage 6: Complete** | Task done | `worker: complete task TASK_ID - build passed` | Mark task complete |
| **Error** | Build failed | `worker: task TASK_ID blocked - build failed` | Signal failure |

## How to Monitor Externally

### 1. Initial Setup

On your local machine:

```bash
# Clone the repo (if not already)
git clone <repo-url>
cd <repo>

# Initialize Beads
bd init

# Configure sync branch
echo 'sync-branch: "beads-sync"' >> .beads/config.yaml

# Initial sync to pull task database
bd sync
```

### 2. Real-Time Monitoring

While CI is running, periodically sync to see updates:

```bash
# Pull latest task state
bd sync

# View all tasks
bd list

# View ready tasks (currently executing)
bd ready

# View specific task
bd show <task-id>

# View only in-progress tasks
bd list --json | jq '.[] | select(.status == "in_progress")'

# View task history
git log beads-sync --oneline
```

### 3. Continuous Monitoring (Auto-refresh)

Create a monitoring script:

```bash
#!/bin/bash
# monitor-ci.sh

while true; do
  clear
  echo "=== CI Progress Monitor ==="
  echo "Last update: $(date)"
  echo ""
  
  # Sync to get latest
  bd sync --quiet 2>/dev/null
  
  # Show summary
  TOTAL=$(bd list --json 2>/dev/null | jq 'length')
  OPEN=$(bd list --json 2>/dev/null | jq '[.[] | select(.status == "open")] | length')
  IN_PROGRESS=$(bd list --json 2>/dev/null | jq '[.[] | select(.status == "in_progress")] | length')
  CLOSED=$(bd list --json 2>/dev/null | jq '[.[] | select(.status == "closed")] | length')
  BLOCKED=$(bd list --json 2>/dev/null | jq '[.[] | select(.status == "blocked")] | length')
  
  echo "Total Tasks: $TOTAL"
  echo "Open: $OPEN | In Progress: $IN_PROGRESS | Completed: $CLOSED | Blocked: $BLOCKED"
  echo ""
  
  # Show in-progress tasks
  if [ "$IN_PROGRESS" -gt 0 ]; then
    echo "Currently Executing:"
    bd list --json 2>/dev/null | jq -r '.[] | select(.status == "in_progress") | "  - \(.id): \(.title)"'
    echo ""
  fi
  
  # Show blocked tasks
  if [ "$BLOCKED" -gt 0 ]; then
    echo "⚠️  Blocked Tasks:"
    bd list --json 2>/dev/null | jq -r '.[] | select(.status == "blocked") | "  - \(.id): \(.title)"'
    echo ""
  fi
  
  # Show last sync message
  LAST_SYNC=$(git log beads-sync --oneline -1 2>/dev/null)
  echo "Last sync: $LAST_SYNC"
  
  # Refresh every 10 seconds
  sleep 10
done
```

Run it:
```bash
chmod +x monitor-ci.sh
./monitor-ci.sh
```

### 4. Check Specific Details

```bash
# View task with full details
bd show bd-abc.1

# View task as JSON for parsing
bd show bd-abc.1 --json | jq .

# View task description/notes
bd show bd-abc.1 --json | jq -r '.description // .notes'

# View task dependencies
bd show bd-abc.1 --json | jq -r '.depends_on'

# View all closed tasks
bd list --json | jq '.[] | select(.status == "closed") | {id, title}'

# Export all tasks to file
bd list --json > tasks-snapshot.json
```

## Monitoring Workflow States

### Planning Phase

```bash
bd sync
bd list

# You should see:
# - 1 epic task (parent)
# - N child tasks (all status: open)
# - Dependencies mapped
```

### Execution Phase - Wave 1

```bash
bd sync
bd ready  # Shows tasks executing in wave 1

# In-progress tasks:
bd list --json | jq '.[] | select(.status == "in_progress")'

# Expected: Multiple tasks in "in_progress" (parallel execution)
```

### Execution Phase - Wave 2+

```bash
bd sync
bd ready  # Shows next wave tasks

# Previously completed:
bd list --json | jq '.[] | select(.status == "closed")'

# Currently executing:
bd list --json | jq '.[] | select(.status == "in_progress")'
```

### Post-Execution

```bash
bd sync
bd list

# All tasks should be "closed"
# Check for any "blocked" tasks (failures)
```

## Debugging with Beads

### Identify Stuck Tasks

```bash
# Tasks open but not ready (waiting on deps)
bd list --json | jq '.[] | select(.status == "open" and (.depends_on | length > 0))'

# Check if dependencies are closed
bd list --json | jq '.[] | {id, status, depends_on}'
```

### Find Blocked Tasks

```bash
# Show all blocked tasks
bd list --json | jq '.[] | select(.status == "blocked")'

# Get task ID and description
bd show <blocked-task-id>

# Check GitHub Actions logs for error details
gh run list --limit 1
gh run view <run-id> --log
```

### Verify Dependency Graph

```bash
# Visualize dependencies
bd list --json | jq -r '.[] | "\(.id) depends on: \(.depends_on | join(", "))"'

# Check for circular dependencies
# (All tasks should eventually become "ready")
bd ready
```

## Sync Conflict Resolution

In rare cases, parallel workers might create sync conflicts:

```bash
# If sync fails with conflict:
bd sync

# Beads will show conflict message
# Resolve by:
1. Check git status in .beads/
2. Pull latest: git -C .beads/ pull --rebase
3. Retry: bd sync
```

## Monitoring Best Practices

### 1. Sync Frequently

```bash
# Sync every 30-60 seconds during active CI
watch -n 30 'bd sync && bd list'
```

### 2. Watch GitHub Issue Comments

CI Orchestrator posts progress updates to GitHub issues:
- Planning started/complete
- Wave execution status
- Merge progress
- PR creation

Combine with Beads monitoring for full visibility.

### 3. Use JSON for Automation

```bash
# Parse task state programmatically
bd list --json | jq '.[] | {
  id,
  title,
  status,
  priority,
  depends_on
}'

# Create alerts for blocked tasks
BLOCKED=$(bd list --json | jq '[.[] | select(.status == "blocked")] | length')
if [ "$BLOCKED" -gt 0 ]; then
  echo "⚠️  Alert: $BLOCKED tasks blocked!"
fi
```

### 4. Track Progress Over Time

```bash
# Snapshot task state every minute
while true; do
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  bd sync
  bd list --json > "snapshots/tasks-$TIMESTAMP.json"
  sleep 60
done

# Later, analyze progression:
jq -s '.' snapshots/tasks-*.json
```

## Remote Monitoring

You can monitor from **any machine** with repository access:

```bash
# Machine A (your laptop)
bd sync
bd list

# Machine B (another developer's laptop)
bd sync
bd list

# Machine C (CI runner in GitHub Actions)
bd sync
bd list

# All see the same state (synced via beads-sync branch)
```

## Monitoring API

For programmatic access:

```bash
# Get task count
bd list --json | jq 'length'

# Get completion percentage
TOTAL=$(bd list --json | jq 'length')
CLOSED=$(bd list --json | jq '[.[] | select(.status == "closed")] | length')
PERCENT=$((CLOSED * 100 / TOTAL))
echo "Progress: $PERCENT%"

# Get estimated time remaining (if tasks have similar duration)
AVG_TASK_TIME=180  # 3 minutes average
REMAINING=$(bd list --json | jq '[.[] | select(.status != "closed")] | length')
ESTIMATE=$((REMAINING * AVG_TASK_TIME / 60))
echo "Estimated time: $ESTIMATE minutes"
```

## Troubleshooting

### Sync Not Working

```bash
# Check sync branch configured
cat .beads/config.yaml | grep sync-branch

# Should output: sync-branch: "beads-sync"

# Verify beads-sync branch exists
git branch -r | grep beads-sync

# Manually pull sync branch
git fetch origin beads-sync
```

### Tasks Not Updating

```bash
# Force sync
bd sync --force

# Check git connectivity
git -C .beads/ status
git -C .beads/ pull --rebase
```

### Stale Data

```bash
# Clear local cache and re-sync
rm -rf .beads/*.db
bd init
bd sync
```

## Summary

With periodic Beads syncing, you get:

✅ **Real-time visibility** into CI progress  
✅ **External monitoring** from any machine  
✅ **Debugging capability** during execution  
✅ **Audit trail** via git commits  
✅ **Programmable access** via JSON output  

The CI system is designed for **observable execution** - you're never blind to what's happening.
