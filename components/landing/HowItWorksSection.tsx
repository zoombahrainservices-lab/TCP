'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    number: '01',
    title: 'Stories',
    subtitle: 'See yourself in the narrative',
    description: 'Meet characters like Tom, Michael, Sara. You\'ll recognize yourself. Stories lower defensiveness and create identification.',
    color: 'from-[#0770C4] to-[#51BFE3]',
  },
  {
    number: '02',
    title: 'Frameworks',
    subtitle: 'Install communication systems',
    description: 'Learn named frameworks like SPARK, CLARITY, PRESENCE. Each framework is broken into missions that produce reusable artifacts.',
    color: 'from-[#51BFE3] to-[#0770C4]',
  },
  {
    number: '03',
    title: 'Techniques',
    subtitle: 'Build your toolbox',
    description: 'Configure techniques once, store them as cards, activate them in moments of stress or conflict. This is muscle memory, not insight.',
    color: 'from-[#E04305] to-[#DF890C]',
  },
  {
    number: '04',
    title: 'Dashboard',
    subtitle: 'Your communication OS',
    description: 'Your habits, scripts, recovery tools, and plans—all externalized. This is your personal communication system.',
    color: 'from-[#DF890C] to-[#E04305]',
  },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" ref={ref} className="py-20 bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#142A4A] dark:text-white mb-4">
            How TCP Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A structured system that turns self-awareness into repeatable behaviors
          </p>
        </motion.div>

        <div className="space-y-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-white dark:bg-[#000000] rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-[#0770C4] dark:hover:border-[#51BFE3] transition-colors shadow-lg">
                <div className="flex items-start gap-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-xl`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#142A4A] dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#0770C4] dark:text-[#51BFE3] font-semibold mb-3">
                      {step.subtitle}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-full h-8 w-0.5 bg-gradient-to-b from-[#0770C4]/50 to-transparent ml-7" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
