'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/layers/shared/ui'

interface SignOutButtonProps {
  className?: string
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignOut() {
    setIsLoading(true)
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}
