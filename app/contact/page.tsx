import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'

export const metadata: Metadata = {
  title: 'Contact | The Communication Protocol',
  description: 'How to reach TCP.',
}

export default function ContactPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#142A4A] dark:text-white mb-6">
        Contact
      </h1>
      <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          We are setting up a dedicated support inbox and contact workflow. In the meantime, check the{' '}
          <Link href="/faq" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            FAQ
          </Link>{' '}
          for common questions about TCP, accounts, and how the product works.
        </p>
        <p>
          If you are a parent or guardian with a safety concern, please read{' '}
          <Link href="/safety" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            Safety &amp; safeguarding
          </Link>{' '}
          and{' '}
          <Link href="/families" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            For families
          </Link>
          .
        </p>
      </div>
    </MarketingSubPageShell>
  )
}
