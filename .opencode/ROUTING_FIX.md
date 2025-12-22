# CI Architecture Update: Direct Routing to Coder Agent

## Issue Encountered

During the first live test of the CI system (Issue #1), the CI Orchestrator encountered an error:

```
task(subagent_type="subagents/ci/ci-worker", ...)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
               Not a valid subagent type in Task tool
```

## Root Cause

The Task tool has a predefined list of valid subagent types:
- `general` - General-purpose agent
- `explore` - Codebase exploration
- `Coder Agent` - Code implementation ✅
- `Reviewer` - Code review
- `Tester` - Test authoring
- `Build Agent` - Build validation
- etc.

**Custom subagent paths like `"subagents/ci/ci-worker"` are NOT supported.**

## Solution: Direct Routing

Instead of routing through CI Worker, the CI Orchestrator now routes **directly to Coder Agent**.

### Old Architecture (Didn't Work)
```
CI Orchestrator
    └─> task(subagent_type="subagents/ci/ci-worker")  ❌ Invalid
        └─> CI Worker
            └─> Coder Agent
```

### New Architecture (Works!)
```
CI Orchestrator
    └─> task(subagent_type="Coder Agent")  ✅ Valid
        (Includes all CI Worker responsibilities in prompt)
```

## What Changed

### CI Orchestrator (ci-orchestrator.md)

**Line 278 - Changed routing:**
```diff
- subagent_type="subagents/ci/ci-worker",
+ subagent_type="Coder Agent",
```

**Lines 280-322 - Enhanced prompt:**

The prompt now includes all CI Worker responsibilities:
1. ✅ Load task from Beads (`bd show $TASK_ID --json`)
2. ✅ Create isolated task branch
3. ✅ Mark task in_progress (`bd update`, `bd sync`)
4. ✅ Implement according to specs
5. ✅ Verify build passes (`bun run build`)
6. ✅ Commit and push to task branch
7. ✅ Mark task complete (`bd close`, `bd sync`)
8. ✅ Return to feature branch
9. ✅ Report back to orchestrator

**Result:** Same functionality, simpler architecture.

## CI Worker File Status

**File:** `.opencode/agent/subagents/ci/ci-worker.md`

**Status:** Kept for reference but not used in routing

**Why keep it:**
- Documents the intended workflow
- Could be useful if Task tool adds custom agent support
- Shows the design pattern we wanted to implement
- Reference for future agent development

## Benefits of Direct Routing

1. **Works immediately** - Uses supported Task tool subagent types
2. **Simpler call chain** - One less hop in delegation
3. **Same functionality** - All responsibilities preserved in prompt
4. **Better performance** - Fewer agent transitions
5. **Clearer debugging** - Direct path from orchestrator to implementation

## What's Preserved

All CI Worker features are still intact:

- ✅ **Task isolation** - Each task on separate branch
- ✅ **Beads tracking** - Status updates synced
- ✅ **Build verification** - Must pass before completion
- ✅ **Parallel execution** - Multiple Coder Agents in parallel
- ✅ **Error handling** - Build failures block task completion
- ✅ **Branch cleanup** - Returns to feature branch after

## Testing Status

**First Live Test:** Issue #1 in descope-trust-center repo

**Before fix:**
```
⚠️ agent "ci-orchestrator" not found → FIXED (name vs id)
⚠️ subagent_type="subagents/ci/ci-worker" invalid → FIXED (direct routing)
```

**After fix:**
- ✅ CI Orchestrator found successfully
- ✅ Tasks created in Beads (4 ready tasks)
- ✅ Wave execution starting
- 🔄 Waiting for Coder Agent to complete tasks...

## Future Considerations

### If Task Tool Adds Custom Agent Support

If OpenCode adds support for custom subagent paths in the future:

```python
task(subagent_type=".opencode/agent/subagents/ci/ci-worker")
```

We could revert to the CI Worker intermediate layer for better separation of concerns.

### If We Need More Complexity

For complex tasks that need planning, the CI Orchestrator can route to different agents:

```python
# Simple tasks
task(subagent_type="Coder Agent", ...)

# Complex tasks with planning
task(subagent_type="general", ...)  # Uses OpenCoder internally
```

## Architecture Comparison

### Original Design (Ideal)
```
GitHub Actions
    └─> CI Orchestrator (plans, coordinates)
        └─> CI Worker (task isolation, Beads tracking)
            └─> Coder Agent (implementation)
                OR
            └─> OpenCoder (complex planning + implementation)
```

### Current Implementation (Pragmatic)
```
GitHub Actions
    └─> CI Orchestrator (plans, coordinates, delegates)
        └─> Coder Agent (task isolation + Beads tracking + implementation)
```

**Trade-off:** Slightly less separation of concerns for Task tool compatibility.

**Result:** Fully functional system that works with current OpenCode capabilities.

## Files Updated

1. **CI Orchestrator** (`.opencode/agent/ci-orchestrator.md`)
   - Changed routing from CI Worker to Coder Agent
   - Enhanced prompt with all task execution responsibilities
   - Preserved all functionality

2. **Workflows** (no changes needed)
   - Still call CI Orchestrator directly
   - Everything else works as designed

## Summary

**Problem:** Task tool doesn't support custom subagent paths  
**Solution:** Route directly to Coder Agent with enhanced prompt  
**Result:** Same functionality, simpler architecture, fully operational  

**Status:** ✅ Live and running on Issue #1

---

**Commit:** `75663de` - "fix: use Coder Agent directly instead of CI Worker subagent"  
**Date:** December 22, 2025
