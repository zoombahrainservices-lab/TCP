'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { followThroughScreens } from './follow-through-screens'
import { completeSectionBlock, completeChapter } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'
import { getYourTurnResponses } from '@/app/actions/yourTurn'

export default function FollowThroughFullScreenPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [yourTurnResponses, setYourTurnResponses] = useState<Record<string, import('@/app/actions/yourTurn').YourTurnResponseItem | null>>({})
  const contentRef = useRef<HTMLDivElement>(null)
  const textContentRef = useRef<HTMLDivElement>(null)
  const totalScreens = followThroughScreens.length
  const screen = followThroughScreens[currentScreen]
  const progress = ((currentScreen + 1) / totalScreens) * 100

  // Land on the right screen when coming from Your Turn
  useEffect(() => {
    const s = searchParams.get('screen')
    if (s != null) {
      const n = parseInt(s, 10)
      if (!isNaN(n) && n >= 0 && n < totalScreens) setCurrentScreen(n)
    }
  }, [searchParams, totalScreens])

  useEffect(() => {
    getYourTurnResponses(1).then(setYourTurnResponses)
  }, [])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    textContentRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentScreen])
  
  // Prefetch Your Turn URL when this screen has one
  useEffect(() => {
    if (screen.yourTurn && screen.promptKey) {
      router.prefetch(`/read/chapter-1/your-turn/follow-through/${screen.promptKey}`)
    }
  }, [currentScreen, router, screen.yourTurn, screen.promptKey])

  // Prefetch dashboard when nearing end
  useEffect(() => {
    if (currentScreen >= totalScreens - 2) {
      router.prefetch('/dashboard')
    }
  }, [currentScreen, router, totalScreens])

  const handleNext = async () => {
    if (isProcessing) return

    // If this screen has a Your Turn prompt, go to Your Turn page only if not already completed
    if (screen.yourTurn && screen.promptKey) {
      if (!yourTurnResponses[screen.promptKey]) {
        router.push(`/read/chapter-1/your-turn/follow-through/${screen.promptKey}`)
        return
      }
    }

    if (currentScreen < totalScreens - 1) {
      setCurrentScreen(currentScreen + 1)
    } else {
      // Last screen - immediately navigate, complete sections in background
      setIsProcessing(true)
      router.push('/dashboard')
      
      // Complete follow-through section AND entire chapter in background (setTimeout: browser-safe; setImmediate is Node-only)
      setTimeout(async () => {
        try {
          // Complete follow-through section
          const sectionResult = await completeSectionBlock(1, 'follow_through')
          
          console.log('[XP] Follow-through section completion result:', sectionResult)
          
          // Complete entire chapter (awards chapter bonus)
          const chapterResult = await completeChapter(1)
          
          console.log('[XP] Chapter completion result:', chapterResult)
          
          // Show streak/daily XP feedback when awarded
          if (sectionResult.success && sectionResult.streakResult?.xpAwarded && sectionResult.streakResult.xpAwarded > 0) {
            const codes = sectionResult.streakResult.reasonCodes || []
            const streakXp = sectionResult.streakResult.xpAwarded
            if (codes.includes('milestone')) {
              showXPNotification(streakXp, `${sectionResult.streakResult.milestoneReached}-day streak bonus!`, { reasonCode: 'milestone' })
            } else {
              showXPNotification(streakXp, codes.includes('streak_continued') ? 'Streak continued!' : 'Daily activity')
            }
          }
          
          // Show XP notification with total and reason feedback
          let totalXP = 0
          const sectionXP = sectionResult.success && sectionResult.xpResult ? sectionResult.xpResult.xpAwarded : 0
          const chapterXP = chapterResult.success && chapterResult.xpResult ? chapterResult.xpResult.xpAwarded : 0
          totalXP = sectionXP + chapterXP

          if (totalXP > 0) {
            showXPNotification(totalXP, 'Chapter 1 Complete! 🎉', {
              reasonCode: chapterResult.reasonCode as 'first_time' | 'repeat_completion',
            })
          } else if (sectionResult.reasonCode === 'repeat_completion' || chapterResult.reasonCode === 'repeat_completion') {
            showXPNotification(0, '', { reasonCode: 'repeat_completion' })
          }
        } catch (error) {
          console.error('[XP] Error completing follow-through:', error)
        } finally {
          setIsProcessing(false)
        }
      }, 0)
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
  // On last screen (e.g. 90-day plan): show "Continue" if Your Turn is pending, else "Back to Dashboard"
  const hasYourTurnPending = isLast && !!(screen.yourTurn && screen.promptKey && !yourTurnResponses[screen.promptKey])
  const primaryButtonLabel = isLast ? (hasYourTurnPending ? 'Continue' : 'Back to Dashboard') : 'Continue'

  return (
    <div className="fixed inset-0 bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col" style={{ height: '100dvh' }}>
      {/* Header - same as Framework / Techniques */}
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

      {/* Progress bar */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <motion.div
          className="h-full bg-[#0073ba]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Content - left panel (section number or image), text right */}
      <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="min-h-full flex flex-col lg:flex-row lg:min-h-0 lg:h-full">
          {/* Left side: image or section number panel (same workflow as other pages) */}
          {screen.image ? (
            <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:h-full lg:min-h-[400px] flex-shrink-0 relative bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden">
              <Image
                key={screen.id}
                src={screen.image}
                alt={screen.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={currentScreen === 0}
                unoptimized
              />
            </div>
          ) : (
            <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-full lg:min-h-[400px] flex-shrink-0 flex items-center justify-center bg-[#0073ba] dark:bg-[#005a9e]">
              {screen.sectionNumber != null ? (
                <div className="w-24 h-24 rounded-2xl bg-white/20 dark:bg-white/10 flex items-center justify-center border-2 border-white/40">
                  <span className="text-4xl font-black text-white">{screen.sectionNumber}</span>
                </div>
              ) : (
                <div className="text-center px-6">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    FOLLOW-THROUGH
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Text - right side */}
          <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col flex-1 min-h-0">
            <div ref={textContentRef} className="flex-1 p-6 sm:p-8 lg:p-12 overflow-auto">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)] dark:text-[#FFF8E7] mb-6 sm:mb-8">
                  {screen.title}
                </h2>
                <div className="space-y-4 text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose text-gray-800 dark:text-gray-200">
                  {screen.body}
                </div>
                {screen.yourTurn && !screen.promptKey && (
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

            {/* Navigation - same as Framework / Techniques */}
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
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-[#0073ba] hover:bg-[#005a9e] text-white shadow-md hover:shadow-lg"
                >
                  {primaryButtonLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
