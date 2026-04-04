'use client'

import { useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'
import LoadingButton from '@/components/ui/LoadingButton'
import Input from '@/components/ui/Input'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await requestPasswordReset(email)
      if (result.error) {
        setError(result.error)
        return
      }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 p-6 text-center space-y-4">
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
          If an account exists for that email, we sent a link to reset your password. Check your inbox
          and spam folder.
        </p>
        <Link
          href="/auth/login"
          className="inline-block text-sm font-semibold text-[#0770C4] dark:text-[#51BFE3] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="forgot-password-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
        required
        autoComplete="email"
        disabled={loading}
      />
      {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <LoadingButton type="submit" variant="calm" fullWidth loading={loading}>
        Send reset link
      </LoadingButton>
    </form>
  )
}
