'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { frameworkScreens } from '@/app/read/chapter-1/framework/framework-screens'
import { techniqueScreens } from '@/app/read/chapter-1/techniques/technique-screens'
import { followThroughScreens } from '@/app/read/chapter-1/follow-through/follow-through-screens'
import { getYourTurnResponses, saveYourTurnResponse } from '@/app/actions/yourTurn'

const SECTION_CONFIG: Record<string, { title: string; href: string }> = {
  framework: { title: 'Framework', href: '/read/chapter-1/framework' },
  techniques: { title: 'Techniques', href: '/read/chapter-1/techniques' },
  'follow-through': { title: 'Follow-through', href: '/read/chapter-1/follow-through' }
}

/** Next screen URL after this Your Turn: same section at next index, or next section. */
function getContinueUrl(section: string, promptKey: string): { url: string; label: string } {
  if (section === 'framework') {
    const idx = frameworkScreens.findIndex((s) => s.promptKey === promptKey)
    const nextIdx = idx + 1
    if (nextIdx < frameworkScreens.length) {
      return { url: `/read/chapter-1/framework?screen=${nextIdx}`, label: 'Continue' }
    }
    return { url: '/read/chapter-1/techniques', label: 'Continue to Techniques' }
  }
  if (section === 'techniques') {
    const idx = techniqueScreens.findIndex((s) => s.promptKey === promptKey)
    const nextIdx = idx + 1
    if (nextIdx < techniqueScreens.length) {
      return { url: `/read/chapter-1/techniques?screen=${nextIdx}`, label: 'Continue' }
    }
    return { url: '/read/chapter-1/follow-through', label: 'Continue to Follow-through' }
  }
  if (section === 'follow-through') {
    const idx = followThroughScreens.findIndex((s) => s.promptKey === promptKey)
    const nextIdx = idx + 1
    if (nextIdx < followThroughScreens.length) {
      return { url: `/read/chapter-1/follow-through?screen=${nextIdx}`, label: 'Continue' }
    }
    return { url: '/dashboard', label: 'Finish' }
  }
  return { url: '/read/chapter-1', label: 'Continue' }
}

function getPromptForSection(
  section: string,
  promptKey: string
): { promptText: string; screenTitle?: string; image?: string; letter?: string; options?: string[] } | null {
  const key = promptKey
  if (section === 'framework') {
    const screen = frameworkScreens.find((s) => s.promptKey === key)
    return screen?.yourTurn
      ? { promptText: screen.yourTurn, screenTitle: screen.title, image: screen.image, letter: screen.letter }
      : null
  }
  if (section === 'techniques') {
    const screen = techniqueScreens.find((s) => s.promptKey === key)
    return screen?.yourTurn
      ? { promptText: screen.yourTurn, screenTitle: screen.title, image: screen.image }
      : null
  }
  if (section === 'follow-through') {
    const screen = followThroughScreens.find((s) => s.promptKey === key)
    return screen?.yourTurn
      ? {
          promptText: screen.yourTurn,
          screenTitle: screen.title,
          image: screen.image,
          options: screen.yourTurnOptions,
        }
      : null
  }
  return null
}

