# Database & Prisma Guide

## Prisma 7 Configuration

This project uses **Prisma 7** with the Rust-free client engine for smaller bundles.

### Required Files

Prisma 7 requires a `prisma.config.ts` file in your **project root** (not in `prisma/`):

```typescript
// prisma.config.ts (in project root)
import 'dotenv/config'  // Required to load .env
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
})
```

### Schema Configuration

The schema file at `prisma/schema.prisma`:

```prisma
generator client {
  provider   = "prisma-client"           // NOT "prisma-client-js"
  output     = "../src/generated/prisma" // Required in Prisma 7
  engineType = "client"                  // Rust-free client
}

datasource db {
  provider = "postgresql"
  // Note: url/directUrl are configured in prisma.config.ts, NOT here
}
```

**Key Prisma 7 changes:**
- `provider = "prisma-client"` (not `prisma-client-js`)
- `output` is required (no default location)
- `engineType = "client"` for smaller bundles
- Database URL configured in `prisma.config.ts`, not in schema

### Import Path

```typescript
// ✅ Correct for Prisma 7
import { PrismaClient } from '@/generated/prisma'

// ❌ Wrong - old Prisma 6 pattern
import { PrismaClient } from '@prisma/client'
```

## Database Connection

Configure `DATABASE_URL` in your `.env` file:

