# Forms & Validation Guide

## Stack

- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Connects Zod to React Hook Form
- **Shadcn Form** - Form components

## Creating a Form

### 1. Define Zod Schema

```typescript
// src/schemas/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

export type UserFormData = z.infer<typeof userSchema>
```

### 2. Create Form Component

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { userSchema, type UserFormData } from '@/schemas/user'

export function MyForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  function onSubmit(data: UserFormData) {
    console.log('Form submitted:', data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Your display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Form Components

| Component | Purpose |
|-----------|---------|
| `Form` | Provides form context |
| `FormField` | Connects field to form state |
| `FormItem` | Groups field elements |
| `FormLabel` | Field label |
| `FormControl` | Wraps input component |
| `FormDescription` | Helper text |
| `FormMessage` | Validation error |

## Common Validation Patterns

```typescript
const schema = z.object({
  // Required string
  name: z.string().min(1, 'Required'),

  // Email
  email: z.string().email(),

  // URL
  website: z.string().url(),

  // Number range
  age: z.number().min(18).max(120),

  // Enum
  role: z.enum(['admin', 'user', 'guest']),

  // Optional
  bio: z.string().optional(),

  // Array
  tags: z.array(z.string()).min(1),

  // Nested object
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),

  // Password confirmation
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
```

## Form Submission

```typescript
async function onSubmit(data: UserFormData) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error('Failed to submit')

    // Handle success
  } catch (error) {
    // Handle error
    form.setError('root', { message: 'Submission failed' })
  }
}
```
