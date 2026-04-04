'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { TcpFiveWOneH } from '@/components/landing/TcpFiveWOneH'

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#142A4A] dark:text-white mb-4">
            How it Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            What TCP is, in plain language—before you sign up.
          </p>
          <Link
            href="/how-it-works"
            className="text-sm font-semibold text-[#0770C4] dark:text-[#51BFE3] hover:underline"
          >
            Open full page →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-3xl mx-auto bg-white dark:bg-[#000000] rounded-2xl p-6 sm:p-10 border-2 border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <TcpFiveWOneH variant="section" maxSections={4} />
        </motion.div>
      </div>
    </section>
  )
}
