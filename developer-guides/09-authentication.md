# Authentication

## Overview

This project uses BetterAuth with Email OTP (passwordless) authentication. Users sign in by entering their email, receiving a 6-digit code, and entering it to create a session.

**Key characteristics:**
- Passwordless authentication via 6-digit OTP codes
- 7-day session duration with automatic refresh
- Cookie-based session storage with 5-minute caching
- Built-in CSRF protection

**Key files:**

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Server-side BetterAuth configuration |
| `src/lib/auth-client.ts` | Client-side auth utilities |
| `src/layers/shared/api/auth.ts` | Auth utilities for DAL and server components |
| `src/layers/features/auth/` | Auth UI components |
| `src/app/(authenticated)/` | Protected route group |

## Server-Side Authentication

### Available Functions

| Function | Returns | Use Case |
|----------|---------|----------|
| `getCurrentUser()` | `User \| null` | Check if user is authenticated |
| `requireAuth()` | `User` | DAL functions - throws if not authenticated |
| `requireAuthOrRedirect()` | `Session` | Server components - redirects if not authenticated |
| `getSession()` | `Session \| null` | Get full session with metadata |

### Checking Authentication in Server Components

```typescript
import { getCurrentUser } from "@/layers/shared/api/auth"

export default async function MyPage() {
  const user = await getCurrentUser()

  if (!user) {
    return <p>Please sign in</p>
  }

  return <p>Hello, {user.name}</p>
}
```

### Protected Server Components (with redirect)

```typescript
import { requireAuthOrRedirect } from "@/layers/shared/api/auth"

export default async function SettingsPage() {
  const { user } = await requireAuthOrRedirect()
  // User is guaranteed to exist here
  return <h1>Settings for {user.name}</h1>
}
```

### DAL Functions (throw on auth failure)

```typescript
import { requireAuth } from "@/layers/shared/api/auth"
import { prisma } from "@/lib/prisma"

export async function getUserPosts(): Promise<Post[]> {
  const user = await requireAuth() // Throws UnauthorizedError if not authenticated

  return prisma.post.findMany({
    where: { authorId: user.id }
  })
}
```

## Client-Side Authentication

### The useSession Hook

Use `useSession()` in client components that need reactive access to authentication state:

```typescript
"use client"

import { useSession, signOut } from "@/lib/auth-client"

export function UserMenu() {
  const { data: session, isPending, error } = useSession()

  if (isPending) {
    return <Skeleton />
  }

  if (!session) {
    return <SignInButton />
  }

  return (
    <DropdownMenu>
      <span>{session.user.email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </DropdownMenu>
  )
}
```

**Hook return values:**
- `data` - Session object with user and session info
- `isPending` - True while checking session status
- `error` - Error object if session check failed

### Sign Out

```typescript
import { signOut } from "@/lib/auth-client"

await signOut()
// Session cookie cleared, user signed out
```

## The (authenticated)/ Route Group Pattern

### How It Works

All pages under `src/app/(authenticated)/` automatically require authentication:

```
src/app/
├── (authenticated)/          # Protected route group
│   ├── layout.tsx           # Auth check happens here
│   ├── dashboard/
│   │   └── page.tsx         # No auth code needed
│   ├── settings/
│   │   └── page.tsx         # No auth code needed
│   └── profile/
│       └── page.tsx         # No auth code needed
├── (auth)/                   # Auth UI pages
│   ├── sign-in/
│   │   └── page.tsx
│   └── verify/
│       └── page.tsx
└── page.tsx                  # Public home page
```

The parentheses `()` in folder names create **route groups** - they organize routes without affecting URLs:
- `/dashboard` → `src/app/(authenticated)/dashboard/page.tsx`
- `/sign-in` → `src/app/(auth)/sign-in/page.tsx`

### The Layout Check

The layout at `(authenticated)/layout.tsx` runs before any child page:

```typescript
// src/app/(authenticated)/layout.tsx
export default async function AuthenticatedLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return <>{children}</>
}
```

### Adding a New Protected Page

1. Create your page under `src/app/(authenticated)/`:

```typescript
// src/app/(authenticated)/my-feature/page.tsx
import { requireAuthOrRedirect } from "@/layers/shared/api/auth"

export default async function MyFeaturePage() {
  const { user } = await requireAuthOrRedirect()
  return <h1>My Feature for {user.name}</h1>
}
```

