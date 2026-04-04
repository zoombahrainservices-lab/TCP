import type { Metadata } from 'next'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'
import { TcpFiveWOneH } from '@/components/landing/TcpFiveWOneH'

export const metadata: Metadata = {
  title: 'How it Works | The Communication Protocol',
  description:
    'What TCP is, why it exists, who it is for, and how it helps you communicate clearly—in real messages and real moments.',
}

export default function HowItWorksPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#142A4A] dark:text-white mb-10">
        How it Works
      </h1>
      <TcpFiveWOneH variant="page" />
    </MarketingSubPageShell>
  )
}
