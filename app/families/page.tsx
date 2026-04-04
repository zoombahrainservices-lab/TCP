import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'

export const metadata: Metadata = {
  title: 'For Families | The Communication Protocol',
  description: 'Information for parents and guardians about TCP.',
}

export default function FamiliesPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#142A4A] dark:text-white mb-6">
        For families
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Parents, guardians, and caring adults
      </p>
      <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          TCP (The Communication Protocol) helps young people practice clear communication through
          structured lessons, saved tools, and progress they can see — not through anonymous social
          feeds or open chat with strangers.
        </p>
        <p>
          Our content is aimed broadly at ages 12–18 and learners who want practical skills for real
          situations (school, friendships, messaging, difficult conversations). Younger teens benefit
          from an adult being aware they are using the product and talking with them about what they
          are learning.
        </p>
        <p>
          For how we handle data and safety commitments as they are finalized, see{' '}
          <Link href="/privacy" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/safety" className="text-[#0770C4] dark:text-[#51BFE3] font-semibold hover:underline">
            Safety &amp; safeguarding
          </Link>
          .
        </p>
      </div>
    </MarketingSubPageShell>
  )
}
