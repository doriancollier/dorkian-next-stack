---
description: Ask how to do something in this repository
argument-hint: [question]
allowed-tools: Read, Grep, Glob, Bash, Skill, SlashCommand, AskUserQuestion, Task, WebSearch
---

# System Help Command

Answer questions about how to accomplish tasks in this repository using Claude Code or manual methods.

## Arguments

- `$ARGUMENTS` - The question about how to do something (e.g., "how do I create a new feature spec?")

## Task

### 1. Research the Answer

Search these sources to find the relevant process:

**CLAUDE.md (primary documentation)**:
- Read the `CLAUDE.md` file in the project root for project instructions and conventions

**Developer guides**:
- Check `developer-guides/` for detailed implementation patterns and best practices

**Available slash commands**:
- List all commands in `.claude/commands/` directory

**Available agents**:
- List all agents in `.claude/agents/` directory

**Hooks (automated behaviors)**:
- Check `.claude/settings.json` for configured hooks (via ClaudeKit)

### 2. External Research (When Needed)

**CRITICAL**: If the question involves Claude Code features, capabilities, or best practices NOT found in local documentation:

1. **Spawn a research-expert agent** to check official Claude Code documentation:
   ```
   Task(
     description="Research Claude Code [topic]",
     prompt="Quick check: Find official documentation about [specific feature] in Claude Code. Focus on: usage patterns, best practices, and configuration options.",
     subagent_type="research-expert"
   )
   ```

2. **Use WebSearch directly** for quick lookups:
   - Search: `site:docs.anthropic.com claude code [topic]`
   - Search: `site:github.com/anthropics/claude-code [topic]`

3. **Research triggers** - use external research when:
   - Question asks about Claude Code features not in CLAUDE.md
   - Question mentions "skills", "hooks", "agents" architecture
   - Question asks "can Claude Code do X?" and local docs don't answer
   - Question involves recent Claude Code updates or changes

### 3. Read Relevant Files

Based on the question, read the relevant documentation files to understand:
- What slash commands are available for this task
- What developer guides provide patterns for this
- What CLAUDE.md says about conventions
- What agents can assist with specialized tasks
- What skills are available for specialized capabilities

### 4. Identify the Best Approaches

Determine:
1. **Claude Code Method**: Is there a slash command, agent, or skill that can do this?
2. **Manual Method**: What's the step-by-step process to do it by hand?
3. **Process Exists?**: Is there a clearly defined process, or is this undocumented?

### 5. Handle Missing Processes

If NO clear process exists for the user's question:

1. **Acknowledge the gap**: Clearly state that there's no defined process for this yet
2. **Provide best-effort guidance**: Offer what you can based on similar patterns
3. **Offer to create a process**: Ask if they'd like to create one

Use AskUserQuestion:
```
"I couldn't find a defined process for [topic]. Would you like me to create one?"
- Yes, create a new process
- No, the guidance you provided is enough
```

If user says **yes**, run `/system:update create a process for [topic based on user's question]`

### 6. Provide the Answer

## Output Format

```markdown
## How to: [Task Description]

### Via Claude Code

**Option 1: Slash Command** (if applicable)
Use the command: `/command:name [arguments]`

Example:
```
/spec:create Add user authentication feature
```

**Option 2: Direct Prompt** (if no slash command)
Send this to Claude Code:
```
[Example prompt that accomplishes the task]
```

**Option 3: Agent** (if an agent helps)
Use the Task tool with the `[agent-name]` agent for this specialized task.

---

### Manual Method

1. **Open the file**: `[path/to/file]`
2. **Make the change**: [Step-by-step instructions]
3. **Verify**: [Any verification steps]

---

### Would you like me to:
- [ ] Execute the Claude Code method now?
- [ ] Show you more details about [specific aspect]?
```

### Output Format (No Process Found)

