# Next.js 16 Boilerplate

## Project Overview

A production-ready Next.js 16 boilerplate with modern tooling, type safety, and comprehensive developer experience.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.0 | React framework (App Router) |
| React | 19.2 | UI library |
| TypeScript | 5.9+ | Type safety |
| Tailwind CSS | 4.x | CSS-first styling |
| Shadcn UI + Base UI | Latest | Component library (via basecn) |
| BetterAuth | 1.x | Passwordless authentication (Email OTP) |
| Prisma | 7.x | Database ORM |
| TanStack Query | 5.90+ | Server state management |
| React Hook Form | 7.68+ | Form handling |
| Zod | 4.x | Schema validation |
| Zustand | 5.x | Client state management |
| Motion | 12.x | Animations |
| usehooks-ts | 3.x | React hooks collection |
| lodash-es | 4.17 | Utility functions |
| Knip | 5.x | Dead code detection |

## Directory Structure

```
src/
├── app/                 # Next.js App Router (FSD: app layer)
│   ├── api/            # API routes (webhooks, external integrations)
│   ├── globals.css     # Global styles with @theme
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── providers.tsx   # Client providers
├── layers/              # FSD architecture layers
│   ├── widgets/        # Large UI compositions
│   ├── features/       # Complete user-facing functionality
│   │   └── [feature]/
│   │       ├── ui/     # React components
│   │       ├── model/  # Business logic, hooks, types
│   │       ├── api/    # Server actions
│   │       └── index.ts
│   ├── entities/       # Business domain objects
│   │   └── [entity]/
│   │       ├── ui/     # Entity UI components
│   │       ├── model/  # Types, Zod schemas
│   │       ├── api/    # DAL: queries.ts, mutations.ts
│   │       └── index.ts
│   └── shared/         # Reusable utilities, UI primitives
│       ├── ui/         # Shadcn components
│       ├── api/        # Auth utilities (getCurrentUser, requireAuth)
│       └── lib/        # Utilities (cn, query-client)
├── generated/          # Auto-generated (Prisma)
├── lib/                # Low-level utilities
│   └── prisma.ts      # Prisma singleton (only imported by DAL)
└── env.ts              # T3 Env configuration
```

### Layer Dependency Rules

```
app → widgets → features → entities → shared
```

- Higher layers can import from lower layers
- Never import upward or across same-level modules
- All Prisma imports confined to `entities/*/api/` and `shared/api/`

## Common Commands

```bash
pnpm dev              # Start dev server with Turbopack (logs to .logs/)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript type checking
pnpm knip             # Find unused code, dependencies, exports
pnpm knip:fix         # Auto-fix unused exports and dependencies
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:studio    # Open Prisma Studio
```

## Dev Server Logs

The dev server outputs logs to `.logs/` with timestamped filenames for debugging and monitoring.

| Item | Value |
|------|-------|
| Location | `.logs/` |
| Format | `YYYY-MM-DD_HH-MM-SS.log` |
| Latest log | `ls -t .logs/ \| head -1` |

**When to check logs:**
- Debugging server errors or unexpected behavior
- Monitoring API route performance
- Investigating database connection problems
- Reviewing request/response cycles

**Quick commands:**
```bash
# View latest log
cat ".logs/$(ls -t .logs/ | head -1)"

# Tail latest log (follow new output)
tail -f ".logs/$(ls -t .logs/ | head -1)"

# Search logs for errors
grep -i error .logs/*.log
```

## Dead Code Detection (Knip)

Knip finds unused files, dependencies, and exports. Configuration is in `knip.config.ts`.

### Quick Commands

```bash
pnpm knip           # Check for issues (no changes)
pnpm knip:fix       # Auto-fix unused exports and dependencies
/app:cleanup        # Full cleanup workflow with Claude Code
```

### Boilerplate Pattern

This project uses an "add-on-demand" pattern:
- Shadcn UI components are pre-installed but ignored in Knip config
- As components are used, remove them from the ignore list
- This allows Knip to catch genuinely unused components

### Adding Exceptions

To keep intentionally unused code:

```typescript
// In knip.config.ts
ignore: [
  'src/components/ui/**',  // Component library
  'src/path/to/file.ts',   // Specific file with reason
]

ignoreDependencies: [
  'package-name',  // Loaded via non-standard means (CSS, config)
]
```

### When to Run

- Before dependency upgrades (`/app:upgrade`)
- Monthly maintenance
- Before major releases
- After removing features

## Breaking Changes Notes

### Next.js 16

1. **Async Request APIs** - `params`, `searchParams`, `cookies()`, `headers()` are now async:
   ```typescript
   // Must use await
   export default async function Page(props) {
     const params = await props.params
     const searchParams = await props.searchParams
   }
   ```

