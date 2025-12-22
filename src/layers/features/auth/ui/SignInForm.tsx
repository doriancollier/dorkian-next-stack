'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/layers/shared/ui'
import { signInSchema, type SignInValues } from '../model/schemas'

export function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: SignInValues) {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: 'sign-in',
      })

      if (error) {
        setError(error.message ?? 'Failed to send verification code')
        return
      }

      // Redirect to verify page with email
      const params = new URLSearchParams({ email: values.email })
      router.push(`/verify?${params.toString()}`)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending code...' : 'Continue with email'}
        </Button>
      </form>
    </Form>
  )
}
