'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import StreakCelebration from '@/components/dashboard/StreakCelebration'

/** Triggers the streak Lottie celebration when URL has ?celebrate=1 (then strips the param). */
export default function StreakCelebrationTrigger() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [streakDays, setStreakDays] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (searchParams.get('celebrate') !== '1') return

    const raw = searchParams.get('streak')
    const n = raw != null ? parseInt(raw, 10) : NaN
    setStreakDays(Number.isFinite(n) && n > 0 ? n : undefined)
    setShow(true)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('celebrate')
    params.delete('streak')
    const next = params.toString() ? `${pathname}?${params}` : pathname
    router.replace(next, { scroll: false })
  }, [searchParams, router, pathname])

  const onComplete = useCallback(() => {
    setShow(false)
    setStreakDays(undefined)
  }, [])

  return <StreakCelebration show={show} streakDays={streakDays} onComplete={onComplete} />
}