```bash
# Local Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp"

# Neon.tech (production) - pooled connection
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

## Singleton Pattern

The Prisma client uses a singleton pattern to prevent connection exhaustion:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Important:** This file should ONLY be imported by DAL functions in `entities/*/api/`.

## Naming Conventions (Snake Case)

PostgreSQL works best with lowercase snake_case identifiers. We use Prisma's `@map` and `@@map` attributes to maintain idiomatic naming in both layers:

| Layer | Convention | Example |
|-------|------------|---------|
| Prisma models | PascalCase | `BlogPost` |
| Prisma fields | camelCase | `authorId` |
| PostgreSQL tables | snake_case | `blog_posts` |
| PostgreSQL columns | snake_case | `author_id` |

### Model Mapping Example

```prisma
model BlogPost {
  id          String   @id @default(cuid())
  authorId    String   @map("author_id")
  title       String
  publishedAt DateTime? @map("published_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id])

  @@map("blog_posts")
}

enum PostStatus {
  DRAFT     @map("draft")
  PUBLISHED @map("published")
  ARCHIVED  @map("archived")
}
```

### Mapping Rules

1. **Every model** gets `@@map("snake_case_plural")` at the end
   - `User` → `@@map("users")`
   - `BlogPost` → `@@map("blog_posts")`
   - `Comment` → `@@map("comments")`

2. **Multi-word fields** get `@map("snake_case")`
   - `authorId` → `@map("author_id")`
   - `createdAt` → `@map("created_at")`
   - `publishedAt` → `@map("published_at")`

3. **Skip `@map`** for single-word lowercase fields
   - `id`, `name`, `email`, `title` — no mapping needed

4. **Enum values** use `@map` to lowercase them
   - `ACTIVE` → `@map("active")`
   - `PENDING_EXPIRATION` → `@map("pending_expiration")`

## Data Access Layer (DAL)

**All Prisma operations must go through the DAL.** Never import Prisma directly in Server Components, Actions, or API Routes.

### DAL Structure (per entity)

```
src/layers/entities/user/
├── api/
│   ├── queries.ts      # Read operations
│   ├── mutations.ts    # Write operations
│   └── index.ts        # Re-exports
├── model/
│   └── types.ts        # Zod schemas, TypeScript types
└── index.ts            # Public API
```

### Query Pattern

```typescript
// entities/user/api/queries.ts
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/layers/shared/api/auth'

export async function getUserById(id: string) {
  const currentUser = await getCurrentUser()

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true }
  })

  if (!user) return null

  // Enforce authorization
  if (user.id !== currentUser?.id && !currentUser?.isAdmin) {
    throw new Error('Unauthorized')
  }

  return user
}
```

### Mutation Pattern

```typescript
// entities/user/api/mutations.ts
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/layers/shared/api/auth'
import type { CreateUserInput } from '../model/types'

export async function createUser(data: CreateUserInput) {
  const currentUser = await requireAuth()

  if (!currentUser.isAdmin) {
    throw new Error('Only admins can create users')
  }

  return prisma.user.create({ data })
}
```

### DAL Rules

| Rule | Reason |
|------|--------|
| Never import `prisma` outside DAL | Centralizes data access |
| Auth checks in every function | Defense in depth |
| Throw errors, don't return null for auth | Distinguishes "not found" from "forbidden" |
| Export via entity index.ts | Clean public API |

## Common Commands

```bash
# Generate client after schema changes
pnpm prisma:generate

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Validate schema
pnpm prisma validate

# Create a migration (production)
pnpm prisma migrate dev --name my_migration

# Apply migrations (production)
pnpm prisma migrate deploy
```

## Adding Models

1. Add model to `prisma/schema.prisma` with proper mappings
2. Run `pnpm prisma migrate dev --name descriptive_name` to create migration
3. Run `pnpm prisma:generate` to update client
4. Create DAL functions in `entities/[name]/api/`

Example model with all conventions:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?  @db.Text
  published Boolean  @default(false)
  authorId  String   @map("author_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@map("posts")
}
```

## Query Patterns

### Selecting Specific Fields

```typescript
// Good - only fetch needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true }
})

// Avoid - fetches all fields
const user = await prisma.user.findUnique({ where: { id } })
```

### Including Relations

```typescript
const post = await prisma.post.findUnique({
  where: { id },
  include: {
    author: { select: { id: true, name: true } },
    comments: { take: 10, orderBy: { createdAt: 'desc' } }
  }
})
```

### Pagination

```typescript
// Cursor-based (preferred for large datasets)
const posts = await prisma.post.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastPostId },
  orderBy: { createdAt: 'desc' }
})

// Offset-based (simpler, for smaller datasets)
const posts = await prisma.post.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' }
})
```

### Transactions

```typescript
export async function createOrderWithItems(data: CreateOrderInput) {
  const user = await requireAuth()

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: { userId: user.id, status: 'pending' }
    })

    await tx.orderItem.createMany({
      data: data.items.map(item => ({
        orderId: order.id,
        ...item
      }))
    })

    return order
  })
}
```

## Local Development with Docker

For local development, run Postgres in Docker:

```bash
# Create and start Postgres
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:17

# Stop Postgres
docker stop postgres

# Start Postgres
docker start postgres

# Connect via psql
docker exec -it postgres psql -U postgres -d myapp

# Delete everything and start fresh
docker rm -f postgres && docker volume rm postgres_data
```

## Troubleshooting

### "Cannot find module '@/generated/prisma'"

Run the generator:
```bash
pnpm prisma:generate
```

### "The datasource property is required"

This error occurs when:
1. `prisma.config.ts` is in the wrong location (must be in project root)
2. `dotenv/config` isn't imported at the top of the config file
3. The `.env` file doesn't exist or `DATABASE_URL` isn't set

### Connection refused to localhost:5432

Make sure Docker Postgres is running:
```bash
docker ps | grep postgres
# If not running:
docker start postgres
```

### Schema drift

```bash
pnpm prisma db pull   # Pull current DB state
pnpm prisma migrate dev  # Create migration for differences
```

### Type mismatches after schema changes

Regenerate types:
```bash
pnpm prisma:generate
```

## File Locations

| What | Where |
|------|-------|
| Schema | `prisma/schema.prisma` |
| Config | `prisma.config.ts` (project root) |
| Migrations | `prisma/migrations/` |
| Generated client | `src/generated/prisma/` |
| Prisma singleton | `src/lib/prisma.ts` |
| DAL functions | `src/layers/entities/*/api/` |
| Auth utilities | `src/layers/shared/api/auth.ts` |