```markdown
## How to: [Task Description]

### Process Status: Not Defined

There's no clearly defined process for this in the repository yet.

### Best-Effort Guidance

Based on similar patterns, here's how you might approach this:

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Create a Process?

Would you like me to create a defined process for this? This would:
- Add documentation to CLAUDE.md
- Create a slash command (if appropriate)
- Establish a consistent workflow

**Options:**
- Yes, create a new process → I'll run `/system:update`
- No, the guidance above is enough
```

## Common Question Mappings

Reference these when answering:

| Question Pattern | Claude Code | Manual |
|-----------------|-------------|--------|
| "create a spec" | `/spec:create [description]` | Create file in `specs/` |
| "ideate a feature" | `/ideate [task-brief]` | Create ideation document |
| "commit changes" | `/git:commit` | Use git commands |
| "push to remote" | `/git:push` | `git push` |
| "create a branch" | Direct prompt: "Create branch X" | `git checkout -b` |
| "run database migration" | `/db:migrate` | `pnpm prisma migrate deploy` |
| "scaffold a feature" | `/dev:scaffold [name]` | Create FSD directory structure |
| "review recent work" | `/review-recent-work` | Manual code inspection |
| "manage roadmap" | `/roadmap [subcommand]` | Edit `roadmap/roadmap.json` |
| "git status" | Direct prompt: "Show git status" | `git status && git diff` |

## Claude Code Architecture Notes

When explaining processes, clarify the invocation model:

**Slash Commands (User-Invoked):**
- User explicitly types `/command` to trigger them
- Example: `/spec:create`, `/git:commit`, `/roadmap`
- Use when: User wants explicit control over execution
- Location: `.claude/commands/[namespace]/[name].md`

**Agents (Tool-Invoked):**
- Invoked via Task tool for complex isolated workflows
- Have separate context windows (prevents context pollution)
- Example: `typescript-expert`, `database-expert`, `react-expert`
- Use when: Complex multi-step task needs isolation or specialized expertise
- Location: `.claude/agents/[category]/[name].md`
- Cannot spawn other agents (prevents infinite nesting)

**Skills (Model-Invoked):**
- Reusable expertise packages that Claude applies automatically when relevant
- Can be project-local (`.claude/skills/`) or external plugins
- Invoked automatically by Claude based on context matching
- Example: `reviewing-code` for code review expertise, `designing-frontend` for UI generation
- Use when: Content teaches reusable expertise that should apply automatically
- Discover available skills via the Skill tool's available_skills list

**Hooks (Event-Triggered):**
- Automatically run at lifecycle events via ClaudeKit
- Configured in `.claude/settings.json`
- Events: SessionStart, PreToolUse, PostToolUse, UserPromptSubmit, Stop
- Use when: Behavior must happen at specific points

### Choosing Between Agents and Skills

| Criteria | Use Agent | Use Skill |
|----------|-----------|-----------|
| **Scope** | Project-specific complex task | Domain-wide capability |
| **Context** | Needs isolation/separate context | Operates in main conversation |
| **Customization** | Highly customizable per project | Standardized behavior |
| **Definition** | Local `.md` file in `.claude/agents/` | External plugin |
| **Examples** | `database-expert`, `typescript-expert` | `designing-frontend` |

**Key Distinction:**
- **Agents** = Custom project experts defined locally, run in isolated context
- **Skills** = Packaged domain capabilities (plugins), run in main conversation

### When Explaining Processes

- **For Commands**: Explain they're user-triggered with `/cmd`
- **For Agents**: Mention they're spawned via Task tool for isolated execution
- **For Skills**: Explain they're invoked via Skill tool for domain expertise
- **For Hooks**: Explain which lifecycle event triggers them

## Important Notes

- Always check CLAUDE.md first - it's the authoritative source for project conventions
- Developer guides in `developer-guides/` contain detailed patterns
- If a slash command exists, prefer that over a raw prompt
- For database schema changes, remind users about the migration-first workflow
- For code changes, remind about the prohibition on `any` types
