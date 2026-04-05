/**
 * Server action to get resolution copy for a chapter.
 * Used by the Resolution page to server-seed content instead of client-fetching.
 */

'use server'

import { createClient } from '@/lib/supabase/server'

export interface ResolutionCopyData {
  headingTitle: string
  headingSubtitle: string
  exampleText: string
  proofTitle: string
  proofSubtitle: string
  proofLabel: string
  proofPlaceholder: string
}

export async function getResolutionCopy(chapterNumber: number): Promise<ResolutionCopyData> {
  // Default copy for backward compatibility (Chapter 1 original)
  const defaultCopy: ResolutionCopyData = {
    headingTitle: 'Identity Resolution',
    headingSubtitle: `This is your anchor statement for Chapter ${chapterNumber}. Use it as inspiration for one of your proof entries below.`,
    exampleText: 'Loading your chapter-specific guidance...',
    proofTitle: 'Write Your Response',
    proofSubtitle: 'Use this space to document your progress and proof.',
    proofLabel: 'Proof',
    proofPlaceholder: 'Write your proof here...',
  }

  try {
    const supabase = await createClient()

    // Find the chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id')
      .eq('chapter_number', chapterNumber)
      .single()

    if (chapterError || !chapter) {
      console.warn('[Resolution Copy] Chapter not found:', chapterNumber)
      return defaultCopy
    }

    // Find the resolution step for this chapter
    const { data: resolutionStep, error: stepError } = await supabase
      .from('chapter_steps')
      .select('id')
      .eq('chapter_id', chapter.id)
      .eq('step_type', 'resolution')
      .maybeSingle()

    if (stepError || !resolutionStep) {
      console.warn('[Resolution Copy] No resolution step for chapter:', chapterNumber)
      return defaultCopy
    }

    // Get the first page of the resolution step
    const { data: resolutionPage, error: pageError } = await supabase
      .from('step_pages')
      .select('content')
      .eq('step_id', resolutionStep.id)
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (pageError || !resolutionPage) {
      console.warn('[Resolution Copy] No resolution page for chapter:', chapterNumber)
      return defaultCopy
    }

    // Parse the content blocks
    let blocks: any[] = []
    if (Array.isArray(resolutionPage.content)) {
      blocks = resolutionPage.content
    } else if (typeof resolutionPage.content === 'string') {
      try {
        blocks = JSON.parse(resolutionPage.content)
      } catch {
        blocks = []
      }
    }

    // Extract guidance and proof copy from blocks
    const guidanceBlock = blocks.find((b: any) => b?.type === 'identity_resolution_guidance')
    const proofBlock = blocks.find((b: any) => b?.type === 'resolution_proof')

    const result = { ...defaultCopy }

    if (guidanceBlock) {
      if (typeof guidanceBlock.title === 'string' && guidanceBlock.title.trim()) {
        result.headingTitle = guidanceBlock.title.trim()
      }
      if (typeof guidanceBlock.subtitle === 'string' && guidanceBlock.subtitle.trim()) {
        result.headingSubtitle = guidanceBlock.subtitle.trim()
      }
      if (typeof guidanceBlock.exampleText === 'string' && guidanceBlock.exampleText.trim()) {
        result.exampleText = guidanceBlock.exampleText.trim()
      }
    }

    if (proofBlock) {
      if (typeof proofBlock.title === 'string' && proofBlock.title.trim()) {
        result.proofTitle = proofBlock.title.trim()
      }
      if (typeof proofBlock.subtitle === 'string' && proofBlock.subtitle.trim()) {
        result.proofSubtitle = proofBlock.subtitle.trim()
      }
      if (typeof proofBlock.label === 'string' && proofBlock.label.trim()) {
        result.proofLabel = proofBlock.label.trim()
      }
      if (typeof proofBlock.placeholder === 'string' && proofBlock.placeholder.trim()) {
        result.proofPlaceholder = proofBlock.placeholder.trim()
      }
    }

    return result
  } catch (error) {
    console.error('[Resolution Copy] Error fetching resolution copy:', error)
    return defaultCopy
  }
}
