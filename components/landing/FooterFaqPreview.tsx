'use client'

import Link from 'next/link'
import { FaqAccordion } from '@/components/landing/FaqAccordion'
import { faqItems } from '@/lib/faq-items'

const PREVIEW_COUNT = 4

export function FooterFaqPreview() {
  return (
    <div className="space-y-6">
      <FaqAccordion items={faqItems.slice(0, PREVIEW_COUNT)} />
      <p className="text-center sm:text-left">
        <Link
          href="/faq"
          className="text-sm font-semibold text-[#0770C4] dark:text-[#51BFE3] hover:underline"
        >
          View all questions →
        </Link>
      </p>
    </div>
  )
}
