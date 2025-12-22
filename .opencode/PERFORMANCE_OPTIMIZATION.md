# CI Performance Analysis & Optimization Plan

## Issues Identified from Live Run

### 1. ⏱️ Long Execution Time
**Problem:** CI run took too long to complete

**Likely Bottlenecks:**
- Sequential task processing despite "parallel" design
- Waiting for all tasks before merging (batch merging)
- LLM response times for each Coder Agent
- Build verification on every task
- Multiple Beads syncs (network overhead)

### 2. 💥 Merge Conflicts Not Resolved
**Problem:** Conflict markers `<<<<<<<` still visible in PR #8

**Root Cause:**
- Merging all task branches at the END
- Multiple tasks modified same files
- Git auto-merge failed
- CI Orchestrator didn't resolve conflicts properly

### 3. 🐌 Sequential vs Parallel Execution
**Current Flow:**
```
Wave 1: Spawn 4 tasks → Wait for ALL to complete → Merge ALL
                          ↑
                    This takes too long
```

**Better Flow:**
```
Task 1: Complete → Merge immediately
Task 2: Complete → Merge immediately  
Task 3: Complete → Merge immediately
Task 4: Complete → Merge immediately
        ↑
    Incremental merging reduces conflicts
```

---

## 🚀 Optimization Strategies

### Strategy 1: Merge as You Go (CRITICAL)

**Change from:**
```
1. Execute all tasks in parallel
2. Wait for all to complete
3. Merge all at once → CONFLICTS!
```

**Change to:**
```
1. Execute tasks in parallel
2. As EACH task completes → Merge immediately
3. Next task merges into updated base
4. Conflicts minimized
```

**Benefits:**
- ✅ Reduce merge conflicts (smaller diffs per merge)
- ✅ Earlier integration (catch issues sooner)
- ✅ Don't block on all tasks (merge winners first)
- ✅ Better failure recovery

**Implementation:**

```yaml
# In CI Orchestrator Stage 2 (Wave Execution)

# OLD APPROACH (batch merging at end):
for task in ready_tasks:
    spawn_coder_agent(task)
wait_for_all()
merge_all_branches()  # ← CONFLICTS HERE

# NEW APPROACH (merge as you go):
for task in ready_tasks:
    spawn_coder_agent_with_callback(task, on_complete=merge_immediately)

# Or with monitoring loop:
while tasks_in_progress:
    check_completed_tasks()
    for completed_task in just_finished:
        merge_task_branch(completed_task)  # ← Merge ASAP
        update_beads()
```

---

### Strategy 2: Reduce LLM Wait Times

**Current:** Each Coder Agent makes full LLM call (~10-30 seconds each)

**Optimizations:**

1. **Shorter, focused prompts**
   - Remove verbose instructions
   - Focus on essentials only
   - Current: ~100 lines of prompt
   - Target: ~30 lines

2. **Use faster model for simple tasks**
   ```python
   if task_complexity == "simple":
       model = "opencode/big-pickle"  # Faster
   else:
       model = "opencode/big-pickle"  # Same but with planning
   ```

3. **Cache context files**
   - Load code.md once, reuse for all tasks
   - Don't re-read standards for each task

---

### Strategy 3: Optimize Build Verification

**Current:** Run `bun run build` for EVERY task (~5-10 seconds each)

**Options:**

1. **Skip build on simple tasks** (risky but fast)
   ```bash
   if [[ "$TASK_COMPLEXITY" == "simple" ]]; then
       echo "Skipping build for simple task"
   else
       bun run build
   fi
   ```

2. **Incremental builds** (if supported)
   ```bash
   bun run build --incremental
   ```

3. **Build only at END** (after all merges)
   - Risk: Only catch build failures at end
   - Benefit: Massive time savings

**Recommendation:** Keep per-task builds but optimize:
- Use build cache
- Only rebuild changed files
- Parallel builds if possible

---

### Strategy 4: Reduce Beads Sync Frequency

**Current:** Sync after EVERY status change
```bash
bd update $TASK_ID --status in_progress
bd sync  # ← Network call #1

# ... work ...

bd close $TASK_ID
bd sync  # ← Network call #2
```

**Optimized:** Batch syncs
```bash
bd update $TASK_ID --status in_progress
# ... work ...
bd close $TASK_ID
bd sync  # ← Single network call for both updates
```

**Trade-off:** Less real-time monitoring, but faster execution

---

### Strategy 5: Parallel Merging (Advanced)

**If tasks touch different files:**

Instead of sequential merges:
```bash
# Sequential (current)
merge task-1 → wait → merge task-2 → wait → merge task-3
```

Use parallel merges with conflict detection:
```bash
# Parallel (if non-overlapping)
merge task-1 & merge task-2 & merge task-3
wait_all
check_conflicts
```

**Caveat:** Only works if tasks don't touch same files

---

### Strategy 6: Early Exit on Failures

**Current:** Wait for ALL tasks even if some fail

**Optimized:** Fail fast
```bash
if any_task_failed && not_critical:
    continue_with_successful_tasks
    report_failures
    create_partial_PR
```

**Or:**
```bash
if critical_task_failed:
    stop_all_tasks
    report_immediately
    don't_wait_for_others
```

---

