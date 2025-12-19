import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

export type UserFormData = z.infer<typeof userSchema>

export const createUserSchema = userSchema
export const updateUserSchema = userSchema.partial()
