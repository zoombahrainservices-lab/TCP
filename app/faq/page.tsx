import type { Metadata } from 'next'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'
import { FaqAccordion } from '@/components/landing/FaqAccordion'
import { faqItems } from '@/lib/faq-items'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | The Communication Protocol',
  description:
    'Answers about what TCP is, who it is for, how it differs from typical advice, texting and online communication, pricing, and what happens after you sign up.',
}

export default function FaqPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#142A4A] dark:text-white mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Tap a question to see the answer.
      </p>
      <FaqAccordion items={faqItems} />
    </MarketingSubPageShell>
  )
}
