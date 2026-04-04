import Link from 'next/link'
import { LandingHeader } from '@/components/landing/LandingHeader'

export function MarketingSubPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#142A4A] transition-colors duration-300">
      <LandingHeader />
      <main className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-[var(--font-body)]">
        <p className="mb-10">
          <Link
            href="/"
            className="text-sm font-semibold text-[#0770C4] dark:text-[#51BFE3] hover:underline"
          >
            ← Back to home
          </Link>
        </p>
        {children}
        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          <Link
            href="/onboarding"
            className="inline-flex justify-center px-6 py-3 bg-[#ff6a38] hover:bg-[#ff5520] text-white rounded-2xl font-bold text-sm uppercase tracking-wide transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex justify-center px-6 py-3 border-2 border-[#0073ba] dark:border-[#4bc4dc] text-[#0073ba] dark:text-[#4bc4dc] rounded-2xl font-bold text-sm uppercase tracking-wide hover:bg-[#0073ba] hover:text-white dark:hover:bg-[#4bc4dc] dark:hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>
        </div>
      </main>
    </div>
  )
}
