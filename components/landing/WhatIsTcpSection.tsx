'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const ILLUSTRATION = '/what-is-tcp-before-after.png'

export function WhatIsTcpSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-white dark:bg-[#142A4A] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="order-2 lg:order-1 min-w-0 w-full flex flex-col justify-center"
          >
            <div className="w-full max-w-none space-y-5 md:space-y-6 text-[#142A4A] dark:text-gray-100">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#ff6a38] leading-tight">
                What is TCP?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                TCP is a system that teaches you how to communicate clearly — so people understand you, respect you,
                and take you seriously.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Whether you&apos;re texting, speaking, or writing, TCP helps you stop guessing what to say and start
                expressing yourself with confidence.
              </p>
              <div>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  Most people weren&apos;t taught how to communicate properly — which leads to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300">
                  <li>Overthinking messages</li>
                  <li>Saying the wrong thing at the wrong time</li>
                  <li>Being misunderstood</li>
                </ul>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-semibold text-[#142A4A] dark:text-white leading-relaxed">
                TCP fixes this with a clear, practical system.
              </p>
              <div>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  Instead of vague advice, you get step-by-step frameworks to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300">
                  <li>Think before you speak</li>
                  <li>Say things clearly</li>
                  <li>Control how people understand you</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="order-1 lg:order-2 min-w-0 w-full flex items-stretch"
          >
            <div className="w-full rounded-2xl bg-white p-2 sm:p-2.5 shadow-md dark:bg-white dark:shadow-none dark:ring-1 dark:ring-white/20">
              <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[min(78vh,820px)]">
                <Image
                  src={ILLUSTRATION}
                  alt="Before and after illustration: a young man confused and overthinking with his phone, then confident and clear with speech bubble and lightbulb, separated by an arrow labeled Before and After"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={false}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
