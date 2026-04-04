'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const personas = [
  {
    emoji: '🎓',
    title: 'Students',
    age: 'Ages 12–18',
    description:
      'Middle school to college. Smart, reflective, often overthinking. Want tools, not motivation.',
  },
  {
    emoji: '💬',
    title: 'People Who Overthink What to Say',
    age: 'Ages 12–18',
    description:
      'You replay messages, second-guess your words, and worry about saying the wrong thing.',
  },
  {
    emoji: '⚖️',
    title: 'People Who Shut Down or Say Too Much',
    age: 'Ages 12–18',
    description:
      'Sometimes you go quiet. Sometimes you overexplain. You want help saying things clearly.',
  },
]

export function ForWhomSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="faq" ref={ref} className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#142A4A] dark:text-white mb-4">
            Who Is TCP For?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            For students who are smart, self-aware, and struggle to express themselves clearly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-[#000000] rounded-2xl p-8 text-center border-2 border-gray-200 dark:border-gray-700 hover:border-[#0770C4] dark:hover:border-[#51BFE3] transition-all hover:shadow-xl"
            >
              <div className="text-5xl mb-4">{persona.emoji}</div>
              <h3 className="text-xl font-bold text-[#142A4A] dark:text-white mb-2">
                {persona.title}
              </h3>
              <p className="text-sm text-[#0770C4] dark:text-[#51BFE3] font-semibold mb-3">
                {persona.age}
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {persona.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-white dark:bg-[#000000] rounded-2xl p-8 sm:p-10 border-2 border-[#0770C4] dark:border-[#51BFE3] max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 leading-relaxed">
              {"You know you're capable. You just need help saying what you mean."}
            </p>
            <p className="mt-5 text-[#0770C4] dark:text-[#51BFE3] font-semibold text-base sm:text-lg">
              If that sounds like you, TCP is for you.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
