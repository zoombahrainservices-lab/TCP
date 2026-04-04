'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const problems = [
  {
    icon: '🔄',
    title: 'React instead of respond',
    description: "You know you should pause, but in the moment, you don't.",
  },
  {
    icon: '😶',
    title: 'Avoid saying what matters',
    description: 'You know what you want to say — but you hold back when it counts.',
  },
  {
    icon: '😤',
    title: 'Say too much or nothing at all',
    description: "You either over-explain or go quiet. There's no middle ground.",
  },
  {
    icon: '🤯',
    title: 'Struggle to get your point across',
    description: "What makes sense in your head doesn't come out clearly.",
  },
]

export function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="problem-section" ref={ref} className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#000000] transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#142A4A] dark:text-white mb-4">
            <span className="text-[#ff6a38]">You know</span> what to say.
            <span className="block mt-2">
              You just don&apos;t <span className="text-[#ff6a38]">say it right.</span>
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-6">
            TCP doesn't teach theory. It changes behavior.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-[#142A4A] rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-[#0770C4] dark:hover:border-[#51BFE3] transition-colors"
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="text-xl font-bold text-[#142A4A] dark:text-white mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
