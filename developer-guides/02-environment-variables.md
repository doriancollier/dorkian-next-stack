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
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
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

2. Add to `experimental__runtimeEnv`:
   ```typescript
   experimental__runtimeEnv: {
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
