import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'

export const metadata: Metadata = {
  title: 'Terms of Service | The Communication Protocol',
  description: 'Terms for using TCP.',
}

export default function TermsPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#142A4A] dark:text-white mb-6">
        Terms of Service
      </h1>
      <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: April 2026</p>
        <p>
          Formal Terms of Service are being prepared for TCP. They will describe acceptable use of
          the platform, account responsibilities, limitations of liability, and related legal terms.
        </p>
        <p>
          By using this site while these terms are in draft, you agree to use TCP respectfully and
          lawfully, and not to misuse or attempt to disrupt the service.
        </p>
        <p>
          For safety expectations involving minors, see{' '}
          <Link href="/safety" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            Safety &amp; safeguarding
          </Link>
          . For families, see{' '}
          <Link href="/families" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            For families
          </Link>
          .
        </p>
      </div>
    </MarketingSubPageShell>
  )
}
