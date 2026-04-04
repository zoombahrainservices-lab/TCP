'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FaqItem } from '@/lib/faq-items'

function FaqAnswer({ content }: { content: string | string[] }) {
  const parts = Array.isArray(content) ? content : [content]
  return (
    <div className="space-y-3 pb-5 pt-0 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
      {parts.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  )
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `faq-answer-${index}`
        const buttonId = `faq-question-${index}`

        return (
          <div
            key={item.q}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <button
              id={buttonId}
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-4 py-4 sm:py-5 text-left text-base sm:text-lg font-semibold text-[#142A4A] dark:text-white transition-colors hover:opacity-90"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="pr-2">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#0770C4] dark:text-[#51BFE3] transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div id={panelId} role="region" aria-labelledby={buttonId}>
                <FaqAnswer content={item.a} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
