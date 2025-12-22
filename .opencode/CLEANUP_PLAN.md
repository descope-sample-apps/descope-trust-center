# .opencode Directory Cleanup Plan

## Analysis Summary

Based on the new **Beads-only CI system**, we can significantly reduce the `.opencode/` directory to only what's actually used by our workflows.

---

## What We Actually Use

### GitHub Workflows Usage

**opencode.yml (Planning):**
- Runs: `opencode run --agent "ci-orchestrator"`
- Loads: `.opencode/agent/ci-orchestrator.md`

**opencode-workers.yml (Execution):**
- Runs: `opencode run --agent "ci-orchestrator"`
- Loads: `.opencode/agent/ci-orchestrator.md`

**opencode-review.yml (Review):**
- Runs: `opencode run --model "opencode/big-pickle" --agent "Sisyphus"`
- Uses: `@oracle` subagent routing
- Needs: `.opencode/agent/subagents/code/reviewer.md` (Oracle is likely an alias)

### Agent Dependency Chain

```
CI Orchestrator
├─> CI Worker (subagent)
    ├─> Coder Agent (for simple/moderate tasks)
    ├─> OpenCoder (for complex tasks)
    └─> Context Files:
        └─> .opencode/context/core/standards/code.md
```

### Required Files (Minimum Set)

**✅ KEEP - Actively Used:**

1. **Agents:**
   - `.opencode/agent/ci-orchestrator.md` - Main CI coordinator
   - `.opencode/agent/subagents/ci/ci-worker.md` - Task executor
   - `.opencode/agent/subagents/code/coder-agent.md` - Simple implementations
   - `.opencode/agent/core/opencoder.md` - Complex implementations
   - `.opencode/agent/subagents/code/reviewer.md` - Code review (used by opencode-review.yml)

2. **Context Files:**
   - `.opencode/context/core/standards/code.md` - Loaded by CI Worker

3. **Documentation:**
   - `.opencode/docs/ci-architecture.md` - System architecture
   - `.opencode/docs/ci-quickstart.md` - Testing guide
   - `.opencode/docs/monitoring-beads.md` - Monitoring guide
   - `.opencode/README.md` - Main documentation

---

## Files to Remove (Not Used by New System)

### ❌ REMOVE - Legacy/Unused Agents

**These agents are NOT referenced in our workflows:**

- `.opencode/agent/core/openagent.md` - Not used (we use ci-orchestrator)
- `.opencode/agent/subagents/core/task-manager.md` - **NOT USED** (we simplified to Beads-only)
- `.opencode/agent/subagents/core/documentation.md` - Not used
- `.opencode/agent/subagents/code/build-agent.md` - Not explicitly used (build runs in bash)
- `.opencode/agent/subagents/code/tester.md` - Not used (no test generation yet)
- `.opencode/agent/subagents/code/codebase-pattern-analyst.md` - Not used

**Total agents to remove: 6 files**

### ❌ REMOVE - Unused Context Files

**These context files are NOT loaded by our agents:**

- `.opencode/context/core/essential-patterns.md` - Not referenced
- `.opencode/context/core/standards/analysis.md` - Not referenced
- `.opencode/context/core/standards/docs.md` - Not referenced
- `.opencode/context/core/standards/tests.md` - Not referenced
- `.opencode/context/core/standards/patterns.md` - Not referenced
- `.opencode/context/core/workflows/delegation.md` - Not referenced
- `.opencode/context/core/workflows/review.md` - Not referenced
- `.opencode/context/core/workflows/sessions.md` - Not referenced
- `.opencode/context/core/workflows/task-breakdown.md` - Not referenced (we use Beads directly)
- `.opencode/context/core/system/context-guide.md` - Not referenced
- `.opencode/context/project/project-context.md` - Not referenced

**Total context files to remove: 11 files**

### ❌ REMOVE - Unused Commands

**We don't use slash commands in our CI workflows:**

- `.opencode/command/clean.md` - Not used in CI
- `.opencode/command/commit.md` - Not used in CI
- `.opencode/command/context.md` - Not used in CI
- `.opencode/command/optimize.md` - Not used in CI
- `.opencode/command/test.md` - Not used in CI
- `.opencode/command/validate-repo.md` - Not used in CI

**Total commands to remove: 6 files**

### ❌ REMOVE - Unused Tools

- `.opencode/tool/env/index.ts` - Not used
- `.opencode/env.example` - Not used

**Total tools to remove: 2 files**

---

## Summary

### Before Cleanup
```
.opencode/
├── agent/                       # 11 files
├── command/                     # 6 files
├── context/                     # 12 files
├── docs/                        # 3 files
├── tool/                        # 1 directory
├── README.md                    # 1 file
└── env.example                  # 1 file

Total: ~34 files
```

### After Cleanup (Minimal CI System)
```
.opencode/
├── agent/
│   ├── ci-orchestrator.md                    # ✅ Main CI coordinator
│   ├── core/
│   │   └── opencoder.md                      # ✅ Complex task implementation
│   └── subagents/
│       ├── ci/
│       │   └── ci-worker.md                  # ✅ Task executor
│       └── code/
│           ├── coder-agent.md                # ✅ Simple implementations
│           └── reviewer.md                   # ✅ Code review
├── context/
│   └── core/
│       └── standards/
│           └── code.md                       # ✅ Coding standards
├── docs/
│   ├── ci-architecture.md                    # ✅ Architecture docs
│   ├── ci-quickstart.md                      # ✅ Testing guide
│   └── monitoring-beads.md                   # ✅ Monitoring guide
└── README.md                                 # ✅ Main documentation

Total: 11 files (67% reduction)
```

