# CI Orchestrator Quick Start Guide

## Testing Your New CI System

### Prerequisites

1. **GitHub App Setup** (already done)
   - APP_ID secret configured
   - APP_PRIVATE_KEY secret configured
   
2. **Anthropic API Key** (already done)
   - ANTHROPIC_API_KEY secret configured

3. **Beads Configuration**
   - `.beads/config.yaml` has `sync-branch: "beads-sync"`
   - `beads-sync` branch exists in repository

### Test Scenario 1: Simple Feature (3 tasks)

Create a test issue to verify the system works:

**Issue Title**: "Add user profile avatar component"

**Issue Body**:
```markdown
## Objective
Create a reusable avatar component for user profiles

## Requirements
- Display user image or initials fallback
- Support different sizes (sm, md, lg)
- Add hover state with tooltip
- Use Tailwind CSS v4

## Acceptance Criteria
- Component renders in Storybook
- All size variants work
- Fallback to initials when no image
- Build passes without errors
```

**Expected Task Breakdown** (by Task Manager):
1. Create Avatar component with TypeScript types
2. Add Tailwind styling and size variants
3. Add tests and Storybook story

**Expected Behavior**:
1. Comment `/oc plan` on issue
2. CI Orchestrator + Task Manager creates tasks
3. Beads tasks created (epic + 3 child tasks)
4. 3 CI Workers execute in parallel (Wave 1)
5. All task branches merged
6. PR created automatically

**Validation Steps**:
```bash
# After planning completes:
1. Check tasks/subtasks/user-profile-avatar/ directory created
2. Check bd list shows 4 tasks (1 epic + 3 children)
3. Check bd ready shows 3 tasks ready

# After execution completes:
1. Check all tasks closed: bd list --json | jq '.[] | .status'
2. Check PR created: gh pr list
3. Check feature branch has all changes: git log opencode/issue-XXX
4. Check build passes: bun run build
```

### Test Scenario 2: Complex Feature with Dependencies (5 tasks)

**Issue Title**: "Implement OAuth authentication flow"

**Issue Body**:
```markdown
## Objective
Add OAuth 2.0 authentication with provider integration

## Requirements
- OAuth provider configuration
- Login/callback routes
- Session management
- User profile sync
- Logout functionality

## Acceptance Criteria
- Users can log in via OAuth
- Sessions persist correctly
- User profile data syncs
- Logout clears session
- Build and tests pass
```

**Expected Task Breakdown**:
1. Setup OAuth configuration and types (no deps - Wave 1)
2. Create login route and redirect (no deps - Wave 1)
3. Implement callback handler (depends on 1, 2 - Wave 2)
4. Add session management (depends on 3 - Wave 3)
5. Add logout and cleanup (depends on 4 - Wave 4)

**Expected Behavior**:
- Wave 1: Tasks 1, 2 execute in parallel
- Wave 2: Task 3 executes after Wave 1 completes
- Wave 3: Task 4 executes after Wave 2 completes
- Wave 4: Task 5 executes after Wave 3 completes

**Validation**:
```bash
# Check dependency graph
bd list --json | jq '.[] | {id, title, deps: .depends_on}'

# Monitor wave execution in GitHub Actions logs
# Look for parallel Task tool invocations
```

### Test Scenario 3: Error Handling

**Issue Title**: "Add component with intentional build error"

**Issue Body**:
```markdown
## Objective
Test CI error handling (this will intentionally fail)

## Requirements
- Create component with TypeScript error
- Verify build catches the error
- Verify task marked as blocked
- Verify workflow stops

## Acceptance Criteria
- Build fails as expected
- Beads task marked blocked
- GitHub issue shows error comment
- No PR created
```

**Expected Behavior**:
1. CI Worker implements task
2. Build verification fails: `bun run build`
3. Task marked as `blocked` in Beads
4. Error reported to GitHub issue
5. Workflow stops (no PR creation)

**Validation**:
```bash
# Check task status
bd show <task-id>  # Should show status: blocked

# Check GitHub issue for error comment
# Should see build failure details
```

### Monitoring Commands

During workflow execution:

```bash
# Check ready tasks
bd ready

# Check all tasks status
bd list

# Check specific task
bd show <task-id>

# View task dependencies
bd list --json | jq '.[] | {id, deps: .depends_on}'

# View git branches
git branch -r | grep task-

# View GitHub Actions logs
gh run list
gh run view <run-id> --log
```

