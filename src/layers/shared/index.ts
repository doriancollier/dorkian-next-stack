// Shared layer public API
// Re-export utilities
export { cn, makeQueryClient, queryKeys } from './lib'

// Re-export auth utilities
export { getCurrentUser, requireAuth, getOrCreateDefaultUser } from './api'
export type { User } from './api'

// Re-export error types
export { UnauthorizedError, NotFoundError, ValidationError } from './api'
