'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

type TitleSlide = {
  isTitleSlide: true
  title: string
  chapterNumber: number
}

type ContentSlide = {
  isTitleSlide?: false
  image: string
  heading: string
  text: string
}

type Slide = TitleSlide | ContentSlide

const slideContent: Slide[] = [
  {
    isTitleSlide: true,
    title: 'FROM STAGE STAR TO SILENT STRUGGLES',
    chapterNumber: 1
  },
  {
    image: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    heading: 'THE MOMENT EVERYTHING CHANGED',
    text: `Tom stood in the auditorium doorway, phone glowing, thumb scrolling through TikTok. Applause for another speaker leaked through the doors—a sound he used to live for, now just background noise.

"Tom Hammond? Is Tom here tonight?"

His mom grabbed his arm. "Tom! They're calling you!"

He shrugged her off. "Just one more video."

By the time his dad grabbed the phone, the organizers had moved on. Tom, fourteen, had just missed his slot at regionals—the same competition where he'd won first place eighteen months ago.

His mom's face: pure disappointment.`
  },
  {
    image: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    heading: 'THE RISE',
    text: `Rewind three years. Tom was different.

At eleven, this sixth-grader could hold 200 people captive with just his voice. While friends ground Fortnite after school, Tom practiced speeches for two hours in front of his mirror.

By seventh grade, Tom was that kid—the one who MCed assemblies, the one everyone's parents wanted at gatherings. After winning regionals at twelve, his debate coach said: "You're going to do something big someday."

Tom believed him.`
  },
  {
    image: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    heading: 'WHAT ACTUALLY HAPPENED',
    text: `Here's what nobody tells you: what happened to Tom is happening to everyone your age. And it's not your fault.

Dr. Anna Lembke (legit psychiatrist) wrote Dopamine Nation explaining how TikTok, Instagram, and YouTube hijack your brain. Every scroll gives you dopamine—the same chemical released when you eat your favorite food or get a text from your crush.`
  },
  {
    image: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    heading: 'THE SCIENCE',
    text: `Stanford tracked 2,500 teenagers for three years. Those spending 3+ hours daily on entertainment apps showed a 60% drop in passion activities. Brain scans revealed reduced activity in the prefrontal cortex—the part handling delayed gratification.

Tom's brain: Stage performances released dopamine naturally, but required work. TikTok? Instant dopamine every 15 seconds.`
  },
  {
    image: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    heading: 'THE TRUTH',
    text: `Reality check: Average teenager gets 237 notifications daily. Takes just 66 days to rewire neural pathways.

You're not weak. You're being gamed by billion-dollar algorithms. The game is rigged.

But you can still win.`
  }
]

export default function Chapter1Page() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = slideContent.length || 5

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // Last slide - prompt to register
      router.push('/auth/register?from=chapter-1')
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleClose = () => {
    router.push('/')
  }

  const progress = (currentSlide / totalSlides) * 100

  return (
    <div className="fixed inset-0 bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden">
      {/* Top Progress Bar - Empty/Outline Style */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <motion.div
          className="h-full bg-[var(--color-blue)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Top Header - Close Button Only */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Split Screen Layout */}
      {slideContent[currentSlide].isTitleSlide ? (
        // TITLE SLIDE - Full Screen with Dark Background and Hollow Dots
        <motion.div
          key="title-slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex flex-col relative overflow-hidden"
        >
          {/* Decorative Hollow Dots Pattern */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border-2 border-gray-600"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.2
                }}
              />
            ))}
          </div>

          {/* Title Content - Centered */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="text-center px-12 max-w-6xl">
              <div className="mb-8">
                <span className="headline text-[var(--color-amber)] text-4xl tracking-widest">
                  CHAPTER {slideContent[currentSlide].chapterNumber}
                </span>
              </div>
              <h1 className="headline text-white mb-12" style={{ fontSize: '5rem', lineHeight: '1.1' }}>
                {slideContent[currentSlide].title}
              </h1>
              <div className="flex items-center justify-center gap-3 mt-16">
                <div className="w-3 h-3 rounded-full bg-[var(--color-amber)]"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Exact same as onboarding */}
          <div className="p-8 border-t border-gray-700 bg-[#1a1a1a] relative z-10">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        // REGULAR CONTENT SLIDES
        <div className="h-full flex">
          {/* LEFT SIDE - 50% Image - Full Box Fill */}
          <div className="w-1/2 h-full relative bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              {!slideContent[currentSlide].isTitleSlide && (
                <Image 
                  src={(slideContent[currentSlide] as ContentSlide).image}
                  alt={(slideContent[currentSlide] as ContentSlide).heading}
                  fill
                  quality={100}
                  priority
                  className="object-cover"
                />
              )}
            </motion.div>
          </div>

          {/* RIGHT SIDE - 50% Reading & Interactions - Paper Background */}
          <div className="w-1/2 h-full bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col">
            {/* Reading Content Area - No Scrolling */}
            <div className="flex-1 flex items-center justify-center p-12 overflow-hidden">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl w-full"
              >
                {!slideContent[currentSlide].isTitleSlide && (
                  <>
                    {/* Section Heading - Bebas Neue for headings only */}
                    <h2 className="headline-lg text-[var(--color-charcoal)] dark:text-[#FFF8E7] mb-8 tracking-wide">
                      {(slideContent[currentSlide] as ContentSlide).heading}
                    </h2>

                    {/* Body Text - Inter font, larger size */}
                    <div 
                      className="text-xl leading-loose text-gray-800 dark:text-gray-200 whitespace-pre-line"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {(slideContent[currentSlide] as ContentSlide).text}
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Navigation Buttons - Exact same as onboarding */}
            <div className="p-8 border-t border-[#E8D9B8] dark:border-gray-700 bg-[#FFF8E7] dark:bg-[#2A2416]">
              <div className="flex items-center justify-center gap-4">
                {currentSlide > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all bg-white dark:bg-gray-800 text-[var(--color-gray)] border-2 border-[var(--color-gray)] hover:border-[var(--color-charcoal)] shadow-md hover:shadow-lg"
                  >
                    Back
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg"
                >
                  {currentSlide === totalSlides - 1 ? 'Your Turn' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TCP Logo Watermark - Over Left Side */}
      <div className="absolute bottom-6 left-6 opacity-20 z-10">
        <Image 
          src="/TCP-Logo.svg" 
          alt="TCP" 
          width={150} 
          height={45} 
          className="w-36 h-auto"
        />
      </div>
    </div>
  )
}