2. That's it! The layout handles authentication automatically.

### Why This Pattern?

| Benefit | Explanation |
|---------|-------------|
| **Single point of auth** | Auth check in one place, not scattered |
| **Impossible to forget** | Pages under the folder are automatically protected |
| **Clean URLs** | No `/authenticated/` or `/app/` prefix in URLs |
| **Easy to understand** | "Everything in this folder needs auth" |
| **Type-safe** | `requireAuthOrRedirect()` guarantees user exists |

## Authentication Flow

### Sign-In Flow

```
1. User visits /sign-in
   └── Sees email input form

2. User enters email, clicks "Continue with email"
   └── authClient.emailOtp.sendVerificationOtp() called
   └── OTP code logged to server console (dev mode)

3. User redirected to /verify?email=user@example.com
   └── 6-digit OTP input displayed

4. User enters OTP code
   └── Auto-submits when 6 digits entered
   └── authClient.signIn.emailOtp() called

5. If valid:
   └── Session cookie set
   └── Redirect to /dashboard

6. If invalid:
   └── Error shown, input cleared
   └── Can retry (3 attempts max)
```

### Sign-Out Flow

```
1. User clicks "Sign out" button
   └── signOut() called

2. Session cookie cleared
   └── Redirect to / (home page)

3. Protected routes now redirect to /sign-in
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | 32+ character secret for signing tokens |
| `BETTER_AUTH_URL` | No | Base URL (defaults to NEXT_PUBLIC_APP_URL) |

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

## Common Patterns

### Sign Out Button

```typescript
import { SignOutButton } from "@/layers/features/auth"

<SignOutButton />
// or with custom styling
<SignOutButton className="text-red-500" />
```

### Conditional Rendering Based on Auth

```typescript
"use client"
import { useSession } from "@/lib/auth-client"

function Header() {
  const { data: session, isPending } = useSession()

  if (isPending) return <HeaderSkeleton />

  return (
    <header>
      {session ? (
        <UserMenu user={session.user} />
      ) : (
        <SignInButton />
      )}
    </header>
  )
}
```

### Server Component with Optional Auth

```typescript
import { getCurrentUser } from "@/layers/shared/api/auth"

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div>
      <h1>Welcome{user ? `, ${user.name}` : ""}</h1>
      {user ? (
        <Link href="/dashboard">Go to Dashboard</Link>
      ) : (
        <Link href="/sign-in">Sign In</Link>
      )}
    </div>
  )
}
```

## Database Models

BetterAuth uses the following Prisma models:

| Model | Purpose |
|-------|---------|
| `User` | User accounts with email, name, image |
| `Session` | Active login sessions (7-day expiry) |
| `Account` | OAuth provider connections (future) |
| `Verification` | OTP codes and verification tokens |

These models follow project conventions (snake_case via `@map`).

## Debugging

### Check OTP Codes

In development, OTP codes are logged to the server console:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OTP Code for user@example.com
  Type: sign-in
  Code: 123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Check Session State

Use Prisma Studio to inspect sessions:

```bash
pnpm prisma:studio
```

Look at the `sessions` table to see active sessions.

### Clear Sessions

To force sign-out all users (development):

```bash
# In Prisma Studio, delete all rows from sessions table
```

## Future Extensibility

### Adding OAuth Providers (Google, GitHub)

1. Install the OAuth plugin
2. Add provider credentials to env
3. Update auth.ts configuration
4. Add social sign-in buttons to UI

### Adding Two-Factor Authentication

1. Enable 2FA plugin in BetterAuth
2. Add TOTP setup UI component
3. Update sign-in flow to check 2FA status

### Switching to Real Email (Resend)

1. Install: `pnpm add resend`
2. Add `RESEND_API_KEY` to env.ts
3. Update `sendVerificationOTP` in auth.ts:

```typescript
async sendVerificationOTP({ email, otp, type }) {
  const resend = new Resend(env.RESEND_API_KEY)
  await resend.emails.send({
    from: "noreply@yourapp.com",
    to: email,
    subject: "Your verification code",
    text: `Your code is: ${otp}`,
  })
}
```
