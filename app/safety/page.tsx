import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'

export const metadata: Metadata = {
  title: 'Safety & Safeguarding | The Communication Protocol',
  description: 'How TCP approaches safety for young people.',
}

export default function SafetyPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#142A4A] dark:text-white mb-6">
        Safety &amp; safeguarding
      </h1>
      <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          TCP is built with teens and young adults in mind. We want learning to feel supportive, not
          risky. A detailed safeguarding statement is being written for this site; it will cover how
          we think about age-appropriate content, reporting concerns, and how we handle safety issues.
        </p>
        <p>
          TCP teaches communication skills — it is not a crisis service. If you or someone you know is
          in immediate danger, contact local emergency services or a trusted adult right away.
        </p>
        <p>
          Parents and guardians: see{' '}
          <Link href="/families" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            For families
          </Link>{' '}
          for context on who TCP is for and how to support younger users.
        </p>
      </div>
    </MarketingSubPageShell>
  )
}
