'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Chapter1ReadingPage() {
  return (
    <div className="min-h-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)] dark:text-white mb-2">
          Reading
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choose a chapter to start reading.
        </p>

        <Link href="/read/chapter-1">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#0073ba] dark:hover:border-[#4bc4dc] overflow-hidden transition-all cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image / thumbnail */}
              <div className="w-full sm:w-56 h-44 sm:h-auto sm:min-h-[220px] relative bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                <Image
                  src="/slider-work-on-quizz/chapter1/chaper1-1.jpeg"
                  alt="Chapter 1"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 224px"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white text-3xl sm:text-4xl font-bold tracking-widest drop-shadow-lg">
                    CH 1
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-charcoal)] dark:text-white mb-2 group-hover:text-[#0073ba] dark:group-hover:text-[#4bc4dc] transition-colors">
                  Chapter 1: From Stage Star to Silent Struggles
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">
                  Tom&apos;s story—and the science behind why you can still win.
                </p>
                <span className="inline-flex items-center gap-2 text-[#0073ba] dark:text-[#4bc4dc] font-semibold text-sm">
                  Start reading
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}
