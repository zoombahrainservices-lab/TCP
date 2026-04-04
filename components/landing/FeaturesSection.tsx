'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: 'Learn Through Real Situations',
    description:
      'TCP teaches through stories, examples, and moments that feel real — like texting, school, friendships, and difficult conversations.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    title: 'Tools You Can Use in the Moment',
    description:
      'You don’t just learn ideas. You save simple steps, scripts, and tools you can use when you need them most.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: 'See Your Progress',
    description:
      'Track how you respond, improve over time, and build better communication habits step by step.',
  },
]

const previews = [
  {
    label: 'Learn',
    title: 'Lesson View',
    description: 'Where you learn from a real scenario.',
    mock: (
      <div className="flex flex-col gap-2 p-4 h-full justify-center">
        <div className="h-2 w-3/4 rounded-full bg-[#0770C4]/25 dark:bg-[#51BFE3]/30" />
        <div className="h-2 w-full rounded-full bg-gray-200/80 dark:bg-white/15" />
        <div className="h-2 w-5/6 rounded-full bg-gray-200/80 dark:bg-white/15" />
        <div className="mt-3 self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0770C4]/15 dark:bg-[#51BFE3]/20 px-3 py-2">
          <div className="h-1.5 w-24 rounded-full bg-[#0770C4]/40 dark:bg-[#51BFE3]/50" />
        </div>
        <div className="self-start max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-200/60 dark:bg-white/10 px-3 py-2">
          <div className="h-1.5 w-28 rounded-full bg-gray-400/50 dark:bg-white/25" />
        </div>
      </div>
    ),
  },
  {
    label: 'Save',
    title: 'Tool Card',
    description: 'Where you save a framework or script.',
    mock: (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="w-full rounded-xl border-2 border-dashed border-[#0770C4]/35 dark:border-[#51BFE3]/40 bg-white/60 dark:bg-[#0d2138]/80 p-4 shadow-sm">
          <div className="h-2 w-1/3 rounded-full bg-[#ff6a38]/40 mb-3" />
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/15" />
            <div className="h-1.5 w-11/12 rounded-full bg-gray-200 dark:bg-white/15" />
            <div className="h-1.5 w-4/5 rounded-full bg-gray-200 dark:bg-white/15" />
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'Use',
    title: 'Progress View',
    description: 'Where you see what you’re improving.',
    mock: (
      <div className="flex flex-col gap-3 p-5 h-full justify-center">
        <div className="flex items-end gap-2 h-24">
          <div className="flex-1 rounded-t-md bg-[#0770C4]/30 dark:bg-[#51BFE3]/35 h-[45%]" />
          <div className="flex-1 rounded-t-md bg-[#0770C4]/45 dark:bg-[#51BFE3]/50 h-[70%]" />
          <div className="flex-1 rounded-t-md bg-[#ff6a38]/40 h-[55%]" />
          <div className="flex-1 rounded-t-md bg-[#0770C4]/55 dark:bg-[#51BFE3]/60 h-[90%]" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200/80 dark:bg-white/10" />
        <div className="h-1.5 w-4/5 rounded-full bg-gray-200/80 dark:bg-white/10" />
      </div>
    ),
  },
] as const

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#000000] transition-colors duration-300 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#142A4A] dark:text-white mb-4">
            What Makes TCP Different
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            TCP doesn’t just tell you what to do. It helps you practice it, save it, and use it when it matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-gray-50 dark:bg-[#142A4A] rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-[#0770C4] dark:hover:border-[#51BFE3] transition-all hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#0770C4] to-[#51BFE3] rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#142A4A] dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mt-20 md:mt-24 pt-16 border-t border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center text-[#142A4A] dark:text-white mb-12">
            See TCP in Action
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            {previews.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.45 + index * 0.08 }}
                className="flex flex-col"
              >
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-100/90 to-gray-50 dark:from-[#142A4A] dark:to-[#0d2138] shadow-md aspect-[4/3]">
                  <span className="absolute top-3 left-3 z-10 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#0770C4] text-white dark:bg-[#51BFE3] dark:text-[#0d2138]">
                    {item.label}
                  </span>
                  <div className="absolute inset-0 pt-10">{item.mock}</div>
                </div>
                <h4 className="mt-4 text-lg font-bold text-[#142A4A] dark:text-white">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
