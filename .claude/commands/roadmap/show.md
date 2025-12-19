---
description: Display the current roadmap summary
argument-hint: "(no arguments)"
allowed-tools: Bash
category: roadmap
---

# Roadmap Show

Display the current roadmap summary with MoSCoW prioritization breakdown.

## Usage

```
/roadmap:show
```

## Implementation

Run the generate_summary.py script and display the output:

```bash
python3 .claude/skills/managing-roadmap-moscow/scripts/generate_summary.py
```

## Output

The summary includes:
- Items grouped by MoSCoW priority (Must-Have, Should-Have, Could-Have, Won't-Have)
- Items grouped by time horizon (Now, Next, Later)
- Status breakdown (not-started, in-progress, completed, on-hold)
- Health indicators (at-risk, blocked items)
