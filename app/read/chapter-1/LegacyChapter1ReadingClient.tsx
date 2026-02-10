'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

type Slide = {
  id: string
  title?: string
  heading: string
  body: string
}

const CH1_IMAGE = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg'

const slides: Slide[] = [
  {
    id: 'ch1_title',
    heading: 'FROM STAGE STAR TO SILENT STRUGGLES',
    body: ''
  },
  {
    id: 'ch1_moment',
    heading: 'THE MOMENT EVERYTHING CHANGED',
    body: `Tom stood in the auditorium doorway, phone glowing, thumb scrolling through TikTok. Applause for another speaker leaked through the doors—a sound he used to live for, now just background noise.

"Tom Hammond? Is Tom here tonight?"

His mom grabbed his arm. "Tom! They're calling you!"

He shrugged her off. "Just one more video."

By the time his dad grabbed the phone, the organizers had moved on. Tom, fourteen, had just missed his slot at regionals—the same competition where he'd won first place eighteen months ago.

His mom's face: pure disappointment.`
  },
  {
    id: 'ch1_rise',
    heading: 'THE RISE',
    body: `Rewind three years. Tom was different.

At eleven, this sixth-grader could hold 200 people captive with just his voice. While friends ground Fortnite after school, Tom practiced speeches for two hours in front of his mirror.

By seventh grade, Tom was that kid—the one who MCed assemblies, the one everyone's parents wanted at gatherings. After winning regionals at twelve, his debate coach said: "You're going to do something big someday."

Tom believed him.`
  },
  {
    id: 'ch1_truth',
    heading: 'THE TRUTH',
    body: `Here's what nobody tells you: what happened to Tom is happening to everyone your age. And it's not your fault.

You're not weak. You're being gamed by billion-dollar algorithms. The game is rigged.

But you can still win.`
  }
]

export default function LegacyChapter1ReadingClient() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const totalSlides = slides.length
  const currentSlide = slides[currentIndex]
  const progress = ((currentIndex + 1) / totalSlides) * 100

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      router.push('/chapter/1/assessment')
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const handleClose = () => {
    router.push('/dashboard')
  }

  return (
    <div className="fixed inset-0 bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col">
      {/* Top bar with logo + close */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="relative h-10 w-auto">
            <Image
              src="/TCP-logo.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/TCP-logo-white.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-10 w-auto hidden dark:block"
              priority
            />
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <motion.div
          className="h-full bg-[var(--color-blue)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Content: image left, text right, chunk-by-chunk */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col lg:flex-row lg:h-full">
          {/* Image */}
          <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:h-full lg:min-h-[400px] flex-shrink-0 relative bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={CH1_IMAGE}
                alt={currentSlide.heading}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={90}
                priority
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* Text */}
          <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col">
            <div className="flex-1 p-6 sm:p-8 lg:p-12 overflow-auto">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-3xl font-bold text-[var(--color-charcoal)] dark:text-white mb-6">
                  {currentSlide.heading}
                </h2>
                {currentSlide.body && (
                  <div className="text-lg font-normal text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                    {currentSlide.body.split('\n').map((line, i) => (
                      <p key={i} className={line.trimStart().startsWith('"') ? 'pl-4 sm:pl-6' : ''}>
                        {line || ' '}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Navigation buttons */}
            <div className="p-4 sm:p-6 lg:p-8 border-t border-[#E8D9B8] dark:border-gray-700 bg-[#FFF8E7] dark:bg-[#2A2416]">
              <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-white dark:bg-gray-800 text-[var(--color-gray)] border-2 border-[var(--color-gray)] hover:border-[var(--color-charcoal)] shadow-md hover:shadow-lg"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg"
                >
                  {currentIndex === totalSlides - 1 ? 'Complete' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