---

## Files to Remove (Detailed List)

**Agents to delete (6):**
```bash
rm .opencode/agent/core/openagent.md
rm .opencode/agent/subagents/core/task-manager.md
rm .opencode/agent/subagents/core/documentation.md
rm .opencode/agent/subagents/code/build-agent.md
rm .opencode/agent/subagents/code/tester.md
rm .opencode/agent/subagents/code/codebase-pattern-analyst.md
```

**Context files to delete (11):**
```bash
rm .opencode/context/core/essential-patterns.md
rm .opencode/context/core/standards/analysis.md
rm .opencode/context/core/standards/docs.md
rm .opencode/context/core/standards/tests.md
rm .opencode/context/core/standards/patterns.md
rm .opencode/context/core/workflows/delegation.md
rm .opencode/context/core/workflows/review.md
rm .opencode/context/core/workflows/sessions.md
rm .opencode/context/core/workflows/task-breakdown.md
rm .opencode/context/core/system/context-guide.md
rm .opencode/context/project/project-context.md
```

**Commands to delete (6):**
```bash
rm .opencode/command/clean.md
rm .opencode/command/commit.md
rm .opencode/command/context.md
rm .opencode/command/optimize.md
rm .opencode/command/test.md
rm .opencode/command/validate-repo.md
```

**Tools to delete (2):**
```bash
rm -rf .opencode/tool
rm .opencode/env.example
```

**Empty directories to clean up:**
```bash
rmdir .opencode/command                         # After deleting all commands
rmdir .opencode/context/core/workflows          # After deleting workflow files
rmdir .opencode/context/core/system             # After deleting system files
rmdir .opencode/context/project                 # After deleting project context
rmdir .opencode/agent/subagents/core            # After deleting core subagents
```

---

## Verification Steps

After cleanup, verify the system still works:

1. **Check file structure:**
   ```bash
   tree .opencode
   ```

2. **Verify agent references:**
   ```bash
   grep -r "ci-orchestrator" .github/workflows/
   grep -r "ci-worker" .opencode/agent/ci-orchestrator.md
   grep -r "coder-agent\|opencoder" .opencode/agent/subagents/ci/ci-worker.md
   grep -r "code.md" .opencode/agent/subagents/ci/ci-worker.md
   ```

3. **Test with dry-run (if possible):**
   - Create a test issue
   - Trigger `/oc plan` manually
   - Monitor logs for missing file errors

---

## Rationale

### Why We Can Remove Task Manager

**Old approach:**
```
CI Orchestrator → Task Manager → Creates tasks/subtasks/ folder → Writes task specs to files
                                ↓
                              Also creates Beads tasks (duplication)
```

**New simplified approach:**
```
CI Orchestrator → Directly creates Beads tasks with bd note for specs
                  ↓
                  Single source of truth (no file duplication)
```

**Result:** Task Manager is no longer needed. We simplified to Beads-only.

### Why We Can Remove Other Agents

- **openagent**: General-purpose agent for interactive use, not used in CI
- **documentation**: Not used in automated CI workflows
- **build-agent**: We just run `bun run build` in bash directly
- **tester**: Not generating tests yet (future enhancement)
- **codebase-pattern-analyst**: Not used in current workflows

### Why We Can Remove Context Files

Our CI Worker only explicitly loads:
```bash
STANDARDS_FILE=".opencode/context/core/standards/code.md"
```

All other context files (patterns, workflows, delegation, etc.) are not referenced.

### Why We Can Remove Commands

Slash commands are for **interactive use** (e.g., `/commit`, `/test`).

Our **CI workflows** don't use slash commands - they call agents directly:
```bash
opencode run --agent "ci-orchestrator" ...
```

---

## Future Considerations

### If You Want to Add Features Later:

**Test Generation:**
- Keep/restore: `.opencode/agent/subagents/code/tester.md`
- Keep/restore: `.opencode/context/core/standards/tests.md`

**Build Validation Agent:**
- Keep/restore: `.opencode/agent/subagents/code/build-agent.md`

**Interactive Development:**
- Keep/restore: `.opencode/agent/core/openagent.md`
- Keep/restore: `.opencode/context/core/essential-patterns.md`

**Slash Commands for Manual Use:**
- Keep/restore: `.opencode/command/*.md`

### Safe Approach

Instead of deleting, consider **archiving**:
```bash
mkdir .opencode-archive
mv .opencode/agent/core/openagent.md .opencode-archive/
# ... etc
```

This way you can restore if needed.

---

## Recommendation

**Option 1: Aggressive Cleanup (Minimal CI-Only)**
- Remove all 25 unused files
- Keep only the 11 essential files
- System is laser-focused on CI workflows
- 67% reduction in file count

**Option 2: Conservative Cleanup (Keep Useful Extras)**
- Remove definitely unused files (Task Manager, old workflows)
- Keep potentially useful agents (tester, build-agent) for future
- Keep one general context file for reference
- ~40% reduction, more flexibility

**Option 3: Archive Instead of Delete**
- Move unused files to `.opencode-archive/`
- Easy to restore if needed
- Keep git history clean

---

## Next Steps

1. Review this plan
2. Decide on cleanup approach (Aggressive/Conservative/Archive)
3. Execute cleanup
4. Test CI workflow
5. Update README to reflect new minimal structure
