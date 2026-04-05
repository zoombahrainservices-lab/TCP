/**
 * Request-scoped guided-flow data loader.
 * Deduplicates user-specific state fetches across the hot read path.
 * 
 * Uses React's cache() to ensure auth + user responses are fetched
 * once per request instead of fanning out in Promise.all branches.
 */

import { cache } from 'react'
import { getSession } from '@/lib/auth/guards'
import { getChapterPromptAnswers } from '@/app/actions/prompts'
import { getYourTurnResponses } from '@/app/actions/yourTurn'
import { getLastCompletedPageIndex } from '@/app/actions/chapters'
import { perfLog } from '@/lib/performance/debug'

export interface GuidedFlowUserState {
  session: Awaited<ReturnType<typeof getSession>>
  isAdmin: boolean
  savedAnswers: Record<string, any>
  yourTurnByPrompt: Record<string, any>
}

/**
 * Get all user-specific state for a chapter in a single deduplicated load.
 * Cached per-request to avoid multiple auth/DB roundtrips.
 */
export const getCachedGuidedFlowUserState = cache(async (chapterNumber: number): Promise<GuidedFlowUserState> => {
  perfLog.server(`Loading user state for chapter ${chapterNumber}`)
  
  const [session, { data: savedAnswers }, yourTurnByPrompt] = await Promise.all([
    getSession(),
    getChapterPromptAnswers(chapterNumber),
    getYourTurnResponses(chapterNumber),
  ])

  const isAdmin = session?.role === 'admin'
  
  perfLog.server(`User state loaded for chapter ${chapterNumber}:`, { 
    isAdmin, 
    savedAnswersCount: Object.keys(savedAnswers || {}).length,
    yourTurnCount: Object.keys(yourTurnByPrompt || {}).length,
  })

  return {
    session,
    isAdmin,
    savedAnswers: savedAnswers || {},
    yourTurnByPrompt: yourTurnByPrompt || {},
  }
})

/**
 * Get resume position for a specific step.
 * Returns the highest completed page index or -1.
 */
export const getCachedResumePosition = cache(async (stepId: string, pageIds: string[]): Promise<number> => {
  if (pageIds.length === 0) return -1
  
  const position = await getLastCompletedPageIndex(stepId, pageIds)
  perfLog.server(`Resume position for step ${stepId}: ${position}`)
  
  return position
})
