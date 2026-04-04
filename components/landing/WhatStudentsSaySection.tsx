'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SOCIAL_STATS, STUDENT_TESTIMONIALS } from '@/lib/landing/student-testimonials'

function ProductPreviewStrip() {
  const items = [
    {
      label: 'Learn',
      caption: 'Lesson preview',
      body: (
        <div className="flex flex-col gap-1.5 p-3 h-full justify-center">
          <div className="h-1.5 w-2/3 rounded-full bg-[#0770C4]/30 dark:bg-[#51BFE3]/35" />
          <div className="h-1.5 w-full rounded-full bg-gray-200/90 dark:bg-white/12" />
          <div className="self-end max-w-[78%] rounded-xl rounded-tr-sm bg-[#0770C4]/12 dark:bg-[#51BFE3]/18 px-2 py-1.5 mt-1">
            <div className="h-1 w-16 rounded-full bg-[#0770C4]/35" />
          </div>
        </div>
      ),
    },
    {
      label: 'Save',
      caption: 'Tool card',
      body: (
        <div className="p-3 h-full flex items-center justify-center">
          <div className="w-full rounded-lg border border-dashed border-[#0770C4]/30 dark:border-[#51BFE3]/40 bg-white/70 dark:bg-[#0d2138]/80 p-2.5">
            <div className="h-1.5 w-1/3 rounded-full bg-[#ff6a38]/35 mb-2" />
            <div className="space-y-1">
              <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-white/12" />
              <div className="h-1 w-4/5 rounded-full bg-gray-200 dark:bg-white/12" />
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Use',
      caption: 'Progress',
      body: (
        <div className="flex items-end gap-1.5 px-3 py-3 h-full">
          <div className="flex-1 rounded-t bg-[#0770C4]/35 dark:bg-[#51BFE3]/40 h-[40%]" />
          <div className="flex-1 rounded-t bg-[#0770C4]/50 dark:bg-[#51BFE3]/55 h-[65%]" />
          <div className="flex-1 rounded-t bg-[#ff6a38]/40 h-[50%]" />
          <div className="flex-1 rounded-t bg-[#0770C4]/55 dark:bg-[#51BFE3]/60 h-[85%]" />
        </div>
      ),
    },
  ] as const

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#142A4A] overflow-hidden shadow-sm"
        >
          <div className="relative aspect-[4/3] bg-gradient-to-b from-gray-100 to-gray-50 dark:from-[#142A4A] dark:to-[#0d2138]">
            <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0770C4] text-white dark:bg-[#51BFE3] dark:text-[#0d2138]">
              {item.label}
            </span>
            <div className="absolute inset-0 pt-9">{item.body}</div>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2.5 px-2 border-t border-gray-200/80 dark:border-gray-700">
            {item.caption}
          </p>
        </div>
      ))}
    </div>
  )
}

export function WhatStudentsSaySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const hasTestimonials = STUDENT_TESTIMONIALS.length > 0
  const hasStats = SOCIAL_STATS.length > 0

  return (
    <section
      ref={ref}
      className="w-full bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#142A4A] dark:text-white mb-3">What Students Say</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Real feedback from students using TCP to communicate more clearly.
          </p>
        </motion.div>

        {hasTestimonials && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {STUDENT_TESTIMONIALS.slice(0, 3).map((t, i) => (
              <motion.blockquote
                key={`${t.firstName}-${t.age}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.06 + i * 0.08 }}
                className="bg-white dark:bg-[#000000] rounded-2xl p-6 md:p-7 border border-gray-200 dark:border-gray-700 text-left shadow-sm flex flex-col"
              >
                <p className="text-gray-800 dark:text-gray-100 leading-relaxed text-base md:text-[1.05rem] flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="text-sm md:text-base text-[#0770C4] dark:text-[#51BFE3] font-semibold">
                  — {t.firstName}, {t.age}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        )}

        {hasStats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 md:mb-14"
          >
            {SOCIAL_STATS.map((s) => (
              <div key={s.label} className="text-center min-w-[140px]">
                <p className="text-2xl md:text-3xl font-bold text-[#ff6a38]">{s.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {!hasTestimonials && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="max-w-2xl mx-auto text-center mb-10 md:mb-12"
          >
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
              TCP is in early access. We only show student quotes and numbers we can verify — so this space stays
              honest. Try the product below, then get started; when you have a story to share, we&apos;d love to hear
              it.
            </p>
          </motion.div>
        )}

        {!hasTestimonials && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mb-12 md:mb-14"
          >
            <p className="text-sm font-semibold text-[#142A4A] dark:text-white text-center mb-4">Inside TCP</p>
            <ProductPreviewStrip />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: hasTestimonials ? 0.2 : 0.18 }}
          className="max-w-xl mx-auto rounded-2xl border-2 border-[#0770C4]/30 dark:border-[#51BFE3]/40 bg-white dark:bg-[#000000] p-8 text-center shadow-md"
        >
          <h3 className="text-lg font-bold text-[#142A4A] dark:text-white mb-2">
            Built for students who want tools, not vague advice
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            For students learning to text, speak, and respond better — with steps you can use, not generic tips.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#ff6a38] hover:bg-[#ff5520] text-white rounded-2xl font-bold text-sm uppercase tracking-wide transition-colors"
          >
            Join early access
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