export default function YourTurnPage() {
  const params = useParams()
  const router = useRouter()
  const section = (params?.section as string) ?? ''
  const promptKey = (params?.promptKey as string) ?? ''
  const [text, setText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [existingResponse, setExistingResponse] = useState<import('@/app/actions/yourTurn').YourTurnResponseItem | null>(null)

  const config = SECTION_CONFIG[section]
  const promptInfo = getPromptForSection(section, promptKey)
  const continueTo = getContinueUrl(section, promptKey)

  // Prefetch continue target so "Continue" is instant
  useEffect(() => {
    if (continueTo?.url) router.prefetch(continueTo.url)
  }, [continueTo?.url, router])

  // If already responded for this prompt, redirect in background (don't block UI)
  useEffect(() => {
    if (!promptKey) return
    getYourTurnResponses(1).then((r) => {
      const resp = r[promptKey] ?? null
      setExistingResponse(resp)
      if (resp) router.push(continueTo.url)
    })
  }, [promptKey, continueTo.url, router])

  const handleContinue = async () => {
    const trimmed = text.trim()
    if (trimmed) {
      setIsSaving(true)
      try {
        await saveYourTurnResponse(1, promptKey, trimmed, promptInfo!.promptText)
      } catch (e) {
        console.error('Save error:', e)
      } finally {
        setIsSaving(false)
      }
    }
    router.push(continueTo.url)
  }

  const handleClose = () => router.push('/dashboard')

  if (!config || !promptInfo) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] dark:bg-[#2A2416] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">This Your Turn prompt wasn’t found.</p>
          <Link
            href="/read/chapter-1"
            className="inline-flex items-center gap-2 text-[#ff6a38] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Chapter 1
          </Link>
        </div>
      </div>
    )
  }

  // If we discovered an existing response, redirect happens in useEffect; show form until then
  return (
    <div className="fixed inset-0 w-full bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col" style={{ height: '100dvh', maxHeight: '-webkit-fill-available' }}>
      {/* Top navbar - white bg, logo left, close right */}
      <header className="flex-shrink-0 w-full bg-white dark:bg-[#0a1628] border-b border-gray-100 dark:border-gray-800 shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="relative h-9 sm:h-10 w-auto">
            <Image
              src="/TCP-logo.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-9 sm:h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/TCP-logo-white.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-9 sm:h-10 w-auto hidden dark:block"
              priority
            />
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Progress bar - same as content pages */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <div className="h-full bg-[#ff6a38] w-1/3" />
      </div>

      {/* Content - image left, text + input right (mobile: scrollable right column) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          {/* Image - left side (same as Framework) */}
          {promptInfo.image && (
            <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-full lg:min-h-[400px] flex-shrink-0 relative bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden">
              <Image
                src={promptInfo.image}
                alt={promptInfo.screenTitle ?? 'Your Turn'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          )}

          {/* Text + input - right side (same beige column as S page) */}
          <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 p-6 sm:p-8 lg:p-12 min-h-0 reading-scroll">
              <div className="max-w-3xl mx-auto">
                {promptInfo.letter && (
                  <div className="w-12 h-12 rounded-xl bg-[#ff6a38] text-white flex items-center justify-center font-black text-xl mb-4">
                    {promptInfo.letter}
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)] dark:text-[#FFF8E7] mb-6 sm:mb-8">
                  Your Turn
                </h2>
                <p className="text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose text-gray-800 dark:text-gray-200 mb-6">
                  {promptInfo.promptText}
                </p>
                {promptInfo.options && promptInfo.options.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-gray-300 mb-2">
                      Pick ONE thing:
                    </p>
                    <ul className="space-y-2">
                      {promptInfo.options.map((option) => (
                        <li key={option}>
                          <button
                            type="button"
                            onClick={() => setText(option)}
                            className="w-full text-left px-4 py-3 rounded-xl border-2 border-[#E8D9B8] dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--color-charcoal)] dark:text-gray-200 hover:border-[#ff6a38] hover:bg-amber-50/50 dark:hover:bg-gray-700/80 transition-colors text-sm sm:text-base"
                          >
                            {option}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write your response..."
                  rows={5}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#E8D9B8] dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--color-charcoal)] dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6a38] focus:border-transparent resize-none text-base"
                />
              </div>
            </div>

            {/* Navigation - inside right panel */}
            <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-t border-[#E8D9B8] dark:border-gray-700 bg-[#FFF8E7] dark:bg-[#2A2416] safe-area-pb">
              <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
                <Link
                  href={config.href}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation flex items-center justify-center"
                >
                  Previous
                </Link>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isSaving}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-[#FF6B35] hover:bg-[#FF5722] text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation"
                >
                  {isSaving ? 'Saving...' : continueTo.label}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
