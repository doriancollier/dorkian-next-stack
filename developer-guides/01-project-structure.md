# Project Structure Guide

## Directory Layout (FSD Architecture)

This project uses **Feature-Sliced Design (FSD)** for organizing code by business domains with clear layer boundaries.

```
next-starter/
├── prisma/                      # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Next.js App Router (FSD: app layer)
│   │   ├── api/                # API routes (webhooks, external integrations)
│   │   │   ├── users/          # User API routes
│   │   │   └── mcp/            # MCP database server (dev only)
│   │   ├── example/            # Example page
│   │   ├── globals.css         # Global styles + @theme
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── providers.tsx       # Client providers
│   ├── layers/                  # FSD architecture layers
│   │   ├── widgets/            # Large UI compositions
│   │   │   └── [widget]/
│   │   │       ├── ui/
│   │   │       └── index.ts
│   │   ├── features/           # Complete user-facing functionality
│   │   │   └── [feature]/
│   │   │       ├── ui/         # React components
│   │   │       ├── model/      # Business logic, hooks, types
│   │   │       ├── api/        # Server actions, queries
│   │   │       └── index.ts
│   │   ├── entities/           # Business domain objects
│   │   │   └── [entity]/
│   │   │       ├── ui/         # Entity UI components
│   │   │       ├── model/      # Types, Zod schemas
│   │   │       ├── api/        # DAL: queries.ts, mutations.ts
│   │   │       └── index.ts
│   │   └── shared/             # Reusable utilities, UI primitives
│   │       ├── ui/             # Shadcn components
│   │       ├── api/            # Auth utilities (getCurrentUser, requireAuth)
│   │       └── lib/            # Utilities (cn, query-client)
│   ├── components/              # Legacy components (prefer layers/shared/ui)
│   │   └── ui/                 # Shadcn UI components
│   ├── generated/              # Auto-generated code
│   │   └── prisma/            # Prisma client (gitignored)
│   ├── hooks/                  # Global hooks (prefer feature-specific)
│   ├── lib/                    # Low-level utilities
│   │   ├── prisma.ts          # Prisma singleton (only imported by DAL)
│   │   ├── query-client.ts    # TanStack Query config
│   │   └── utils.ts           # cn() utility
│   └── env.ts                  # T3 Env configuration
├── developer-guides/           # Documentation
├── roadmap/                    # Product roadmap
├── specs/                      # Feature specifications
├── __tests__/                  # Test files (mirrors src structure)
├── .env                        # Environment variables (gitignored)
├── .env.example               # Env template
├── components.json             # Shadcn config
├── next.config.ts              # Next.js config
├── package.json
├── postcss.config.mjs          # PostCSS config
├── prisma.config.ts            # Prisma 7 config (required in root)
└── tsconfig.json               # TypeScript config
```

## FSD Layer Hierarchy

```
app → widgets → features → entities → shared
```

| Layer | Purpose | Can Import From |
|-------|---------|-----------------|
| `app/` | Routes, layouts, providers | All lower layers |
| `widgets/` | Large UI compositions | features, entities, shared |
| `features/` | Complete user-facing functionality | entities, shared |
| `entities/` | Business domain objects | shared only |
| `shared/` | Reusable utilities, UI primitives | Nothing (base layer) |

### Key Rules

- ✅ Higher layers can import from lower layers
- ❌ Never import upward (entities → features)
- ❌ Never import across same-level modules (feature A → feature B)
- ✅ All Prisma imports confined to `entities/*/api/` and `shared/api/`

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Pages | `page.tsx` in route folder | `app/example/page.tsx` |
| API Routes | `route.ts` in route folder | `app/api/users/route.ts` |
| Hooks | `use-` prefix, kebab-case | `use-mobile.ts` |
| Stores | `-store` suffix | `example-store.ts` |
| Types/Schemas | `types.ts` in model/ | `entities/user/model/types.ts` |
| DAL Queries | `queries.ts` in api/ | `entities/user/api/queries.ts` |
| DAL Mutations | `mutations.ts` in api/ | `entities/user/api/mutations.ts` |

## Import Aliases

Use `@/` to import from `src/`:

```typescript
// FSD layers
import { UserCard } from '@/layers/features/user-profile'
import { getUserById } from '@/layers/entities/user'
import { Button } from '@/layers/shared/ui'

// Core utilities
import { prisma } from '@/lib/prisma'  // Only in DAL!
import { cn } from '@/lib/utils'

// Environment
import { env } from '@/env'
```

## Component Organization

### Entity Components (`src/layers/entities/[entity]/ui/`)

Domain-specific UI representations:

```typescript
// entities/user/ui/UserAvatar.tsx
export function UserAvatar({ user }: { user: User }) {
  return <Avatar>{user.name?.charAt(0)}</Avatar>
}
```

### Feature Components (`src/layers/features/[feature]/ui/`)

Complete user-facing functionality:

```typescript
// features/user-profile/ui/UserCard.tsx
export function UserCard({ user }: Props) {
  // Combines entity data with feature-specific actions
}
```

### Widget Components (`src/layers/widgets/[widget]/ui/`)

Large compositions of multiple features:

```typescript
// widgets/app-sidebar/ui/AppSidebar.tsx
export function AppSidebar() {
  // Composes navigation and user controls
}
```

### Shared Components (`src/layers/shared/ui/`)

Reusable, domain-agnostic primitives (Shadcn components live here).

## Pages (`src/app/`)

Next.js App Router conventions:

| File | Purpose |
|------|---------|
| `page.tsx` | Page component |
| `layout.tsx` | Layout wrapper |
| `loading.tsx` | Loading UI (Suspense fallback) |
| `error.tsx` | Error boundary |
| `route.ts` | API route handler |
| `actions/` | Server actions directory |

## Data Access Layer (DAL)

All database operations go through entity `api/` directories:

```
entities/user/api/
├── queries.ts      # Read operations (getUserById, listUsers)
├── mutations.ts    # Write operations (createUser, updateUser)
└── index.ts        # Public exports
```

**Never import Prisma directly** from Server Components, Actions, or API Routes. Always go through DAL functions.
