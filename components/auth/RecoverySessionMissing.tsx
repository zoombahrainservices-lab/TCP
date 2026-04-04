import Link from 'next/link'

export function RecoverySessionMissing() {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-6 text-sm text-gray-800 dark:text-gray-200 space-y-4">
      <p>
        This reset link is invalid or has expired. Request a new one from the sign-in page.
      </p>
      <Link
        href="/auth/forgot-password"
        className="inline-block font-semibold text-[#0770C4] dark:text-[#51BFE3] hover:underline"
      >
        Forgot password?
      </Link>
    </div>
  )
}
