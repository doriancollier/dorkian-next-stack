---
description: Stage, validate, and commit changes with lint and type checks
argument-hint: "(no arguments)"
allowed-tools: Bash, Read, Grep
category: git
---

# Git Commit

Stage and commit changes after validating that there are no lint or type errors.

## Task

### Step 1: Run Validation Checks

Run lint and typecheck in parallel. Both must pass before proceeding.

```bash
pnpm lint
```

```bash
pnpm typecheck
```

**If either fails**: Stop and report the errors. Do not proceed to commit.

### Step 2: Review Changes

Show the current state of the repository:

```bash
# Show status
git status

# Show staged changes
git diff --staged

# Show unstaged changes
git diff
```

### Step 3: Stage Changes

Stage all changes for commit:

```bash
git add -A
```

If there are no changes to commit, report this and stop.

### Step 4: Review Recent Commits

Check recent commit style for consistency:

```bash
git log --oneline -5
```

### Step 5: Generate Commit Message

Analyze the staged changes and generate an appropriate commit message:

1. Look at `git diff --staged` to understand what changed
2. Summarize the nature of changes (feature, fix, refactor, docs, etc.)
3. Write a concise message focusing on "why" not "what"

### Step 6: Create Commit

Commit with the generated message using HEREDOC format:

```bash
git commit -m "$(cat <<'EOF'
<commit message here>

Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 7: Verify

Confirm the commit was successful:

```bash
git log -1 --oneline
git status
```

## Output Format

```
Git Commit

Validation:
  [x] Lint passed
  [x] Typecheck passed

Changes:
  - X files changed
  - [brief summary of changes]

Commit:
  [hash] [commit message first line]

Status: Ready to push
```

## Edge Cases

- **Lint fails**: Report errors, suggest fixes, do not commit
- **Typecheck fails**: Report errors with file locations, do not commit
- **No changes**: Report "Nothing to commit, working tree clean"
- **Merge conflict markers**: Warn user about unresolved conflicts
- **Large number of files**: Summarize by category (e.g., "15 component files, 3 test files")
