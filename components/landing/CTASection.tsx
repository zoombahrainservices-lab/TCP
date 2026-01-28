'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-[#0770C4] to-[#51BFE3] text-white relative overflow-hidden">
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
          <p className="text-xl mb-4 text-white/90 max-w-2xl mx-auto">
            Stop collecting advice. Start building systems.
          </p>
          <p className="text-lg mb-10 text-white/80 max-w-2xl mx-auto">
            Join others who are turning self-awareness into repeatable behaviors.
          </p>
          
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white text-[#0770C4] rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-shadow"
            >
              Start Your Journey Now
            </motion.button>
          </Link>

          <p className="mt-8 text-white/70 text-sm">
            Free to start. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
