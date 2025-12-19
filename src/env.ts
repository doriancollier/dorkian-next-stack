import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // MCP Database Server (development only)
    MCP_DEV_ONLY_DB_ACCESS: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    MCP_DEFAULT_LIMIT: z
      .string()
      .optional()
      .default('200')
      .transform((val) => parseInt(val, 10)),
    MCP_MAX_ROWS: z
      .string()
      .optional()
      .default('2000')
      .transform((val) => parseInt(val, 10)),
    MCP_STMT_TIMEOUT_MS: z
      .string()
      .optional()
      .default('10000')
      .transform((val) => parseInt(val, 10)),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Skip validation in edge cases
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