2. **Middleware renamed to Proxy** - If using middleware, rename `middleware.ts` → `proxy.ts`

3. **Minimum Requirements** - Node.js 20.9+, TypeScript 5.1+

### Tailwind CSS v4

1. **CSS-first configuration** - No `tailwind.config.js`, use `@theme` directive in CSS
2. **Import syntax** - Use `@import 'tailwindcss'` (single line)
3. **PostCSS plugin** - Use `@tailwindcss/postcss` package

### Prisma 7

1. **New generator** - Use `provider = "prisma-client"` (not `prisma-client-js`)
2. **Required output** - Must specify `output = "../src/generated/prisma"`
3. **Import path** - Import from `@/generated/prisma` (not `@prisma/client`)

## Library Documentation (Context7)

When working with external libraries, use Context7 MCP tools for up-to-date documentation. This prevents using outdated patterns from training data.

### When to Use

- Implementing features with library APIs you're uncertain about
- Debugging library-specific issues
- Working with recently-updated libraries (Next.js 16, Prisma 7, Zod 4, TanStack Query 5, etc.)
- Before making assumptions about current API patterns

### Workflow

1. **Check installed version**: `grep '"[library]"' package.json`
2. **Resolve library ID**: `mcp__context7__resolve-library-id: { libraryName: "[library]" }`
3. **Fetch focused docs**: `mcp__context7__get-library-docs` with specific `topic`

### Token Efficiency

Always use the `topic` parameter to request specific information — avoid broad requests:

| Instead of | Request |
|------------|---------|
| "All Prisma docs" | `topic: "findMany with relations and filtering"` |
| "TanStack Query documentation" | `topic: "useMutation with optimistic updates"` |
| "Next.js 16 features" | `topic: "async params in page components"` |
| "Zod validation" | `topic: "discriminatedUnion for form schemas"` |

### Example

```
# 1. Check version
grep '"prisma"' package.json
# Output: "prisma": "^7.0.0"

# 2. Resolve library
mcp__context7__resolve-library-id: { libraryName: "prisma" }

# 3. Fetch focused docs
mcp__context7__get-library-docs: {
  context7CompatibleLibraryID: "/prisma/prisma",
  topic: "findMany with include and where clauses"
}
```

## Base UI (Component Primitives)

