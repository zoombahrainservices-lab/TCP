'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0770C4] to-[#51BFE3] text-white relative overflow-hidden py-12">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Change How You Communicate?
          </h2>
          <p className="text-xl mb-3 text-white/90 max-w-2xl mx-auto leading-snug">
            Stop collecting advice. Start building systems.
          </p>
          <p className="text-lg mb-10 text-white/85 max-w-2xl mx-auto leading-relaxed">
            Learn tools you can actually use in real conversations.
          </p>

          <div className="flex flex-col items-center gap-3">
            <Link href="/onboarding">
              <motion.button
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 sm:px-12 sm:py-5 bg-[#ff6a38] hover:bg-[#ff5520] text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all"
              >
                Get Started
              </motion.button>
            </Link>
            <p className="text-white/75 text-sm">
              Free to start. No credit card required.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
