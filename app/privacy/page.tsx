import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'

export const metadata: Metadata = {
  title: 'Privacy Policy | The Communication Protocol',
  description: 'How TCP handles your information and privacy.',
}

export default function PrivacyPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#142A4A] dark:text-white mb-6">
        Privacy Policy
      </h1>
      <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: April 2026</p>
        <p>
          We take privacy seriously, especially for younger learners. A full Privacy Policy is being
          finalized for this site. It will describe what data we collect, why we collect it, how long
          we keep it, and your choices.
        </p>
        <p>
          Until the full policy is published here, we aim to collect only what is needed to run TCP,
          protect accounts, and improve the product — and not to sell personal data to third parties
          for their marketing.
        </p>
        <p>
          Questions? See{' '}
          <Link href="/contact" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            Contact
          </Link>{' '}
          or the{' '}
          <Link href="/faq" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            FAQ
          </Link>
          .
        </p>
      </div>
    </MarketingSubPageShell>
  )
}
