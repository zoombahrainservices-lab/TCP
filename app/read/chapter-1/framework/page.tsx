'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { frameworkScreens } from './framework-screens'
import { completeSectionBlock } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'

export default function FrameworkFullScreenPage() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const textContentRef = useRef<HTMLDivElement>(null)
  const totalScreens = frameworkScreens.length
  const screen = frameworkScreens[currentScreen]
  const progress = ((currentScreen + 1) / totalScreens) * 100

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    textContentRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentScreen])
  
  // Prefetch next page when nearing end
  useEffect(() => {
    if (currentScreen >= totalScreens - 2) {
      router.prefetch('/read/chapter-1/techniques')
    }
  }, [currentScreen, router, totalScreens])

  const handleNext = async () => {
    if (isProcessing) return
    
    if (currentScreen < totalScreens - 1) {
      setCurrentScreen(currentScreen + 1)
    } else {
      // Last screen - immediately navigate, complete section in background
      setIsProcessing(true)
      router.push('/read/chapter-1/techniques')
      
      // Complete section in background
      setImmediate(async () => {
        try {
          const result = await completeSectionBlock(1, 'framework')
          
          console.log('[XP] Framework section completion result:', result)
          
          if (result.success) {
            // Show streak/daily XP feedback when awarded
            if (result.streakResult?.xpAwarded && result.streakResult.xpAwarded > 0) {
              const codes = result.streakResult.reasonCodes || []
              const streakXp = result.streakResult.xpAwarded
              if (codes.includes('milestone')) {
                showXPNotification(streakXp, `${result.streakResult.milestoneReached}-day streak bonus!`, { reasonCode: 'milestone' })
              } else {
                showXPNotification(streakXp, codes.includes('streak_continued') ? 'Streak continued!' : 'Daily activity')
              }
            }
            
            const xp = result.xpResult?.xpAwarded ?? 0
            if (xp > 0) {
              showXPNotification(xp, 'Framework Complete!', { reasonCode: result.reasonCode })
            } else if (result.reasonCode === 'repeat_completion') {
              showXPNotification(0, '', { reasonCode: 'repeat_completion' })
            }
          }
        } catch (error) {
          console.error('[XP] Error completing framework:', error)
        } finally {
          setIsProcessing(false)
        }
      })
    }
  }

  const handlePrev = () => {
    if (currentScreen > 0) setCurrentScreen(currentScreen - 1)
  }

  const handleClose = () => {
    router.push('/dashboard')
  }

  const isFirst = currentScreen === 0
  const isLast = currentScreen === totalScreens - 1

  return (
    <div className="fixed inset-0 bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col" style={{ height: '100dvh' }}>
      {/* Header - same as Chapter 1 reading */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
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
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Progress bar - same as Chapter 1 reading */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <motion.div
          className="h-full bg-[#ff6a38]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Content - image left, text right (same layout as Chapter 1 reading) */}
      <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="min-h-full flex flex-col lg:flex-row lg:min-h-0 lg:h-full">
          {/* Image - left side (top on mobile) */}
          {screen.image && (
            <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:h-full lg:min-h-[400px] flex-shrink-0 relative bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden">
              <Image
                src={screen.image}
                alt={screen.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={currentScreen === 0}
              />
            </div>
          )}

          {/* Text - right side (below image on mobile) */}
          <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col flex-1 min-h-0">
            <div ref={textContentRef} className="flex-1 p-6 sm:p-8 lg:p-12 overflow-auto">
              <div className="max-w-3xl mx-auto">
                {screen.letter && (
                  <div className="w-12 h-12 rounded-xl bg-[#ff6a38] text-white flex items-center justify-center font-black text-xl mb-4">
                    {screen.letter}
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)] dark:text-[#FFF8E7] mb-6 sm:mb-8">
                  {screen.title}
                </h2>
                <div className="space-y-4 text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose text-gray-800 dark:text-gray-200">
                  {screen.body}
                </div>
                {screen.yourTurn && (
                  <div className="mt-8 p-6 rounded-xl bg-[#f7b418]/15 dark:bg-[#f7b418]/20 border border-[#f7b418]/40">
                    <p className="text-sm font-bold text-[var(--color-charcoal)] dark:text-white mb-2 uppercase tracking-wide">
                      Your turn
                    </p>
                    <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
                      {screen.yourTurn}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation - same as Chapter 1 reading */}
            <div className="p-4 sm:p-6 lg:p-8 border-t border-[#E8D9B8] dark:border-gray-700 bg-[#FFF8E7] dark:bg-[#2A2416] flex-shrink-0">
              <div className="flex justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
                {!isFirst && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-white dark:bg-gray-800 text-[var(--color-gray)] border-2 border-[var(--color-gray)] hover:border-[var(--color-charcoal)] shadow-md hover:shadow-lg"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-[#ff6a38] hover:bg-[#ff5a28] text-white shadow-md hover:shadow-lg"
                >
                  {isLast ? 'Continue to Techniques' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
