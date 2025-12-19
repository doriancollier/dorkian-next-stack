---
description: Structured ideation with documentation
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(npm:*), Bash(npx:*), Bash(python3:*)
argument-hint: "[--roadmap-id <uuid> | --roadmap-item \"<title>\"] <task-brief>"
category: workflow
---

# Preflight ▸ Discovery ▸ Plan

**Task Brief:** $ARGUMENTS

---

## Workflow Instructions

Execute this structured engineering workflow for ideation that enforces complete investigation for any code-change task (bug fix or feature). Follow each step sequentially.

### Step 0: Parse Roadmap Integration (Optional)

If the command includes `--roadmap-id <uuid>` or `--roadmap-item "<title>"`:

**For `--roadmap-id <uuid>`:**
1. Extract the UUID from the command arguments
2. Store as `ROADMAP_ITEM_ID` for later use
3. Remove `--roadmap-id <uuid>` from the task brief

**For `--roadmap-item "<title>"` (title-based lookup):**
1. Run: `python3 roadmap/scripts/find_by_title.py "<title>"`
2. If exit code 0 (single match): Use the returned ID as `ROADMAP_ITEM_ID`
3. If exit code 2 (multiple matches): Parse JSON output and prompt user to select using AskUserQuestion
4. If exit code 1 (no matches): Warn user and proceed without linking
5. Remove `--roadmap-item "<title>"` from the task brief

Store `ROADMAP_ITEM_ID` for use in Step 1.5 (after slug creation).

### Step 1: Create Task Slug & Setup

1. Create a URL-safe slug from the task brief (e.g., "fix-chat-scroll-bug")
2. Create feature directory: `mkdir -p specs/{slug}`

This directory will contain all documents related to this feature throughout its lifecycle (ideation → spec → tasks → implementation).

### Step 1.5: Roadmap Integration (If ROADMAP_ITEM_ID is set)

If `ROADMAP_ITEM_ID` was captured in Step 0:

1. Update roadmap status to in-progress:
   ```bash
   python3 roadmap/scripts/update_status.py $ROADMAP_ITEM_ID in-progress
   ```

2. Link the spec directory to the roadmap item:
   ```bash
   python3 roadmap/scripts/link_spec.py $ROADMAP_ITEM_ID $SLUG
   ```

3. When creating the ideation file (Step 7), add to the frontmatter:
   ```markdown
   ---
   roadmapId: {ROADMAP_ITEM_ID}
   slug: {SLUG}
   ---
   ```

This ensures the roadmap item is tracked through the entire spec lifecycle.

### Step 2: Echo & Scope

Write an "Intent & Assumptions" block that:
- Restates the task brief in 1-3 sentences
- Lists explicit assumptions
- Lists what's explicitly out-of-scope to avoid scope creep

This becomes the opening of the ideation file.

### Step 3: Pre-Reading & Codebase Mapping

1. Scan repository for:
   - Developer guides in `developer-guides/`
   - Architecture docs in the root directory
   - README files
   - Related spec files in `specs/`

2. Search for relevant code using keywords inferred from task:
   - Components, hooks, utilities
   - Styles and layout files
   - Data access patterns
   - Feature flags or config

3. Build a dependency/context map:
   - Primary components/modules (with file paths)
   - Shared dependencies (theme/hooks/utils/stores)
   - Data flow (source → transform → render)
   - Feature flags/config
   - Potential blast radius

Record findings under **Pre-reading Log** and **Codebase Map** sections.

### Step 4: Root Cause Analysis (bugs only)

If the task is a bug fix for existing functionality:

1. Reproduce the issue or model the feature behavior locally
2. Capture:
   - Reproduction steps (numbered)
   - Observed vs expected behavior
   - Relevant logs or error messages
   - Screenshots if UI-related

3. Identify plausible root-cause hypotheses with evidence:
   - Code lines, props/state issues
   - CSS/layout rules
   - Event handlers, race conditions
   - API or data flow issues

4. Select the most likely hypothesis and explain why

Record under **Root Cause Analysis**.

### Step 5: Research

1. Consult the research-expert agent to conduct comprehensive research into potential solutions to the task
2. Consider which potential solutions are most appropriate for this code base by exploring the local repo further if necessary
3. Summarize the most promising potential approaches, the pros and cons of each, and an ultimate recommendation.

Record findings under **Research Findings**

### Step 6: Clarification

1. Create a list of any unspecified requirements or clarification that would be helpful for the user to decide upon

### Step 7: Write ideation document

Create `specs/{slug}/01-ideation.md` with the following structure.

**IMPORTANT:** If `ROADMAP_ITEM_ID` was captured in Step 0, include the YAML frontmatter block at the very top of the file. If no roadmap integration, omit the frontmatter block entirely.

**With Roadmap Integration (frontmatter required):**

```markdown
---
roadmapId: {ROADMAP_ITEM_ID}
slug: {slug}
---

# {Task Title}

**Slug:** {slug}
**Author:** Claude Code
**Date:** {current-date}
**Branch:** preflight/{slug}
**Related:** [Roadmap Item](../../roadmap/roadmap.json) ({ROADMAP_ITEM_ID})

---

## 1) Intent & Assumptions
...
```

**Without Roadmap Integration (no frontmatter):**

```markdown
# {Task Title}

**Slug:** {slug}
**Author:** Claude Code
**Date:** {current-date}
**Branch:** preflight/{slug}
**Related:** N/A

---

## 1) Intent & Assumptions
...
```

**Full Document Structure:**

```markdown
## 1) Intent & Assumptions
- **Task brief:** {task description}
- **Assumptions:** {bulleted list}
- **Out of scope:** {bulleted list}

## 2) Pre-reading Log
{List files/docs read with 1-2 line takeaways}
- `path/to/file`: takeaway...

## 3) Codebase Map
- **Primary components/modules:** {paths + roles}
- **Shared dependencies:** {theme/hooks/utils/stores}
- **Data flow:** {source → transform → render}
- **Feature flags/config:** {flags, env, owners}
- **Potential blast radius:** {areas impacted}

## 4) Root Cause Analysis
- **Repro steps:** {numbered list}
- **Observed vs Expected:** {concise description}
- **Evidence:** {code refs, logs, CSS/DOM snapshots}
- **Root-cause hypotheses:** {bulleted with confidence}
- **Decision:** {selected hypothesis + rationale}

## 5) Research
- **Potential solutions:** {numbered list with pros and cons for each}
- **Recommendation** {consise description}

## 6) Clarification
- **Clarifications:** {numbered list with decisions for the user to clarify}


```


---

## Example Usage

### Basic Usage

```bash
/ideate Fix chat UI auto-scroll bug when messages exceed viewport height
```

This will execute the full workflow, creating comprehensive ideation document at `specs/fix-chat-ui-auto-scroll-bug/01-ideation.md` and guide you through discovery of the task.

### With Roadmap Integration

```bash
# Using roadmap item UUID (copy from HTML visualization)
/ideate --roadmap-id 550e8400-e29b-41d4-a716-446655440010 Transaction sync and storage

# Using title search (will prompt if multiple matches)
/ideate --roadmap-item "Transaction sync" Implement transaction fetching from Plaid
```

When using `--roadmap-id` or `--roadmap-item`:
- Item status is automatically set to `in-progress`
- Spec directory is linked to the roadmap item
- `roadmapId` is added to ideation file frontmatter for tracking through the spec lifecycle
