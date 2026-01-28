'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-[#142A4A] dark:to-[#000000] py-20 md:py-32">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#0770C4]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-[#51BFE3]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-[#0770C4]/10 dark:bg-[#0770C4]/20 text-[#0770C4] dark:text-[#51BFE3] rounded-full text-sm font-semibold border border-[#0770C4]/20">
                Applied Communication Training
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#142A4A] dark:text-white mb-6 leading-tight">
              Change how you communicate.
              <span className="block mt-2 bg-gradient-to-r from-[#0770C4] to-[#51BFE3] bg-clip-text text-transparent">
                Not what you know.
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              TCP helps you become a better communicator by building <strong className="text-[#142A4A] dark:text-white">systems and behaviors</strong>, not confidence tricks.
            </p>

            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0">
              Pause instead of react. Say the hard thing without blowing up the room. Show up with presence, not noise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-[#0770C4] to-[#51BFE3] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  Start Your Journey
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-[#142A4A] dark:border-gray-600 text-[#142A4A] dark:text-white rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  How It Works
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Logo/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0"
              >
                <Image 
                  src="/chapters/TCP-logo.png" 
                  alt="The Communication Protocol" 
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
              
              {/* Animated rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-[#0770C4]/20 rounded-full"
                style={{ scale: 1.1 }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-[#51BFE3]/20 rounded-full"
                style={{ scale: 1.2 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