## 🎯 Recommended Changes (Priority Order)

### 🔥 Priority 1: Merge as You Go (CRITICAL)

**Impact:** Biggest reduction in conflicts + faster feedback

**Change:** Modify CI Orchestrator Stage 2 to merge each task immediately upon completion

**Time Saved:** 50% reduction in merge conflicts, faster overall completion

### ⚡ Priority 2: Optimize Merge Conflict Resolution

**Current:** Auto-merge fails → leaves conflict markers

**Fix:** Add intelligent conflict resolution

```bash
git merge $TASK_BRANCH
if [ $? -ne 0 ]; then
    # Conflict detected - resolve intelligently
    resolve_conflicts_with_ai()  # Use LLM to resolve
    # OR
    prefer_incoming_changes()    # Simple strategy
fi
```

### 🚀 Priority 3: Reduce Beads Sync Frequency

**Impact:** 30-50% reduction in network overhead

**Change:** Sync once per task instead of twice

### ⚙️ Priority 4: Optimize Prompts

**Impact:** 20-30% faster LLM responses

**Change:** Reduce prompt verbosity from ~100 lines to ~30 lines

### 🔧 Priority 5: Build Optimization

**Impact:** 10-20% faster builds

**Change:** Incremental builds or build caching

---

## 📊 Expected Performance Improvement

**Current Estimated Timeline:**
- Task execution: 4 tasks × 2 min = 8 minutes (parallel, so ~2 min)
- Merging all at end: 4 merges × 30 sec = 2 minutes
- Conflict resolution: Failed → manual intervention
- **Total: 4-5 minutes + manual fixes**

**Optimized Timeline:**
- Task execution: 4 tasks × 1.5 min = 6 minutes (parallel, so ~1.5 min)
- Merge as you go: 4 merges × 10 sec = 40 sec (overlapped with execution)
- No conflicts: Auto-resolved or prevented
- **Total: ~2 minutes fully automated**

**Improvement: 60% faster + no manual intervention**

---

## 🛠️ Implementation Plan

### Phase 1: Fix Merge Conflicts (Immediate)
1. Update CI Orchestrator to merge incrementally
2. Add conflict resolution logic
3. Test with same Issue #1

### Phase 2: Optimize Performance (Next)
1. Reduce Beads sync frequency
2. Shorten prompts
3. Add build caching

### Phase 3: Advanced Optimizations (Future)
1. Parallel merging for non-overlapping changes
2. Smart task scheduling (dependencies + file conflicts)
3. Adaptive model selection (fast for simple, slow for complex)

---

## 📝 Specific Code Changes Needed

### 1. CI Orchestrator - Merge as You Go

**File:** `.opencode/agent/ci-orchestrator.md`

**Current Stage 2:**
```
5. Spawn all Coder Agents in parallel
6. Wait for ALL to complete
7. Merge ALL branches at end
```

**New Stage 2:**
```
5. Spawn all Coder Agents in parallel WITH completion callbacks
6. For each completed task:
   a. Immediately merge task branch into feature branch
   b. Resolve conflicts if any
   c. Run final build verification
   d. Update Beads status
   e. Sync Beads
7. When all merged, verify final build
```

### 2. Add Merge-on-Complete Logic

```bash
# Monitor task completion
while true; do
    # Get recently completed tasks
    COMPLETED=$(bd list --json | jq -r '.[] | select(.status == "closed" and .merged != true) | .id')
    
    for TASK_ID in $COMPLETED; do
        TASK_BRANCH="$FEATURE_BRANCH-task-$TASK_ID"
        
        echo "Merging $TASK_BRANCH immediately..."
        git fetch origin $TASK_BRANCH
        git merge origin/$TASK_BRANCH --no-ff -m "merge: integrate task $TASK_ID"
        
        if [ $? -ne 0 ]; then
            # Conflict - resolve intelligently
            resolve_conflicts "$TASK_ID"
        fi
        
        # Mark as merged in Beads
        bd note $TASK_ID "merged: true"
        bd sync
    done
    
    # Check if all tasks done
    REMAINING=$(bd list --json | jq '[.[] | select(.status != "closed")] | length')
    if [ $REMAINING -eq 0 ]; then
        break
    fi
    
    sleep 10  # Check every 10 seconds
done
```

### 3. Intelligent Conflict Resolution

```bash
resolve_conflicts() {
    local TASK_ID=$1
    
    # Get conflicting files
    CONFLICTS=$(git diff --name-only --diff-filter=U)
    
    for FILE in $CONFLICTS; do
        echo "Resolving conflict in $FILE"
        
        # Strategy 1: Prefer incoming changes (simple)
        git checkout --theirs $FILE
        
        # OR Strategy 2: Use AI to resolve (advanced)
        # opencode run --agent "Coder Agent" "Resolve conflict in $FILE"
        
        git add $FILE
    done
    
    git commit -m "fix: resolve conflicts from task $TASK_ID"
}
```

---

## ✅ Next Steps

1. **Review this analysis**
2. **Choose priority changes** (recommend: P1 + P2)
3. **Update CI Orchestrator** with merge-as-you-go
4. **Test with new issue**
5. **Measure improvement**

---

**Goal: Cut execution time in half + eliminate manual conflict resolution**
