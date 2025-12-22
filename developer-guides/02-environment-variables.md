# Environment Variables Guide

## Overview

This project uses [T3 Env](https://env.t3.gg/) for type-safe environment variables with build-time validation.

## Configuration

Environment configuration is in `src/env.ts`:

```typescript
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Authentication (BetterAuth)
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().optional(),

    // MCP Database Server (development only)
    MCP_DEV_ONLY_DB_ACCESS: z.string().optional().transform((val) => val === 'true'),
    MCP_DEFAULT_LIMIT: z.string().optional().default('200').transform((val) => parseInt(val, 10)),
    MCP_MAX_ROWS: z.string().optional().default('2000').transform((val) => parseInt(val, 10)),
    MCP_STMT_TIMEOUT_MS: z.string().optional().default('10000').transform((val) => parseInt(val, 10)),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    MCP_DEV_ONLY_DB_ACCESS: process.env.MCP_DEV_ONLY_DB_ACCESS,
    MCP_DEFAULT_LIMIT: process.env.MCP_DEFAULT_LIMIT,
    MCP_MAX_ROWS: process.env.MCP_MAX_ROWS,
    MCP_STMT_TIMEOUT_MS: process.env.MCP_STMT_TIMEOUT_MS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
```

## Adding New Variables

### Server Variables

1. Add to `server` object in `src/env.ts`:
   ```typescript
   server: {
     MY_SECRET: z.string().min(1),
   }
   ```

2. Add to `.env` and `.env.example`

### Client Variables

1. Add with `NEXT_PUBLIC_` prefix to `client` object:
   ```typescript
   client: {
     NEXT_PUBLIC_API_URL: z.string().url(),
   }
   ```

2. Add to `runtimeEnv`:
   ```typescript
   runtimeEnv: {
     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
   }
   ```

3. Add to `.env` and `.env.example`

## Usage

```typescript
import { env } from '@/env'

// Server-side
const dbUrl = env.DATABASE_URL

// Client-side (only NEXT_PUBLIC_ vars)
const appUrl = env.NEXT_PUBLIC_APP_URL
```

## Files

| File | Purpose | Git |
|------|---------|-----|
| `.env` | Local environment | Ignored |
| `.env.local` | Local overrides | Ignored |
| `.env.example` | Template | Committed |

## Build-Time Validation

The `next.config.ts` validates environment variables at build time using jiti:

```typescript
import createJiti from 'jiti'
const jiti = createJiti(fileURLToPath(import.meta.url))
jiti('./src/env')
```

If required variables are missing, the build will fail with clear error messages.

## Skipping Validation

Set `SKIP_ENV_VALIDATION=true` to skip validation (useful for CI/CD or Docker builds where env vars are injected at runtime).

## Variable Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./.data/dev.db` (SQLite) or PostgreSQL URL |
| `BETTER_AUTH_SECRET` | Auth session secret (min 32 chars) | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BETTER_AUTH_URL` | Auth server URL (if different from app) | Uses `NEXT_PUBLIC_APP_URL` |
| `MCP_DEV_ONLY_DB_ACCESS` | Enable MCP database tools | `false` |
| `MCP_DEFAULT_LIMIT` | Default rows returned | `200` |
| `MCP_MAX_ROWS` | Maximum rows returned | `2000` |
| `MCP_STMT_TIMEOUT_MS` | Query timeout (ms) | `10000` |

### Example .env

```bash
# Database (SQLite for local development)
DATABASE_URL="file:./.data/dev.db"

# Authentication (BetterAuth)
BETTER_AUTH_SECRET=""  # Generate: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# MCP Database Access (dev only)
MCP_DEV_ONLY_DB_ACCESS=true

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
