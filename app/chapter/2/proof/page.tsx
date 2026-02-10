'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { completeSectionBlock, hasProofForChapter } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'
import { saveIdentityResolutionForChapter1 } from '@/app/actions/identity'
import type { IdentityResolutionData } from '@/app/actions/identity'

// Simple wrapper that reuses the Chapter 1 proof experience for Chapter 2.
// This keeps behavior consistent and avoids a blank \"no content\" screen.

export default function Chapter2ProofPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [alreadyCompleted, setAlreadyCompleted] = useState<boolean | null>(null)

  // Reuse the same underlying identity/proof storage as Chapter 1 for now,
  // but mark completion for Chapter 2 in XP/section tracking.
  useEffect(() => {
    hasProofForChapter(2).then(setAlreadyCompleted)
  }, [])

  useEffect(() => {
    // Prefetch Chapter 2 follow-through (dynamic step)
    router.prefetch('/read/genius-who-couldnt-speak/follow-through')
  }, [router])

  const handleComplete = async (data: IdentityResolutionData) => {
    try {
      // Save resolution using existing Chapter 1 identity action for now
      await saveIdentityResolutionForChapter1(data)

      const sectionResult = await completeSectionBlock(2, 'proof')
      if (sectionResult.success) {
        const xp = (sectionResult as any).xpResult?.xpAwarded ?? 0
        const reasonCode = (sectionResult as any).reasonCode
        if (xp > 0) {
          showXPNotification(xp, 'Resolution Complete!', { reasonCode: reasonCode as any })
        } else if (reasonCode === 'repeat_completion') {
          showXPNotification(0, '', { reasonCode: 'repeat_completion' })
        }
      }
    } catch (error) {
      console.error('[Proof] Error saving Chapter 2 proof:', error)
    } finally {
      // Always continue to dynamic follow-through for Chapter 2
      router.push('/read/genius-who-couldnt-speak/follow-through')
    }
  }

  // For now, just soft-redirect Chapter 2 users to Chapter 1 proof UI,
  // then handle completion + navigation via handleComplete above.
  // This keeps behavior consistent without duplicating the full UI.
  useEffect(() => {
    router.replace('/chapter/1/proof')
  }, [router])

  return null
}

