# Developer Guide Index & Coverage Map

This file maps code areas to their relevant developer guides. It serves three purposes:

1. **Automatic relevance detection** — Tools can check which guides may need updates based on changed files
2. **Developer reference** — Find the right guide for your task
3. **Maintenance tracking** — Each guide has a `last_reviewed` date to help identify stale documentation

## Guide Coverage Map

| Guide | Covers | File Patterns |
|-------|--------|---------------|
| [01-project-structure.md](./01-project-structure.md) | FSD architecture, directory layout, layer organization | `src/layers/**`, `src/app/**/page.tsx`, `src/app/**/layout.tsx` |
| [02-environment-variables.md](./02-environment-variables.md) | T3 Env configuration, adding variables | `src/env.ts`, `.env*`, `*.config.ts` |
| [03-database-prisma.md](./03-database-prisma.md) | Prisma 7, DAL patterns, schema design | `prisma/**`, `src/layers/entities/*/api/**`, `src/lib/prisma.ts`, `src/generated/prisma/**` |
| [04-forms-validation.md](./04-forms-validation.md) | React Hook Form, Zod schemas, Shadcn Form | `**/*form*.tsx`, `**/*schema*.ts`, `**/model/types.ts` |
| [05-data-fetching.md](./05-data-fetching.md) | TanStack Query, server actions, API routes | `src/app/api/**`, `**/api/queries.ts`, `**/api/mutations.ts`, `src/layers/shared/lib/query-client.ts` |
| [06-state-management.md](./06-state-management.md) | Zustand stores, client state patterns | `**/*store*.ts`, `**/model/store.ts`, `src/hooks/**` |
| [07-animations.md](./07-animations.md) | Motion library patterns, transitions | `**/*animation*.ts`, `**/*motion*.tsx`, components with `motion.` |
| [08-styling-theming.md](./08-styling-theming.md) | Tailwind v4, Shadcn UI, theming | `src/app/globals.css`, `src/layers/shared/ui/**`, `src/components/ui/**`, `tailwind.config.*` |

## Pattern Matching Reference

For tooling that needs to match files to guides, here are the glob patterns:

```yaml
# Guide: 01-project-structure.md
patterns:
  - "src/layers/**"
  - "src/app/**/page.tsx"
  - "src/app/**/layout.tsx"
keywords:
  - "FSD"
  - "Feature-Sliced"
  - "layer"
  - "entities"
  - "features"
  - "widgets"
  - "shared"

# Guide: 02-environment-variables.md
patterns:
  - "src/env.ts"
  - ".env*"
  - "*.config.ts"
keywords:
  - "env"
  - "environment"
  - "NEXT_PUBLIC"
  - "createEnv"
  - "T3 Env"

# Guide: 03-database-prisma.md
patterns:
  - "prisma/**"
  - "src/layers/entities/*/api/**"
  - "src/lib/prisma.ts"
  - "src/generated/prisma/**"
keywords:
  - "prisma"
  - "database"
  - "schema"
  - "migration"
  - "DAL"
  - "findMany"
  - "findUnique"
  - "create"
  - "update"
  - "delete"

# Guide: 04-forms-validation.md
patterns:
  - "**/*form*.tsx"
  - "**/*schema*.ts"
  - "**/model/types.ts"
keywords:
  - "useForm"
  - "zodResolver"
  - "z.object"
  - "FormField"
  - "FormItem"
  - "react-hook-form"

# Guide: 05-data-fetching.md
patterns:
  - "src/app/api/**"
  - "**/api/queries.ts"
  - "**/api/mutations.ts"
  - "src/layers/shared/lib/query-client.ts"
keywords:
  - "useQuery"
  - "useMutation"
  - "queryClient"
  - "TanStack"
  - "server action"
  - "API route"
  - "Route Handler"

# Guide: 06-state-management.md
patterns:
  - "**/*store*.ts"
  - "**/model/store.ts"
  - "src/hooks/**"
keywords:
  - "zustand"
  - "create("
  - "useStore"
  - "persist"
  - "devtools"

# Guide: 07-animations.md
patterns:
  - "**/*animation*.ts"
  - "**/*motion*.tsx"
keywords:
  - "motion."
  - "animate"
  - "variants"
  - "transition"
  - "useAnimation"
  - "AnimatePresence"

# Guide: 08-styling-theming.md
patterns:
  - "src/app/globals.css"
  - "src/layers/shared/ui/**"
  - "src/components/ui/**"
  - "tailwind.config.*"
keywords:
  - "@theme"
  - "dark:"
  - "cn("
  - "cva("
  - "Shadcn"
  - "className"
```

## Maintenance Tracking

| Guide | Last Reviewed | Reviewed By | Notes |
|-------|--------------|-------------|-------|
| 01-project-structure.md | 2025-12-22 | Initial | Created with project |
| 02-environment-variables.md | 2025-12-22 | Initial | Created with project |
| 03-database-prisma.md | 2025-12-22 | Initial | Created with project |
| 04-forms-validation.md | 2025-12-22 | Initial | Created with project |
| 05-data-fetching.md | 2025-12-22 | Initial | Created with project |
| 06-state-management.md | 2025-12-22 | Initial | Created with project |
| 07-animations.md | 2025-12-22 | Initial | Created with project |
| 08-styling-theming.md | 2025-12-22 | Initial | Created with project |

## How to Use This Index

### Finding the Right Guide

1. **By code area**: Look at the "Covers" column in the coverage map
2. **By file pattern**: Check if your file matches patterns in the Pattern Matching Reference
3. **By keyword**: Search for related terms in the keywords lists

### Updating Guides

When a guide is updated:
1. Update the "Last Reviewed" date in the Maintenance Tracking section
2. Add notes about what changed
3. Run `/docs:reconcile` to verify consistency with code

### Adding a New Guide

1. Create the guide file in `developer-guides/`
2. Add an entry to the Guide Coverage Map table
3. Add pattern matching rules to the YAML section
4. Add maintenance tracking entry

## Integration with Tooling

This file is read by:
- `/spec:execute` — Checks if implementation touched relevant guide areas
- `/docs:reconcile` — Uses patterns to detect documentation drift
- `check-docs-changed` hook — Session-end reminder for guide updates

The YAML section is designed to be machine-readable for automated tooling.
