# Agent Name Resolution Fix

## Issue
GitHub Actions workflows were failing with:
```
agent "ci-orchestrator" not found. Falling back to default agent
```

## Root Cause
OpenCode CLI uses the **`name`** field from the agent's YAML frontmatter, not the `id` field.

**Agent frontmatter:**
```yaml
---
id: ci-orchestrator          # ❌ NOT used for --agent flag
name: CI Orchestrator        # ✅ THIS is what --agent uses
---
```

## Fix Applied

### Changed in Workflows

**opencode.yml (line 133):**
```diff
- --agent "ci-orchestrator" \
+ --agent "CI Orchestrator" \
```

**opencode-workers.yml (line 111):**
```diff
- --agent "ci-orchestrator" \
+ --agent "CI Orchestrator" \
```

## Agent Name Reference

Use these **exact names** when calling agents:

| File | id (metadata) | name (for --agent flag) |
|------|---------------|-------------------------|
| `ci-orchestrator.md` | `ci-orchestrator` | `CI Orchestrator` ✅ |
| `ci-worker.md` | `ci-worker` | `CI Worker` ✅ |
| `coder-agent.md` | `coder-agent` | `Coder Agent` ✅ |
| `opencoder.md` | `opencoder` | `OpenCoder` ✅ |
| `reviewer.md` | `reviewer` | `Reviewer` ✅ |

## How OpenCode Finds Agents

OpenCode automatically scans these locations:
1. **Project directory:** `.opencode/agent/**/*.md`
2. **Global directory:** `~/.config/opencode/agent/**/*.md`

To list available agents:
```bash
opencode agent list
```

## Verification

Test locally:
```bash
cd /Users/omer/dev/descope-trust-center

# List agents (verify names)
opencode agent list

# Test with correct name
opencode run --agent "CI Orchestrator" "test message"
```

## In GitHub Actions

No special setup needed! After `actions/checkout@v4`, OpenCode will discover all agents in `.opencode/agent/`:

```yaml
- name: Checkout
  uses: actions/checkout@v4

- name: Install OpenCode
  run: curl -fsSL https://opencode.ai/install | bash

- name: Run Agent
  run: |
    opencode run \
      --agent "CI Orchestrator" \
      "Your prompt here"
```

## Quick Reference

**✅ DO:**
```bash
opencode run --agent "CI Orchestrator" "..."
opencode run --agent "CI Worker" "..."
```

**❌ DON'T:**
```bash
opencode run --agent "ci-orchestrator" "..."  # Uses id, won't work
opencode run --agent ci-orchestrator "..."     # No quotes, may fail
```

---

**Status:** Fixed in both workflows. Ready for next CI run.
