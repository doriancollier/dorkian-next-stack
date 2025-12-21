# Data Fetching Guide

## TanStack Query Setup

TanStack Query is configured in `src/app/providers.tsx`:

```typescript
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
        },
      },
    })
)
```

## Query Keys

Use the query key factory pattern for type-safe keys:

```typescript
// src/lib/query-client.ts
export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
} as const
```

## Basic Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/layers/shared/lib/query-client'

interface User {
  id: string
  name: string
  email: string
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

export function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/layers/shared/lib/query-client'

async function createUser(data: { name: string; email: string }) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create user')
  return response.json()
}

export function CreateUserForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })

  const handleSubmit = (data: { name: string; email: string }) => {
    mutation.mutate(data)
  }

  return (
    // Form implementation
  )
}
```

## Suspense Query

For Server Components or Suspense boundaries:

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'

export function UserList() {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
  })

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <UserList />
</Suspense>
```

## DevTools

React Query DevTools are automatically included in development mode. Access them via the floating button in the bottom-right corner.