### Debug Mode

To test locally before GitHub Actions:

```bash
# 1. Install tools
brew install beads  # or download from GitHub
brew install bun
npm install -g @opencode/cli

# 2. Configure Beads
echo 'sync-branch: "beads-sync"' >> .beads/config.yaml
bd init

# 3. Test Task Manager locally
opencode run --agent subagents/core/task-manager \
  "Break down this feature: [paste issue body]"

# 4. Test CI Orchestrator planning stage
ISSUE_NUMBER=123 \
FEATURE_BRANCH=opencode/issue-123 \
opencode run --agent ci-orchestrator \
  "MODE: plan, ISSUE_NUMBER: 123"

# 5. Check generated tasks
bd list
cat tasks/subtasks/*/objective.md
```

### Troubleshooting

**Issue**: Tasks not created in Beads
**Solution**: 
```bash
# Check if bd init was run
bd list

# Check sync branch configured
cat .beads/config.yaml | grep sync-branch

# Manually create test task
bd create "Test task" -p 1
bd sync
```

**Issue**: CI Workers not spawning
**Solution**:
- Check GitHub Actions logs for Task tool errors
- Verify subagent path: `subagents/ci/ci-worker`
- Check ANTHROPIC_API_KEY is set

**Issue**: Build failures not detected
**Solution**:
- Check `bun run build` runs correctly
- Verify package.json has build script
- Check CI Worker verification stage logs

**Issue**: Merge conflicts not resolved
**Solution**:
- Review task separation (overlapping files?)
- Check CI Orchestrator merge stage logs
- Manual merge may be needed for complex conflicts

### Performance Benchmarks

Expected timings for different scenarios:

**Simple Feature (3 parallel tasks)**:
- Planning: ~30-60 seconds
- Execution Wave 1: ~2-4 minutes (3 tasks in parallel)
- Merging: ~30 seconds
- PR Creation: ~10 seconds
- **Total**: ~3-5 minutes

**Moderate Feature (8 tasks, 3 waves)**:
- Planning: ~45-75 seconds
- Execution:
  - Wave 1 (4 tasks): ~2-4 minutes
  - Wave 2 (3 tasks): ~2-4 minutes
  - Wave 3 (1 task): ~2-3 minutes
- Merging: ~60 seconds
- PR Creation: ~10 seconds
- **Total**: ~8-12 minutes

**Complex Feature (15 tasks, 5 waves)**:
- Planning: ~60-90 seconds
- Execution: ~10-15 minutes (depends on wave count)
- Merging: ~2 minutes
- PR Creation: ~10 seconds
- **Total**: ~15-20 minutes

Compare to sequential (no parallelism): **2-5x slower**

### Success Criteria

Your CI system is working correctly when:

✅ **Planning Phase**:
- [ ] Task Manager creates task files
- [ ] Beads tasks created with dependencies
- [ ] bd ready shows correct task count
- [ ] GitHub issue shows planning summary

✅ **Execution Phase**:
- [ ] CI Workers spawn in parallel (check logs)
- [ ] Each worker creates task branch
- [ ] Build verification runs for each task
- [ ] Beads status updates correctly
- [ ] Waves execute in correct order

✅ **Merge Phase**:
- [ ] All task branches merged
- [ ] Conflicts resolved (if any)
- [ ] Final build passes
- [ ] Feature branch pushed

✅ **PR Phase**:
- [ ] PR created automatically
- [ ] PR body lists all tasks
- [ ] PR links to issue
- [ ] Reviewer triggered

✅ **Error Handling**:
- [ ] Build failures detected
- [ ] Tasks marked blocked
- [ ] Errors reported to issue
- [ ] Workflow stops cleanly

### Next Steps

After successful testing:

1. **Document Patterns**: Note successful task breakdown patterns
2. **Tune Performance**: Adjust agent temperatures if needed
3. **Add Custom Gates**: Enhance CI Worker with project-specific checks
4. **Train Team**: Share workflow with other developers
5. **Iterate**: Refine based on real-world usage

### Reporting Issues

If you encounter problems:

1. Capture GitHub Actions logs
2. Export Beads state: `bd list --json > debug-tasks.json`
3. Share error messages and context
4. Note which stage failed (Planning, Execution, Merge, PR)

---

**Ready to test?** Start with Test Scenario 1 and work your way up!