This project uses **Base UI** (via [basecn](https://basecn.dev)) instead of Radix UI for component primitives. Base UI is maintained by the team behind Material UI and offers modern, accessible components.

### Key Differences from Radix UI

| Pattern | Radix UI | Base UI |
|---------|----------|---------|
| Composition | `asChild` prop | `render` prop |
| Package | Multiple `@radix-ui/*` packages | Single `@base-ui/react` |
| Positioning | Direct props on Content | `Positioner` wrapper component |

### Composition Pattern

```tsx
// OLD (Radix): asChild pattern
<Button asChild>
  <Link href="/contact">Contact</Link>
</Button>

// NEW (Base UI): render prop pattern
// Use nativeButton={false} when replacing button with non-button element
<Button render={<Link href="/contact" />} nativeButton={false}>
  Contact
</Button>
```

### Registry Configuration

The basecn registry is configured in `components.json`:

```json
{
  "registries": {
    "@basecn": "https://basecn.dev/r/{name}.json"
  }
}
```

Install new components with: `npx shadcn@latest add @basecn/<component>`

### Turbopack + pnpm Compatibility

Base UI requires `transpilePackages` in `next.config.ts` for Turbopack + pnpm to resolve symlinked dependencies correctly:

```typescript
const nextConfig: NextConfig = {
  transpilePackages: ['@base-ui/react', '@base-ui/utils'],
}
```

**Without this configuration:** Runtime 500 error with "Element type is invalid... got: undefined" because Turbopack can't resolve `@base-ui/utils` through pnpm's symlinked `node_modules`.

## Code Conventions

- **Components**: PascalCase (`ExampleForm.tsx`)
- **Files**: kebab-case (`example-store.ts`)
- **Imports**: Use `@/` path alias
- **State**: Use Zustand for complex client state, TanStack Query for server state
- **Forms**: Use React Hook Form + Zod + Shadcn Form components
- **Styling**: Use Tailwind classes, cn() for conditional classes

## Calculation Rules

**Never perform mental math.** All calculations must be executed via code to ensure accuracy and provide verifiable results.

| Calculation Type | Approach |
|-----------------|----------|
| Simple (one expression) | Inline: `node -e "console.log(47 * 83)"` or `python3 -c "print(47 * 83)"` |
| Complex (multi-step) | Create script in `.temp/` folder, execute, then delete |

**Examples:**

```bash
# Simple calculation
node -e "console.log('Result:', 1234 * 5678)"

# Percentage
python3 -c "print(f'15% of 847 = {847 * 0.15}')"

# Complex (compound interest) - use .temp/ file
# 1. Create .temp/calc.js with the calculation
# 2. Run: node .temp/calc.js
# 3. Delete file when done
```

**Why this matters:**
- LLMs can make arithmetic errors when reasoning through calculations
- Code execution provides verifiable, reproducible results
- The `.temp/` folder is gitignored, keeping the repo clean

## Developer Guides

Detailed implementation patterns live in `developer-guides/`:

| Guide | Content |
|-------|---------|
| `INDEX.md` | **Coverage map** — maps code areas to guides, tracks last-reviewed dates |
| `01-project-structure.md` | FSD architecture, file naming, directory layout |
| `02-environment-variables.md` | T3 Env configuration, adding new variables |
| `03-database-prisma.md` | Prisma 7, DAL patterns, naming conventions |
| `04-forms-validation.md` | React Hook Form + Zod + Shadcn Form |
| `05-data-fetching.md` | TanStack Query patterns, mutations |
| `06-state-management.md` | Zustand vs TanStack Query decision guide |
| `07-animations.md` | Motion library patterns |
| `08-styling-theming.md` | Tailwind v4, dark mode, Shadcn |

### Keeping Guides Up to Date

The harness includes automatic documentation drift detection:

| Mechanism | When | What It Does |
|-----------|------|--------------|
| `/spec:execute` completion | After implementation | Suggests doc review if changed files touch guide areas |
| `check-docs-changed` hook | Session end | Reminds about potentially affected guides |
| `/docs:reconcile` | On demand | Analyzes commits against guide coverage, suggests updates |

Run `/docs:reconcile` periodically or when the session-end hook flags potential drift.

## Design System: Calm Tech

Our interfaces follow the **"Calm Tech"** design language — sophisticated, spacious, effortless.

### Core Principles

1. **Clarity over decoration** — Every element earns its place
2. **Soft depth over flat** — Subtle shadows create hierarchy
3. **Generous space** — Breathing room makes content shine
4. **Micro-delight** — Thoughtful, restrained animations

### Quick Reference

| Element | Specification |
|---------|---------------|
| **Fonts** | Geist Sans (UI), Geist Mono (code) |
| **Colors** | OKLCH tokens — never pure black/white |
| **Card radius** | 16px (`rounded-xl`) |
| **Button/Input radius** | 10px (`rounded-md`) |
| **Button height** | 40px default |
| **Card padding** | 24px (`p-6`) |
| **Animation duration** | 100-300ms (fast to slower) |

### Custom Utilities

```tsx
// Shadows
shadow-soft, shadow-elevated, shadow-floating, shadow-modal

// Glass effects
glass, glass-card

// Containers
container-narrow (42rem), container-default (56rem), container-wide (72rem)

// Interactive
card-interactive, focus-ring
```

### Documentation

| Resource | Content |
|----------|---------|
| `docs/DESIGN_SYSTEM.md` | Complete design language |
| `developer-guides/08-styling-theming.md` | Styling patterns |
| `developer-guides/07-animations.md` | Animation patterns |
| `src/app/globals.css` | Implemented tokens |

## Server Actions vs API Routes

### Decision Rule

> "Will anything outside my Next.js app need to call this?"
> **Yes → API Route** | **No → Server Action**

### Use Server Actions When

| Scenario | Why |
|----------|-----|
| Form submissions | Progressive enhancement, built-in CSRF protection |
| Database mutations from UI | Tight coupling with component, type-safe |
| User settings updates | Read-your-writes with `updateTag` (Next.js 16) |
| Like/vote buttons | Simple mutation, optimistic UI support |

```typescript
// app/actions/post.ts
'use server'

import { postSchema } from '@/schemas/post'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const validated = postSchema.parse(Object.fromEntries(formData))
  await prisma.post.create({ data: validated })
  revalidatePath('/posts')
}
```

### Use API Routes (Route Handlers) When

| Scenario | Why |
|----------|-----|
| Webhooks (Stripe, GitHub) | External services cannot call Server Actions |
| Mobile app backends | External client needs HTTP endpoint |
| Third-party integrations | HTTP access required |
| Client data fetching | GET requests can be cached |
| Streaming responses | Server Actions don't support streaming |

```typescript
// app/api/posts/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const validated = postSchema.parse(body)
  const post = await prisma.post.create({ data: validated })
  return Response.json(post, { status: 201 })
}
```

### Key Limitations of Server Actions

| Limitation | Implication |
|------------|-------------|
| POST-only | Cannot use for GET/cacheable requests |
| No external access | Webhooks/mobile apps need Route Handlers |
| Sequential execution | Multiple actions queue, don't parallelize |
| No streaming | Use Route Handlers for SSE/streaming |
| 1MB body limit | Large file uploads need Route Handlers |

### Security Requirements (Both Approaches)

1. **Always validate with Zod** - TypeScript types are NOT enforced at runtime
2. **Re-authorize every request** - Never trust client data
3. **Use Data Access Layer** - All database access through entity `api/` segments

### Data Fetching Pattern

```
Server Component (default) → Entity DAL functions (entities/[name]/api/)
Client Component + dynamic data → TanStack Query + API Route (GET)
Mutation from Client Component → Server Action → Entity DAL function
```

## Data Access Layer (DAL)

All database operations MUST go through a centralized data access layer. **Never call Prisma directly** from Server Components, Server Actions, or API Routes.

### Architecture (FSD-Aligned)

Data access lives in the `api/` segment within each entity:

```
src/layers/
├── entities/
│   ├── user/
│   │   ├── api/
│   │   │   ├── queries.ts      # Read operations (getUser, listUsers)
│   │   │   ├── mutations.ts    # Write operations (createUser, updateUser)
│   │   │   └── index.ts        # Public API exports
│   │   ├── model/
│   │   │   └── types.ts        # User types, Zod schemas
│   │   └── index.ts
│   ├── post/
│   │   ├── api/
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   └── ...
│   └── ...
└── shared/
    └── api/
        ├── auth.ts             # getCurrentUser, requireAuth
        └── errors.ts           # DAL error types
```

### DAL Function Requirements

Every DAL function MUST:

1. **Accept validated input** - Caller validates with Zod before calling
2. **Enforce authorization** - Check user permissions before data access
3. **Return typed data** - Use explicit return types
4. **Handle errors consistently** - Throw typed errors, never return null for auth failures

```typescript
// entities/post/api/queries.ts
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/layers/shared/api/auth'
import type { Post } from '../model/types'

export async function getPostById(id: number): Promise<Post | null> {
  const user = await getCurrentUser()

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true }
  })

  if (!post) return null

  // Enforce visibility rules
  if (post.isPrivate && post.authorId !== user?.id) {
    throw new UnauthorizedError('Cannot view private post')
  }

  return post
}

export async function listPostsByAuthor(authorId: number): Promise<Post[]> {
  const user = await getCurrentUser()

  return prisma.post.findMany({
    where: {
      authorId,
      // Only show private posts to the author
      ...(user?.id !== authorId && { isPrivate: false })
    },
    orderBy: { createdAt: 'desc' }
  })
}
```

```typescript
// entities/post/api/mutations.ts
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/layers/shared/api/auth'
import type { CreatePostInput, UpdatePostInput, Post } from '../model/types'

export async function createPost(data: CreatePostInput): Promise<Post> {
  const user = await requireAuth()

  return prisma.post.create({
    data: {
      ...data,
      authorId: user.id
    }
  })
}

export async function updatePost(id: number, data: UpdatePostInput): Promise<Post> {
  const user = await requireAuth()

  const post = await prisma.post.findUnique({ where: { id } })

  if (!post) {
    throw new NotFoundError('Post not found')
  }

  if (post.authorId !== user.id) {
    throw new UnauthorizedError('Cannot update post you do not own')
  }

  return prisma.post.update({
    where: { id },
    data
  })
}

export async function deletePost(id: number): Promise<void> {
  const user = await requireAuth()

  const post = await prisma.post.findUnique({ where: { id } })

  if (!post) {
    throw new NotFoundError('Post not found')
  }

  if (post.authorId !== user.id && !user.isAdmin) {
    throw new UnauthorizedError('Cannot delete post you do not own')
  }

  await prisma.post.delete({ where: { id } })
}
```

### Shared Auth Utilities

```typescript
// shared/api/auth.ts
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { User } from '@/layers/entities/user'

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  })

  return session?.user ?? null
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  return user
}
```

### Using DAL in Server Actions

```typescript
// app/actions/post.ts
'use server'

import { postSchema } from '@/layers/entities/post/model/types'
import { createPost, updatePost, deletePost } from '@/layers/entities/post'
import { revalidatePath } from 'next/cache'

export async function createPostAction(formData: FormData) {
  // 1. Validate input
  const validated = postSchema.parse(Object.fromEntries(formData))

  // 2. Call DAL (handles auth internally)
  const post = await createPost(validated)

  // 3. Revalidate cache
  revalidatePath('/posts')

  return post
}
```

### Using DAL in Server Components

```typescript
// app/posts/[id]/page.tsx
import { getPostById } from '@/layers/entities/post'
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(parseInt(id, 10))

  if (!post) notFound()

  return <PostView post={post} />
}
```

### DAL Rules Summary

| Rule | Reason |
|------|--------|
| Never import `prisma` outside DAL | Centralizes data access, enforces auth |
| One entity = one api/ directory | FSD alignment, clear ownership |
| Auth checks in every function | Defense in depth, no assumptions |
| Throw errors, don't return null for auth | Distinguishes "not found" from "not allowed" |
| Export via entity index.ts | Clean public API, encapsulation |

**Sources**: [Next.js Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations), [Next.js Security Guide](https://nextjs.org/blog/security-nextjs-server-components-actions)

## Environment Variables

- Server-only variables: `DATABASE_URL`, `NODE_ENV`
- Client variables: Must prefix with `NEXT_PUBLIC_`
- Validation: T3 Env validates at build time
- Configuration: See `src/env.ts`

## Database

- **Local development**: SQLite (file-based, zero setup)
- **Production**: Migrate to PostgreSQL (see migration guide below)
- Database file: `.data/dev.db` (gitignored, follows `.logs/` and `.temp/` pattern)
- Singleton pattern in `src/lib/prisma.ts`
- **Naming convention**: Models use `@@map("snake_case")`, fields use `@map("snake_case")` — see `developer-guides/03-database-prisma.md`

### Migrating to PostgreSQL

When deploying to production, update the database provider:

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update `.env` with PostgreSQL URL:**
   ```
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

3. **Regenerate and migrate:**
   ```bash
   pnpm prisma:generate
   pnpm prisma db push  # or prisma migrate dev
   ```

**Note**: SQLite doesn't support native enums (stored as TEXT). If using enums, test thoroughly after migrating to PostgreSQL.

### MCP Database Server (Development Only)

Direct database access is available via MCP tools for debugging and verification. This is **development-only** and requires explicit enablement.

**Setup**: Add `MCP_DEV_ONLY_DB_ACCESS=true` to `.env.local`

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `mcp__mcp-dev-db__health` | Check database connectivity | Verifying MCP server is available |
| `mcp__mcp-dev-db__get_schema_overview` | List all tables with structure | Understanding schema, verifying migrations |
| `mcp__mcp-dev-db__get_table_details` | Detailed table info with sample data | Inspecting specific table structure |
| `mcp__mcp-dev-db__execute_sql_select` | Run SELECT queries | Verifying data state, debugging |
| `mcp__mcp-dev-db__execute_sql_mutation` | Run INSERT/UPDATE/DELETE | Fixing data issues (requires reason) |
| `mcp__mcp-dev-db__explain_query` | Get query execution plan | Performance analysis |
| `mcp__mcp-dev-db__validate_sql` | Validate SQL syntax | Testing queries before execution |

**Security**: Dev-only, localhost-only, blocks DDL (CREATE/DROP/ALTER), requires explicit env var.

**Use Cases**:
- Verify data exists after mutations
- Debug "data not showing" issues by checking actual DB state
- Validate foreign key relationships
- Test raw SQL queries before implementing in DAL
- Analyze query performance with EXPLAIN

## Authentication

This project uses **BetterAuth** with Email OTP (passwordless) authentication. Users sign in by entering their email, receiving a 6-digit code, and verifying it to create a session.

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Server-side BetterAuth configuration |
| `src/lib/auth-client.ts` | Client-side auth utilities (`useSession`, `authClient`) |
| `src/layers/shared/api/auth.ts` | Auth utilities for DAL and server components |
| `src/layers/features/auth/` | Auth UI components (SignInForm, OtpVerifyForm, SignOutButton) |
| `src/app/(authenticated)/` | Protected route group |

### Auth Utilities

| Function | Returns | Use Case |
|----------|---------|----------|
| `getCurrentUser()` | `User \| null` | Check if user is authenticated |
| `requireAuth()` | `User` | DAL functions - throws if not authenticated |
| `requireAuthOrRedirect()` | `Session` | Server components - redirects to `/sign-in` |
| `getSession()` | `Session \| null` | Get full session with metadata |

### Route Protection

Protected pages use the `(authenticated)/` route group with a layout that calls `requireAuthOrRedirect()`. Unauthenticated users are redirected to `/sign-in`.

```typescript
// src/app/(authenticated)/layout.tsx
import { requireAuthOrRedirect } from '@/layers/shared/api/auth'

export default async function AuthenticatedLayout({ children }) {
  await requireAuthOrRedirect() // Redirects if not authenticated
  return <>{children}</>
}
```

### Client-Side Auth

```typescript
'use client'
import { useSession, authClient } from '@/lib/auth-client'

function MyComponent() {
  const { data: session, isPending } = useSession()

  // Sign out
  await authClient.signOut()
}
```

### Configuration

- **Session duration**: 7 days with automatic refresh
- **OTP settings**: 6 digits, 5-minute expiry
- **Email delivery**: Console logging in development (swap for Resend in production)

See `developer-guides/09-authentication.md` for complete documentation.

## Claude Code Customization

### Agents (use proactively for specialized tasks)

**Built-in agents** (provided by Claude Code):

| Agent | Trigger | Use For |
|-------|---------|---------|
| `claude-code-guide` | Claude Code questions | Official docs for CLI features, hooks, skills, MCP, Agent SDK |
| `Explore` | Codebase understanding | Answer questions about how code works, find patterns, explore architecture |

**Explore vs code-search:**

| Use Case | Agent | Why |
|----------|-------|-----|
| "How does authentication work?" | `Explore` | Need explanation and understanding |
| "Find all files using Prisma" | `code-search` | Need file list for refactoring |
| Open-ended exploration | `Explore` | Comprehensive answers, configurable thoroughness |
| Specific file/pattern lookup | `code-search` | Fast, focused, returns paths only |

**Custom agents** (defined in `.claude/agents/`):

| Agent | Trigger | Use For |
|-------|---------|---------|
| `prisma-expert` | Database work | Schema design, migrations, queries, Neon integration |
| `react-tanstack-expert` | React/data fetching | Server/client components, TanStack Query, state |
| `zod-forms-expert` | Forms | Zod schemas, React Hook Form, Shadcn Form |
| `typescript-expert` | Type issues | Complex types, build errors, TypeScript patterns |
| `code-search` | Finding files | Locate files by pattern, function, or content |
| `research-expert` | Web research | General web research (non-Claude Code topics) |
| `product-manager` | Product decisions | Roadmap planning, feature prioritization, scope management |

**Documentation Lookup Priority:**
- **Claude Code topics** (hooks, skills, commands, agents, MCP) → Use `claude-code-guide`
- **General web research** (libraries, APIs, patterns) → Use `research-expert`

### Skills (applied automatically when relevant)

| Skill | Applies When |
|-------|--------------|
| `proactive-clarification` | Vague requests — analyze gaps, ask questions user didn't know to ask |
| `designing-frontend` | Design thinking — hierarchy, component decisions, Calm Tech philosophy |
| `styling-with-tailwind-shadcn` | Implementation — Tailwind classes, theming, component specs |
| `organizing-fsd-architecture` | Feature structure, layer organization |
| `debugging-systematically` | Investigating bugs — methodology, patterns, troubleshooting |
| `working-with-prisma` | Database work — schema design, DAL patterns, queries |
| `managing-roadmap-moscow` | Roadmap work — MoSCoW prioritization, roadmap utilities |

### Path-Specific Rules

Contextual rules that apply when working with specific file patterns. Rules are defined in `.claude/rules/` with YAML frontmatter specifying which paths trigger them.

| Rule File | Applies To | Content |
|-----------|------------|---------|
| `api.md` | `src/app/api/**/*.ts` | API route handlers — validation, error handling, DAL usage |
| `dal.md` | `src/layers/entities/*/api/**/*.ts`, `src/layers/shared/api/**/*.ts` | DAL functions — auth checks, query/mutation patterns |
| `security.md` | `**/auth/**`, `**/login/**`, `**/session/**`, `**/password/**`, `**/token/**` | Security-critical code — no sensitive logging, hashing, session validation |
| `testing.md` | `__tests__/**/*.ts`, `__tests__/**/*.tsx` | Test patterns — Vitest setup, mocking, component testing |
| `components.md` | `src/components/**/*.tsx`, `src/layers/**/ui/**/*.tsx` | UI components — Shadcn patterns, accessibility, styling |

**How it works:**
- Rules are automatically injected when you read/edit matching files
- Each rule file has a `paths:` frontmatter with glob patterns
- Multiple rules can apply to the same file
- Rules provide context-specific guidance without cluttering global CLAUDE.md

**Example rule structure:**
```markdown
---
paths: src/app/api/**/*.ts
---

# API Route Handler Rules

[Context-specific patterns and requirements...]
```

**When to create a new rule:**
- Guidelines apply ONLY to specific file types (not project-wide)
- Content would clutter CLAUDE.md but is important for those files
- Different file types need different patterns

**Managing rules:**
- Create: `/system:update add a rule for [file type] that [description]`
- Review: `/system:review rules` — audits all rules for consistency
- Update: Edit `.claude/rules/[name].md` directly, then run `/system:review rules`

**Rule vs CLAUDE.md vs Skill:**
| Content Type | Where to Put It |
|--------------|-----------------|
| Applies to specific file paths | Rule (`.claude/rules/`) |
| Applies to all project code | CLAUDE.md |
| Reusable expertise across projects | Skill (`.claude/skills/`) |

### Commands

#### Development

| Command | Purpose |
|---------|---------|
| `/dev:scaffold <name>` | Create new feature with page, components, schema |
| `/db:migrate` | Apply pending Prisma migrations safely |
| `/db:studio` | Open Prisma Studio to explore the database |

#### Application

| Command | Purpose |
|---------|---------|
| `/app:upgrade [mode] [flags]` | Comprehensive dependency upgrade with security audit, prioritization, and validation |
| `/app:cleanup [mode] [flags]` | Codebase cleanup using Knip for dead code, unused dependencies, and exports |

#### Git

| Command | Purpose |
|---------|---------|
| `/git:commit` | Stage, validate (lint + typecheck), and commit changes |
| `/git:push` | Validate (lint + typecheck + build), then push to remote |

#### Ideation & Specs

| Command | Purpose |
|---------|---------|
| `/ideate <task>` | Structured ideation for features/fixes |
| `/ideate-to-spec <path>` | Transform ideation document into validated spec |
| `/spec:create <desc>` | Generate implementation specification |
| `/spec:decompose <path>` | Break down spec into actionable tasks |
| `/spec:execute <path>` | Implement a validated specification |
| `/spec:feedback <path>` | Process post-implementation feedback |
| `/spec:doc-update <path>` | Review docs for updates after spec |
| `/spec:migrate` | Migrate existing specs to feature directories |

#### System

| Command | Purpose |
|---------|---------|
| `/system:ask [question]` | Ask how to do something in this repository |
| `/system:review [area]` | Review processes for clarity and improvements |
| `/system:update [desc]` | Add, update, or improve system processes |
| `/system:learn [topic]` | Learn new capabilities through experimentation, then codify |

#### Roadmap

| Command | Purpose |
|---------|---------|
| `/roadmap:show` | Display roadmap summary |
| `/roadmap:open` | Start server and open visualization in browser |
| `/roadmap:close` | Stop the visualization server |
| `/roadmap:status` | Check if visualization server is running |
| `/roadmap:add <title>` | Add a new roadmap item |
| `/roadmap:prioritize` | Get prioritization suggestions |
| `/roadmap:analyze` | Full health check and analysis |
| `/roadmap:validate` | Validate roadmap JSON structure |
| `/roadmap:enrich <item>` | Add ideationContext for richer prompts |

#### Review

| Command | Purpose |
|---------|---------|
| `/review-recent-work` | Trace through recent implementations to verify correctness |

#### Documentation

| Command | Purpose |
|---------|---------|
| `/docs:reconcile` | Check developer guides for drift against recent commits |

#### Debug

| Command | Purpose |
|---------|---------|
| `/debug:browser [issue] [--url <url>]` | Debug and fix browser issues (visual, interaction, data, responsive) |
| `/debug:types [file-or-error]` | Debug TypeScript type errors with systematic analysis |
| `/debug:test [test-path]` | Debug failing tests using self-debugging methodology |
| `/debug:api [endpoint] [--url <url>]` | Debug API/data flow through Component → Query → Action → DAL → Prisma |
| `/debug:data [table-or-query]` | Inspect database schema and data directly via MCP tools |
| `/debug:logs [search-term] [--tail <n>]` | Analyze server logs from `.logs/` for errors and issues |
| `/debug:rubber-duck [problem]` | Structured problem articulation using rubber duck methodology |
| `/debug:performance [area] [--url <url>]` | Diagnose slow renders, bundle size, N+1 queries, memory leaks |

#### Claude Code Configuration

| Command | Purpose |
|---------|---------|
| `/cc:notify:on` | Enable notification sound when Claude finishes responding |
| `/cc:notify:off` | Disable notification sound when Claude finishes responding |
| `/cc:notify:status` | Show notification sound status at user and project levels |
| `/cc:ide:set <color>` | Set VS Code color scheme from a seed color (hex, rgb, name) |
| `/cc:ide:reset` | Remove custom VS Code color scheme |

### Roadmap-Claude Code Integration

The roadmap system integrates with the spec workflow for seamless transitions from planning to implementation.

#### Workflow: Roadmap Item → Implementation

```
1. /roadmap:open           # Start server and open HTML visualization
2. Click "Start Ideation"  # Copies /ideate --roadmap-id <uuid> command
3. Paste in terminal       # Status → in-progress, creates spec
4. /ideate-to-spec         # Transform to specification
5. /spec:execute           # Implement; status → completed on finish
6. /roadmap:close          # Stop the server when done
```

#### Key Commands with Roadmap Integration

| Command | Roadmap Behavior |
|---------|------------------|
| `/ideate --roadmap-id <uuid>` | Links spec to roadmap item, sets status to in-progress |
| `/ideate --roadmap-item "title"` | Finds item by title, same as above |
| `/roadmap:enrich <item>` | Adds ideationContext for richer prompts |
| `/spec:execute` | Sets status to completed when all tasks done |

#### Utility Scripts

```bash
# Update item status
python3 roadmap/scripts/update_status.py <item-id> <status>

# Link spec to item
python3 roadmap/scripts/link_spec.py <item-id> <spec-slug>

# Backfill all specs (fix missing linkedArtifacts)
python3 roadmap/scripts/link_all_specs.py [--dry-run]

# Generate slug from title
python3 roadmap/scripts/slugify.py <title-or-item-id>

# Find item by title
python3 roadmap/scripts/find_by_title.py "<title-query>"
```

#### Best Practices

- Always use `--roadmap-id` when starting work on a roadmap item
- Check `linkedArtifacts` before creating new specs (avoid duplicates)
- Use `/roadmap enrich` to populate context before ideation
- Run `/roadmap validate` after manual edits to roadmap.json

### Background Agents (async execution)

Agents can run in the background using `run_in_background: true` on the Task tool, allowing the main conversation to continue while agents work.

**When to use background agents:**

| Scenario | Why Background? |
|----------|-----------------|
| Research while implementing | Research doesn't block coding |
| Parallel analysis | Multiple reviewers work simultaneously |
| Long-running tasks | Test suites, builds, documentation generation |
| Multi-agent orchestration | Start all agents, continue with prep work |

**Syntax:**
```
# Launch background agent
Task(
  description="Research patterns",
  prompt="...",
  subagent_type="research-expert",
  run_in_background=true
)
# Returns task_id immediately

# Retrieve results later
TaskOutput(task_id="<task-id>", block=true)
```

**Key patterns:**
- Use `run_in_background: true` for tasks that don't need immediate results
- Use `TaskOutput` with `block: true` to wait for completion
- Use `TaskOutput` with `block: false` to check status without waiting
- Background agents have isolated context (by design)

**Commands using background agents:**
- `/spec:execute` — Implementation agents run in background
- `/ideate` — Research runs in background while drafting

### Hooks (automatic validation)

- **PreToolUse**: File guard protection
- **PostToolUse**: Typecheck, lint, check-any, test changed files
- **UserPromptSubmit**: Adjust thinking level
- **Stop**: Create checkpoint, check todos

### Plan Mode Behavior

When entering plan mode (via `EnterPlanMode` tool), follow this enhanced workflow that incorporates proactive clarification:

#### Phase 1: Clarifying Questions (Before Exploration)

**Before exploring the codebase**, apply the `proactive-clarification` skill:

1. **Analyze the request** for gaps, ambiguities, and unstated assumptions
2. **Identify what's missing** that would change your approach:
   - Unclear scope boundaries
   - Missing acceptance criteria
   - Ambiguous requirements
   - Hidden complexity signals ("just", "simple", "quick")
3. **Ask 2-4 high-impact questions** using `AskUserQuestion`:
   - Focus on questions that would change your implementation plan
   - Suggest reasonable defaults when possible
   - Explain why each question matters
4. **Skip this phase** only if the request is genuinely clear and complete

**Example flow:**
```
User: "Add user notifications"

Before exploring, ask:
1. What events should trigger notifications? (new message, mention, system alerts?)
2. Delivery channels: in-app only, or also email/push?
3. Should users be able to configure notification preferences?

Then proceed to exploration with clear requirements.
```

#### Phase 2: Codebase Exploration

With clarified requirements, explore thoroughly:
- Use Glob, Grep, Read to understand existing patterns
- Identify files that will be affected
- Note existing conventions to follow
- Map dependencies and potential blast radius

#### Phase 3: Design & Present Plan

Present your implementation approach:
- Reference the clarified requirements from Phase 1
- Show how your plan addresses each requirement
- Identify any new questions that emerged during exploration
- Propose alternatives if trade-offs exist

#### When to Skip Phase 1

Skip clarifying questions when:
- User provided detailed requirements with clear acceptance criteria
- Request is a well-defined bug fix with reproduction steps
- Task is purely exploratory ("how does X work?")
- User explicitly said "just explore, I'll clarify later"

#### Integration with Existing Workflows

Plan mode with clarification works well before:
- `/ideate` — Ensures ideation starts with clear scope
- `/spec:create` — Produces better specifications
- Major refactoring — Surfaces constraints early
