'use client'

import { useEffect, useRef, useState } from 'react'

const DOTLOTTIE_SRC = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js'
const STREAK_LOTTIE_SRC =
  'https://lottie.host/0e1b9423-9637-46c7-bd16-5fd873004565/aR1qrBbJrP.lottie'

/** Overlay + celebration window (matches one-shot Lottie timing) */
const CELEBRATION_MS = 3000

let dotlottieLoadPromise: Promise<void> | null = null

/**
 * Ensures dotlottie-wc is registered. Module scripts must finish evaluating
 * before createElement('dotlottie-wc') works — onLoad alone is not enough with next/script.
 */
function ensureDotlottieWc(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (customElements.get('dotlottie-wc')) return Promise.resolve()

  if (!dotlottieLoadPromise) {
    dotlottieLoadPromise = new Promise((resolve, reject) => {
      const id = 'tcp-dotlottie-wc-script'
      const existing = document.getElementById(id)

      const waitDefined = () =>
        customElements.whenDefined('dotlottie-wc').then(() => resolve())

      if (existing) {
        void waitDefined().catch(() =>
          reject(new Error('dotlottie-wc did not register'))
        )
        return
      }

      const s = document.createElement('script')
      s.id = id
      s.type = 'module'
      s.src = DOTLOTTIE_SRC
      s.async = true
      s.onload = () => {
        void waitDefined().catch(() =>
          reject(new Error('dotlottie-wc did not register after load'))
        )
      }
      s.onerror = () => {
        dotlottieLoadPromise = null
        reject(new Error('Failed to load dotlottie-wc'))
      }
      document.head.appendChild(s)
    })
  }

  return dotlottieLoadPromise
}

interface StreakCelebrationProps {
  show: boolean
  /** Current streak count — shown as “Day N Streak” below the animation */
  streakDays?: number
  onComplete?: () => void
}

export default function StreakCelebration({ show, streakDays, onComplete }: StreakCelebrationProps) {
  const celebrationRef = useRef<HTMLDivElement>(null)
  const [playerReady, setPlayerReady] = useState(false)

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(() => onComplete(), CELEBRATION_MS)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  useEffect(() => {
    if (!show) {
      setPlayerReady(false)
      return
    }

    const container = celebrationRef.current
    if (!container) return

    let cancelled = false

    const run = async () => {
      try {
        await ensureDotlottieWc()
      } catch {
        if (cancelled || !celebrationRef.current) return
        setPlayerReady(false)
        return
      }

      if (cancelled || !celebrationRef.current) return

      const host = celebrationRef.current
      host.innerHTML = ''

      const lottieElement = document.createElement('dotlottie-wc')
      lottieElement.setAttribute('src', STREAK_LOTTIE_SRC)
      lottieElement.setAttribute('autoplay', 'true')
      lottieElement.setAttribute('loop', 'false')
      lottieElement.style.display = 'block'
      lottieElement.style.width = '300px'
      lottieElement.style.height = '300px'

      host.appendChild(lottieElement)
      setPlayerReady(true)
    }

    void run()

    return () => {
      cancelled = true
      if (celebrationRef.current) {
        celebrationRef.current.innerHTML = ''
      }
      setPlayerReady(false)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex animate-in zoom-in-95 duration-500 flex-col items-center">
        {/* Lottie / dotlottie animation — above the text */}
        <div
          ref={celebrationRef}
          className="flex h-[300px] w-[300px] shrink-0 items-center justify-center [&_dotlottie-wc]:block"
          aria-busy={!playerReady}
        />

        {/* Text below the fire */}
        <div className="pointer-events-none -mt-2 max-w-[min(100vw-2rem,360px)] px-4 text-center">
          <h2 className="mb-1 text-3xl font-black text-white drop-shadow-lg sm:text-4xl animate-in slide-in-from-bottom-4 duration-700 delay-300">
            🔥 Streak!
          </h2>
          {typeof streakDays === 'number' && streakDays > 0 && (
            <p
              className="mb-2 text-2xl font-black tracking-tight text-orange-400 drop-shadow-[0_0_20px_rgba(249,115,22,0.55),0_2px_4px_rgba(0,0,0,0.5)] sm:text-3xl animate-in slide-in-from-bottom-4 duration-700 delay-[400ms]"
              aria-live="polite"
            >
              Day {streakDays} Streak
            </p>
          )}
          <p className="text-lg text-white/90 drop-shadow-md sm:text-xl animate-in slide-in-from-bottom-4 duration-700 delay-500">
            Keep it going!
          </p>
        </div>
      </div>
    </div>
  )
}
