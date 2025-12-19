import { prisma } from '@/lib/prisma'
import { UnauthorizedError } from './errors'

export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Get the current user
 * Note: This boilerplate uses single-user mode. Replace with your auth system.
 */
export async function getCurrentUser(): Promise<User | null> {
  return prisma.user.findFirst()
}

/**
 * Require authentication - throws if no user exists
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  return user
}

/**
 * Get or create default user (single-user mode)
 * Replace this with your actual auth system in production.
 * Handles race conditions when multiple requests come in simultaneously.
 */
export async function getOrCreateDefaultUser(): Promise<User> {
  const existingUser = await getCurrentUser()

  if (existingUser) {
    return existingUser
  }

  try {
    return await prisma.user.create({
      data: {
        email: 'user@local',
        name: 'Default User',
      },
    })
  } catch (error) {
    // If unique constraint violation (P2002), another request created the user
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      const user = await prisma.user.findUnique({
        where: { email: 'user@local' },
      })
      if (user) {
        return user
      }
    }
    throw error
  }
}
