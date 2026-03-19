'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAllChapters } from '@/lib/content/queries'
import { getAssessmentConfig } from '@/lib/reports/assessmentConfig'

// ============================================================================
// TYPES
// ============================================================================

export type AssessmentReportData = {
  chapterId: number
  chapterTitle: string
  assessmentType: string
  score: number
  maxScore: number
  completedAt: string
  questions: Array<{
    id: number | string
    question: string
    low: string
    high: string
    userResponse: number
    maxValue: number
    responseLabel?: string
  }>
}

export type YourTurnQandA = {
  promptText: string | null
  responseText: string
  createdAt: string
}

export type ResolutionReportData = {
  chapterId: number
  chapterTitle: string
  completedAt: string
  identityResolution?: string
  proofs: Array<{
    type: 'text' | 'image' | 'audio' | 'video'
    title: string
    notes: string
    storagePath?: string
    createdAt: string
  }>
  /** Your Turn Q&A grouped by category for the PDF */
  yourTurnByCategory: {
    framework: YourTurnQandA[]
    techniques: YourTurnQandA[]
    followThrough: YourTurnQandA[]
  }
  /** Available questions even if no answers */
  availableQuestions?: {
    framework: Array<{ id: string; label: string }>
    techniques: Array<{ id: string; label: string }>
    followThrough: Array<{ id: string; label: string }>
  }
}

export type ChapterReportMeta = {
  chapterId: number
  title: string
  status: 'available' | 'locked' | 'pending'
  assessmentAvailable: boolean
  resolutionAvailable: boolean
}

// ============================================================================
// CHAPTER ASSESSMENT CONFIG (questions + title per chapter for reports)
// ============================================================================

const ASSESSMENT_CONFIG: Record<
  number,
  { chapterTitle: string; questions: Array<{ id: number; question: string; low: string; high: string }>; maxScore: number }
> = {
  1: {
    chapterTitle: 'Chapter 1: From Stage Star to Silent Struggles',
    maxScore: 49,
    questions: [
      { id: 1, question: 'How often I grab phone when working', low: 'Rarely', high: 'Constantly' },
      { id: 2, question: "Remember yesterday's scrolling", low: 'Yes', high: 'Barely' },
      { id: 3, question: 'Feel after phone session', low: 'Energized', high: 'Empty' },
      { id: 4, question: 'Time on passion this year', low: 'More', high: 'Abandoned' },
      { id: 5, question: 'Time before phone urge', low: '30+ min', high: 'Under 5' },
      { id: 6, question: 'Use phone to avoid feelings', low: 'Rarely', high: 'Always' },
      { id: 7, question: 'Phone vanished 24hrs', low: 'Relieved', high: 'Panicked' },
    ],
  },
  2: {
    chapterTitle: 'Chapter 2: The Genius Who Couldn\'t Speak',
    maxScore: 28,
    questions: [
      { id: 1, question: 'I avoid speaking situations when possible', low: 'Rarely', high: 'Always' },
      { id: 2, question: 'My mind goes blank when speaking', low: 'Never', high: 'Every time' },
      { id: 3, question: 'Physical symptoms (shaking/racing heart) overwhelm me', low: 'Manageable', high: 'Paralyzing' },
      { id: 4, question: 'I catastrophize what could go wrong', low: 'Rarely', high: 'Constantly' },
    ],
  },
}

// NOTE: getAssessmentConfig has been moved to `lib/reports/assessmentConfig` so this
// server-actions file only exports async functions.

// ============================================================================
// GET CHAPTERS FOR REPORTS PAGE (with availability per chapter)
// ============================================================================

export async function getChaptersForReports(): Promise<
  { success: true; data: ChapterReportMeta[] } | { success: false; error: string }
