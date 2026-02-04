'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { completeStep, completeSectionBlock } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Check if user is logged in
  const [isProcessing, setIsProcessing] = useState(false)
  const totalSlides = slideContent.length || 5

  const handleNext = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      // Award XP for completing each step
      const stepId = `CH1-READING-${currentSlide + 1}`
      
      // Call completeStep server action (awards daily/streak XP on first activity today)
      const result = await completeStep(stepId, 1)
      
      console.log('[XP] Step completion result:', result)

      // Show streak/daily XP feedback when awarded (first activity of day)
      if (result.success && result.streakResult?.xpAwarded && result.streakResult.xpAwarded > 0) {
        const codes = result.streakResult.reasonCodes || []
        const xp = result.streakResult.xpAwarded
        if (codes.includes('milestone')) {
          showXPNotification(xp, `${result.streakResult.milestoneReached}-day streak bonus!`, { reasonCode: 'milestone' })
        } else {
          showXPNotification(xp, codes.includes('streak_continued') ? 'Streak continued!' : 'Daily activity')
        }
      }
      if (result.error && 'details' in result) {
        console.error('[XP] Error:', result.error, '| Step:', (result as { step?: string }).step, '| Details:', result.details, '| Code:', result.code)
        if (typeof result.details === 'string' && result.details.toLowerCase().includes('does not exist')) {
          console.error('[XP] FIX: Run supabase/migrations/20260204_chapter_system.sql in Supabase SQL Editor')
        }
      }
      
      // Check if we just finished the last slide
      if (currentSlide === totalSlides - 1) {
        // Complete the reading section
        const sectionResult = await completeSectionBlock(1, 'reading')
        console.log('Section completion result:', sectionResult)
        
        // Show XP notification (including "Already completed" feedback)
        if (sectionResult.success) {
          const xp = sectionResult.xpResult?.xpAwarded ?? 0
          if (xp > 0) {
            showXPNotification(xp, 'Reading complete!', { reasonCode: sectionResult.reasonCode })
          } else if (sectionResult.reasonCode === 'repeat_completion') {
            showXPNotification(0, '', { reasonCode: 'repeat_completion' })
          }
        }
        
        // Navigate to assessment
        router.push('/chapter/1/assessment')
      } else {
        // Move to next slide
        setCurrentSlide(currentSlide + 1)
      }
    } catch (error) {
      console.error('Error completing step:', error)
    } finally {
      setIsProcessing(false)
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
  const contentRef = useRef<HTMLDivElement>(null)
  const readingContentRef = useRef<HTMLDivElement>(null)

  // Scroll to top when changing slides
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    readingContentRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentSlide])

  return (
    <div className="fixed inset-0 bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col">
      {/* Navbar - Logo and Close/Menu */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="relative h-10 sm:h-12 w-auto">
            <Image
              src="/TCP-logo.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-10 sm:h-12 w-auto dark:hidden"
              priority
            />
            <Image
              src="/TCP-logo-white.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-10 sm:h-12 w-auto hidden dark:block"
              priority
            />
          </div>
          
          {/* Close button (always) or Hamburger (if logged in on mobile) */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Progress bar - below navbar */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <motion.div
          className="h-full bg-[var(--color-blue)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {slideContent[currentSlide].isTitleSlide ? (
          // TITLE SLIDE - Full Screen with Dark Background
          <motion.div
            key="title-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-full w-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex flex-col relative overflow-hidden"
          >
            {/* Decorative Hollow Dots Pattern - deterministic to avoid hydration mismatch */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => {
                const seed = (i + 1) * 7919
                const w = 50 + (seed % 100)
                const h = 50 + ((seed * 31) % 100)
                const left = seed % 100
                const top = (seed * 17) % 100
                const opacity = 0.2 + ((seed % 30) / 100)
                return (
                  <div
                    key={i}
                    className="absolute rounded-full border-2 border-gray-600"
                    style={{
                      width: `${w}px`,
                      height: `${h}px`,
                      left: `${left}%`,
                      top: `${top}%`,
                      opacity
                    }}
                  />
                )
              })}
            </div>

            {/* Title Content - Centered */}
            <div className="flex-1 flex items-center justify-center relative z-10 py-12">
              <div className="text-center px-6 sm:px-12 max-w-4xl">
                <div className="mb-6 sm:mb-8">
                  <span className="text-[var(--color-amber)] text-2xl sm:text-4xl font-bold tracking-widest">
                    CHAPTER {slideContent[currentSlide].chapterNumber}
                  </span>
                </div>
                <h1 className="text-white font-bold text-4xl sm:text-6xl lg:text-7xl leading-tight mb-8 sm:mb-12">
                  {slideContent[currentSlide].title}
                </h1>
                <div className="flex items-center justify-center gap-3 mt-8 sm:mt-16">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                        i === 0 ? 'bg-[var(--color-amber)]' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="p-6 sm:p-8 border-t border-gray-700 bg-[#1a1a1a] relative z-10">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // REGULAR CONTENT SLIDES - Mobile: Image on top, Text below | Desktop: Image left, Text right
          <div className="min-h-full flex flex-col lg:flex-row lg:h-full">
            {/* Image Section - Top on mobile, Left on desktop */}
            <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:h-full lg:min-h-[400px] flex-shrink-0 relative bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                {!slideContent[currentSlide].isTitleSlide && (
                  <Image 
                    src={(slideContent[currentSlide] as ContentSlide).image}
                    alt={(slideContent[currentSlide] as ContentSlide).heading}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={100}
                    priority
                    className="object-cover"
                  />
                )}
              </motion.div>
            </div>

            {/* Text Content Section - Below on mobile, Right on desktop */}
            <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col">
              {/* Reading Content Area */}
              <div ref={readingContentRef} className="flex-1 p-6 sm:p-8 lg:p-12 overflow-auto">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto"
                >
                  {!slideContent[currentSlide].isTitleSlide && (
                    <>
                      {/* Section Heading */}
                      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)] dark:text-[#FFF8E7] mb-6 sm:mb-8">
                        {(slideContent[currentSlide] as ContentSlide).heading}
                      </h2>

                      {/* Body Text */}
                      <div 
                        className="text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose text-gray-800 dark:text-gray-200 whitespace-pre-line"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {(slideContent[currentSlide] as ContentSlide).text}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Navigation Buttons */}
              <div className="p-4 sm:p-6 lg:p-8 border-t border-[#E8D9B8] dark:border-gray-700 bg-[#FFF8E7] dark:bg-[#2A2416]">
                <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
                  {currentSlide > 0 && (
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
                    {currentSlide === totalSlides - 1 ? 'Your Turn' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
