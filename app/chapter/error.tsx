'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

/** Catches client errors in chapter flows (e.g. React #310 hook errors on fast techniques → resolution nav). */
export default function ChapterError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Chapter]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#142A4A] px-4">
      <Card className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This can happen if you switched sections too quickly. Try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/dashboard')}>
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