> {
  try {
    const userSupabase = await createClient()
    const supabase = createAdminClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const chapters = await getAllChapters()
    if (!chapters?.length) {
      return { success: true, data: [] }
    }

    const chapterNumbers = chapters.map((c) => c.chapter_number as number)

    // Get user's current chapter progress to determine which reports to show
    const { data: progressRows } = await supabase
      .from('chapter_progress')
      .select('chapter_id')
      .eq('user_id', user.id)
      .order('chapter_id', { ascending: false })
      .limit(1)

    // Determine current chapter: highest chapter user has started, or 1 if none
    let currentChapter = 1
    if (progressRows && progressRows.length > 0) {
      currentChapter = progressRows[0].chapter_id
    }

    // Only show reports for chapters < currentChapter (all previous completed chapters)
    const eligibleChapterNumbers = chapterNumbers.filter(n => n < currentChapter)

    if (eligibleChapterNumbers.length === 0) {
      return { success: true, data: [] }
    }

    const [assessmentsRows, artifactsRows] = await Promise.all([
      supabase
        .from('assessments')
        .select('chapter_id')
        .eq('user_id', user.id)
        .eq('kind', 'baseline')
        .in('chapter_id', eligibleChapterNumbers),
      supabase
        .from('artifacts')
        .select('chapter_id, type')
        .eq('user_id', user.id)
        .in('chapter_id', eligibleChapterNumbers),
    ])

    const hasAssessment = new Set((assessmentsRows.data ?? []).map((r) => r.chapter_id))
    const hasResolution = new Set(
      (artifactsRows.data ?? []).filter((r) => r.type === 'identity_resolution' || r.type === 'proof').map((r) => r.chapter_id)
    )

    // Filter chapters to only include those < currentChapter
    const eligibleChapters = chapters.filter(ch => {
      const chNum = ch.chapter_number as number
      return chNum < currentChapter
    })

    const data: ChapterReportMeta[] = eligibleChapters.map((ch) => {
      const chapterId = ch.chapter_number as number
      const assessmentAvailable = hasAssessment.has(chapterId)
      const resolutionAvailable = hasResolution.has(chapterId)
      const status: ChapterReportMeta['status'] =
        assessmentAvailable || resolutionAvailable ? 'available' : 'pending'
      return {
        chapterId,
        title: (ch.title as string) ?? `Chapter ${chapterId}`,
        status,
        assessmentAvailable,
        resolutionAvailable,
      }
    })

    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// FETCH ASSESSMENT REPORT DATA (always scoped to authenticated user)
// ============================================================================

async function buildDynamicAssessmentQuestions(
  supabase: ReturnType<typeof createAdminClient>,
  chapterId: number,
  responses: Record<string, unknown>
) {
  const { data: chapterRow } = await supabase
    .from('chapters')
    .select('id, title, chapter_number')
    .eq('chapter_number', chapterId)
    .limit(1)
    .maybeSingle()

  if (!chapterRow?.id) {
    return { chapterTitle: `Chapter ${chapterId}`, questions: [] as AssessmentReportData['questions'] }
  }

  const { data: stepRows } = await supabase
    .from('chapter_steps')
    .select('id')
    .eq('chapter_id', chapterRow.id)
    .eq('step_type', 'self_check')
    .order('order_index', { ascending: true })
    .limit(1)

  const stepId = stepRows?.[0]?.id
  if (!stepId) {
    return { chapterTitle: String(chapterRow.title || `Chapter ${chapterId}`), questions: [] as AssessmentReportData['questions'] }
  }

  const { data: pages } = await supabase
    .from('step_pages')
    .select('content')
    .eq('step_id', stepId)
    .order('order_index', { ascending: true })

  const questions: AssessmentReportData['questions'] = []
  let scaleIndex = 1

  for (const page of pages || []) {
    const pageRecord = page as { content?: unknown }
    const blocks = Array.isArray(pageRecord.content) ? pageRecord.content : []
    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue
      const blockRecord = block as Record<string, unknown>

      if (blockRecord.type === 'scale_questions') {
        const scaleBlock = blockRecord
        const blockQuestions = Array.isArray(scaleBlock.questions) ? scaleBlock.questions : []
        const scaleMeta =
          scaleBlock.scale && typeof scaleBlock.scale === 'object'
            ? (scaleBlock.scale as Record<string, unknown>)
            : {}
        const maxValue =
          typeof scaleMeta.max === 'number' && scaleMeta.max > 0
            ? scaleMeta.max
            : 7
        const low = String(scaleMeta.minLabel || 'Low')
        const high = String(scaleMeta.maxLabel || 'High')

        for (const q of blockQuestions) {
          if (!q || typeof q !== 'object') continue
          const qRecord = q as Record<string, unknown>
          const questionText = String(qRecord.text || qRecord.question || '').trim()
          const answerKeyCandidates = [String(scaleIndex), scaleIndex]
          const numericResponseRaw =
            responses[answerKeyCandidates[0]] ?? responses[String(answerKeyCandidates[1])]
          const numericResponse = typeof numericResponseRaw === 'number' ? numericResponseRaw : Number(numericResponseRaw || 0)
          questions.push({
            id: scaleIndex,
            question: questionText || `Question ${scaleIndex}`,
            low,
            high,
            userResponse: Number.isFinite(numericResponse) ? numericResponse : 0,
            maxValue,
          })
          scaleIndex += 1
        }
      }

      if (blockRecord.type === 'mcq') {
        const mcqBlock = blockRecord
        const blockQuestions = Array.isArray(mcqBlock.questions) ? mcqBlock.questions : []
        for (const q of blockQuestions) {
          if (!q || typeof q !== 'object') continue
          const qRecord = q as Record<string, unknown>
          const qId = String(qRecord.id || `mcq_${questions.length + 1}`)
          const questionText = String(qRecord.text || '').trim()
          const options = Array.isArray(qRecord.options) ? qRecord.options : []
          const selectedOptionId = String(responses[qId] ?? '')
          const selectedOption = options.find((opt) => {
            if (!opt || typeof opt !== 'object') return false
            return String((opt as Record<string, unknown>).id || '') === selectedOptionId
          }) as Record<string, unknown> | undefined
          const correctOptionId = String(qRecord.correctOptionId || '')
          const hasCorrect = correctOptionId.trim().length > 0
          const isCorrect = hasCorrect && selectedOptionId && selectedOptionId === correctOptionId

          questions.push({
            id: qId,
            question: questionText || `Question ${questions.length + 1}`,
            low: hasCorrect ? 'Incorrect' : 'No response',
            high: hasCorrect ? 'Correct' : 'Answered',
            userResponse: hasCorrect ? (isCorrect ? 1 : 0) : (selectedOptionId ? 1 : 0),
            maxValue: 1,
            responseLabel: hasCorrect
              ? (isCorrect ? 'Correct' : 'Incorrect')
              : (selectedOption?.text ? `Selected: ${String(selectedOption.text)}` : 'No response'),
          })
        }
      }
    }
  }

  return {
    chapterTitle: String(chapterRow.title || `Chapter ${chapterId}`),
    questions,
  }
}

export async function getAssessmentReportData(
  chapterId: number
): Promise<{ success: true; data: AssessmentReportData } | { success: false; error: string }> {
  try {
    const supabase = createAdminClient()
    const userSupabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Try to fetch from assessments table first (new format)
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('kind', 'baseline')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (assessmentError) {
      console.error('Error fetching assessment:', assessmentError)
    }

    // Fallback: Check user_prompt_answers table (legacy format)
    let assessmentFromPrompts = null
    if (!assessment) {
      const { data: promptData } = await supabase
        .from('user_prompt_answers')
        .select('answer')
        .eq('user_id', user.id)
        .eq('prompt_key', `ch${chapterId}_self_check_baseline`)
        .maybeSingle()

      if (promptData?.answer) {
        assessmentFromPrompts = {
          responses: promptData.answer.answers || {},
          score: promptData.answer.totalScore || 0,
          created_at: promptData.answer.completedAt || new Date().toISOString(),
        }
      }
    }

    const finalAssessment = assessment || assessmentFromPrompts

    if (!finalAssessment) {
      return { success: false, error: 'No assessment found for this chapter' }
    }

    const config = getAssessmentConfig(chapterId, `Chapter ${chapterId}`)
    const responses = (finalAssessment.responses as Record<string, unknown>) || {}

    let questionsWithResponses: AssessmentReportData['questions'] = []
    let chapterTitle = config.chapterTitle
    let maxScore = config.maxScore

    if (config.questions.length > 0) {
      questionsWithResponses = config.questions.map((q) => {
        const raw = responses[String(q.id)]
        const userResponse = typeof raw === 'number' ? raw : Number(raw || 0)
        return {
          ...q,
          userResponse: Number.isFinite(userResponse) ? userResponse : 0,
          maxValue: 7,
        }
      })
    } else {
      const dynamic = await buildDynamicAssessmentQuestions(supabase, chapterId, responses)
      chapterTitle = dynamic.chapterTitle
      questionsWithResponses = dynamic.questions
      maxScore = questionsWithResponses.reduce((sum, q) => sum + (q.maxValue || 0), 0)
      if (!questionsWithResponses.length) {
        return { success: false, error: 'No assessment questions found for this chapter' }
      }
    }

    const computedScore = questionsWithResponses.reduce((sum, q) => sum + (q.userResponse || 0), 0)

    const reportData: AssessmentReportData = {
      chapterId,
      chapterTitle,
      assessmentType: 'Self-Check (Baseline)',
      score: typeof finalAssessment.score === 'number' ? finalAssessment.score : computedScore,
      maxScore,
      completedAt: finalAssessment.created_at,
      questions: questionsWithResponses,
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error('Error in getAssessmentReportData:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// FETCH RESOLUTION REPORT DATA (always scoped to authenticated user)
// ============================================================================

export async function getResolutionReportData(
  chapterId: number
): Promise<{ success: true; data: ResolutionReportData } | { success: false; error: string }> {
  try {
    const supabase = createAdminClient()
    const userSupabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    console.log(`[getResolutionReportData] ===== STARTING CHAPTER ${chapterId} =====`)
    console.log(`[getResolutionReportData] User ID: ${user.id}`)

    // APPROACH 1: Get chapter info first
    console.log(`[getResolutionReportData] APPROACH 1: Fetching chapter info...`)
    const { data: chapterInfo } = await supabase
      .from('chapters')
      .select('id, title, slug, chapter_number')
      .eq('chapter_number', chapterId)
      .single()
    
    console.log(`  Chapter found:`, chapterInfo ? `${chapterInfo.title} [${chapterInfo.id}]` : 'NOT FOUND')

    // APPROACH 2: Fetch ALL pages and find by multiple methods
    console.log(`[getResolutionReportData] APPROACH 2: Fetching all pages...`)
    const { data: allPages, error: pagesError } = await supabase
      .from('step_pages')
      .select('id, title, slug, content, page_type, step_id')
      .limit(2000)

    console.log(`[getResolutionReportData] Pages query result:`)
    console.log(`  - Found ${allPages?.length || 0} pages total`)
    console.log(`  - Error: ${pagesError ? JSON.stringify(pagesError) : 'none'}`)

    // APPROACH 3: Extract prompts using multiple detection methods
    const frameworkQuestions: Array<{ id: string; label: string }> = []
    const techniquesQuestions: Array<{ id: string; label: string }> = []
    const followThroughQuestions: Array<{ id: string; label: string }> = []
    const promptQuestionsMap = new Map<string, string>()

    let totalPromptsFound = 0
    let pagesWithPromptsForChapter = 0

    for (const page of allPages ?? []) {
      const content = page.content as any[]
      if (!Array.isArray(content)) continue
      
      const slug = (page.slug || '').toLowerCase()
      const title = (page.title || '').toLowerCase()
      const pageType = (page.page_type || '').toLowerCase()
      
      // APPROACH 4: Multiple detection methods
      // Method 1: Check page metadata
      const hasChapterInMetadata = 
        slug.includes(`chapter-${chapterId}`) || 
        slug.includes(`ch${chapterId}`) ||
        title.includes(`chapter ${chapterId}`)
      
      // Method 2: Check prompts inside for chapter reference
      let hasChapterInPrompts = false
      let promptsInThisPage = 0
      
      for (const block of content) {
        if (block.type === 'prompt' && block.id && block.label) {
          promptsInThisPage++
          totalPromptsFound++
          
          // Check if prompt references this chapter
          if (block.id.includes(`ch${chapterId}_`) || 
              block.id.includes(`_${chapterId}_`) ||
              block.id.includes(`chapter${chapterId}`)) {
            hasChapterInPrompts = true
          }
          
          // Store all prompts for potential use
          promptQuestionsMap.set(block.id, block.label)
        }
      }
      
      // APPROACH 5: If page seems relevant, extract ALL its prompts
      const pageIsRelevant = hasChapterInMetadata || hasChapterInPrompts || 
                             (promptsInThisPage > 0 && (
                               slug.includes('framework') || 
                               slug.includes('technique') || 
                               slug.includes('follow')
                             ))
      
      if (pageIsRelevant && promptsInThisPage > 0) {
        pagesWithPromptsForChapter++
        console.log(`  ✓ Page: "${page.title}" (${promptsInThisPage} prompts)`)
        
        for (const block of content) {
          if (block.type === 'prompt' && block.id && block.label) {
            const questionItem = { id: block.id, label: block.label }
            
            // APPROACH 6: Categorize by page metadata
            const isFramework = slug.includes('framework') || title.includes('framework') || pageType.includes('framework')
            const isTechnique = slug.includes('technique') || title.includes('technique') || pageType.includes('technique')
            const isFollowThrough = slug.includes('follow') || title.includes('follow') || pageType.includes('follow')
            
            if (isFramework) {
              frameworkQuestions.push(questionItem)
              console.log(`    → Framework: "${block.label.substring(0, 50)}..."`)
            } else if (isTechnique) {
              techniquesQuestions.push(questionItem)
              console.log(`    → Technique: "${block.label.substring(0, 50)}..."`)
            } else if (isFollowThrough) {
              followThroughQuestions.push(questionItem)
              console.log(`    → Follow-Through: "${block.label.substring(0, 50)}..."`)
            } else {
              // APPROACH 7: If we can't categorize, add to framework as fallback
              frameworkQuestions.push(questionItem)
              console.log(`    → Framework (fallback): "${block.label.substring(0, 50)}..."`)
            }
          }
        }
      }
    }

    console.log(`[getResolutionReportData] APPROACH 8: Summary of question extraction:`)
    console.log(`  - Total pages scanned: ${allPages?.length || 0}`)
    console.log(`  - Total prompts found: ${totalPromptsFound}`)
    console.log(`  - Pages relevant to chapter: ${pagesWithPromptsForChapter}`)
    console.log(`  - Framework questions: ${frameworkQuestions.length}`)
    console.log(`  - Techniques questions: ${techniquesQuestions.length}`)
    console.log(`  - Follow-Through questions: ${followThroughQuestions.length}`)

    // Fetch identity resolution (two places: dedicated artifact OR embedded in proof artifact)
    const { data: identityArtifact, error: identityError } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('type', 'identity_resolution')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (identityError) {
      console.error('Error fetching identity resolution:', identityError)
    }

    // Fetch all proofs (don't fail entire function if this fails)
    const { data: proofArtifacts, error: proofsError } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('type', 'proof')
      .order('created_at', { ascending: true })

    if (proofsError) {
      console.error('[getResolutionReportData] Error fetching proofs (non-fatal):', proofsError)
    }

    // Extract identity from the first proof artifact if no dedicated identity_resolution exists
    let identityStatement = identityArtifact?.data?.identity
    if (!identityStatement && proofArtifacts && proofArtifacts.length > 0) {
      const firstProof = proofArtifacts[0]
      if (firstProof.data?.identity) {
        identityStatement = firstProof.data.identity
      }
    }

    const proofs =
      proofArtifacts?.map((artifact) => ({
        type: artifact.data.type || artifact.data.resolutionType || 'text',
        title: artifact.data.title || 'Identity Statement',
        notes: artifact.data.notes || artifact.data.identity || '',
        storagePath: artifact.data.storage_path,
        createdAt: artifact.created_at,
      })) ?? []

    // PERSPECTIVE 4: Fetch Your Turn responses from artifacts
    console.log(`[getResolutionReportData] PERSPECTIVE 4: Fetching Your Turn from artifacts...`)
    const { data: yourTurnArtifacts, error: yourTurnError } = await supabase
      .from('artifacts')
      .select('id, data, created_at')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('type', 'your_turn_response')
      .order('created_at', { ascending: true })

    console.log(`[getResolutionReportData] Artifacts query result:`)
    console.log(`  - Found ${yourTurnArtifacts?.length || 0} artifacts`)
    console.log(`  - Error: ${yourTurnError ? JSON.stringify(yourTurnError) : 'none'}`)

    if (yourTurnError) {
      console.error('[getResolutionReportData] Error fetching Your Turn artifacts (non-fatal):', yourTurnError)
    }

    const framework: YourTurnQandA[] = []
    const techniques: YourTurnQandA[] = []
    const followThrough: YourTurnQandA[] = []

    // Process artifacts (if any)
    const prefix = `ch${chapterId}_`
    console.log(`[getResolutionReportData] Processing artifacts with prefix: ${prefix}`)
    for (const row of yourTurnArtifacts ?? []) {
      const d = row.data as Record<string, unknown>
      const promptKey = String(d.promptKey ?? '')
      console.log(`  - Artifact: ${promptKey}`)
      const item: YourTurnQandA = {
        promptText: d.promptText != null ? String(d.promptText) : null,
        responseText: String(d.responseText ?? ''),
        createdAt: row.created_at ?? '',
      }
      if (promptKey.startsWith(`${prefix}framework_`)) {
        framework.push(item)
        console.log(`    → Added to framework`)
      }
      else if (promptKey.startsWith(`${prefix}technique_`)) {
        techniques.push(item)
        console.log(`    → Added to techniques`)
      }
      else if (promptKey.startsWith(`${prefix}followthrough_`)) {
        followThrough.push(item)
        console.log(`    → Added to followThrough`)
      } else {
        console.log(`    → SKIPPED (doesn't match any category)`)
      }
    }

    // PERSPECTIVE 5: Fallback - Check user_prompt_answers for Your Turn data
    console.log(`[getResolutionReportData] PERSPECTIVE 5: Fetching from user_prompt_answers...`)
    const { data: promptAnswers, error: promptAnswersError } = await supabase
      .from('user_prompt_answers')
      .select('prompt_key, answer, created_at')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)

    console.log(`[getResolutionReportData] user_prompt_answers query result:`)
    console.log(`  - Found ${promptAnswers?.length || 0} answers`)
    console.log(`  - Error: ${promptAnswersError ? JSON.stringify(promptAnswersError) : 'none'}`)

    if (promptAnswersError) {
      console.error('[getResolutionReportData] Error fetching prompt answers (non-fatal):', promptAnswersError)
    }

    // PERSPECTIVE 6: Match prompt keys to questions
    console.log(`[getResolutionReportData] PERSPECTIVE 6: Matching answers to questions...`)
    for (const row of promptAnswers ?? []) {
      const promptKey = row.prompt_key
      const answer = row.answer
      const answerText = typeof answer === 'string' ? answer : JSON.stringify(answer)
      
      // Skip self-check (that's handled separately)
      if (promptKey.includes('self_check')) {
        console.log(`  - SKIP (self_check): ${promptKey}`)
        continue
      }
      
      console.log(`  - Processing: ${promptKey}`)
      
      // Try to extract question text from artifacts (which store promptText)
      // or from promptQuestionsMap (extracted from pages)
      let questionText: string | null = null
      
      // Method 1: Extract from prompt_key format like "ch1_framework_spark_s_pattern"
      const traditionalMatch = promptKey.match(/(?:framework|technique|followthrough)_(.+)$/)
      if (traditionalMatch) {
        const promptId = traditionalMatch[1]
        console.log(`    Traditional format - Extracted ID: ${promptId}`)
        questionText = promptQuestionsMap.get(promptId) || null
      }
      
      // If not traditional format, it might be user_prompt_answers with timestamp format
      // We don't have the question text for these, so we'll show generic message
      
      const item: YourTurnQandA = {
        promptText: questionText || null,
        responseText: answerText,
        createdAt: row.created_at ?? '',
      }

      // Categorize by key pattern - support BOTH formats
      // Traditional: ch1_framework_..., ch1_technique_..., ch1_followthrough_...
      // New: prompt_123... (no category info, so we group all as "framework" for now)
      if (promptKey.includes('framework_') || promptKey.includes('spark_') || promptKey.includes('voice_')) {
        framework.push(item)
        console.log(`    → Added to framework`)
      } else if (promptKey.includes('technique_')) {
        techniques.push(item)
        console.log(`    → Added to techniques`)
      } else if (promptKey.includes('followthrough_')) {
        followThrough.push(item)
        console.log(`    → Added to followThrough`)
      } else if (promptKey.startsWith('prompt_')) {
        // Generic prompt format - add to framework by default
        framework.push(item)
        console.log(`    → Added to framework (generic prompt format)`)
      } else {
        console.log(`    → SKIPPED (doesn't match any category)`)
      }
    }

    const chapterTitle = ASSESSMENT_CONFIG[chapterId]?.chapterTitle ?? `Chapter ${chapterId}`

    // Create the final data structure with questions available
    // This allows the report to show questions even if there are no answers
    const reportData: ResolutionReportData = {
      chapterId,
      chapterTitle,
      completedAt: proofArtifacts?.[0]?.created_at ?? new Date().toISOString(),
      identityResolution: identityStatement,
      proofs,
      yourTurnByCategory: { framework, techniques, followThrough },
      // Add available questions for sections without answers
      availableQuestions: {
        framework: frameworkQuestions,
        techniques: techniquesQuestions,
        followThrough: followThroughQuestions,
      }
    }

    // PERSPECTIVE 7: Final Summary
    console.log(`[getResolutionReportData] ===== FINAL SUMMARY =====`)
    console.log(`  - Identity: ${identityStatement ? 'FOUND' : 'NOT FOUND'}`)
    console.log(`  - Proofs: ${proofs.length}`)
    console.log(`  - Your Turn Framework: ${framework.length} answers, ${frameworkQuestions.length} questions available`)
    console.log(`  - Your Turn Techniques: ${techniques.length} answers, ${techniquesQuestions.length} questions available`)
    console.log(`  - Your Turn Follow-Through: ${followThrough.length} answers, ${followThroughQuestions.length} questions available`)
    console.log(`  - Total Your Turn: ${framework.length + techniques.length + followThrough.length}`)
    
    if (framework.length + techniques.length + followThrough.length === 0 && 
        frameworkQuestions.length + techniquesQuestions.length + followThroughQuestions.length === 0) {
      console.warn(`[getResolutionReportData] ⚠️ NO YOUR TURN DATA OR QUESTIONS FOUND!`)
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error('Error in getResolutionReportData:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// GET USER INFO
// ============================================================================

export async function getUserInfo(): Promise<
  { success: true; data: { name: string; email: string; id: string } } | { success: false; error: string }
> {
  try {
    const userSupabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      },
    }
  } catch (error) {
    console.error('Error in getUserInfo:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
