import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}
