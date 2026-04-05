/**
 * Server-only content helpers using the Supabase service-role client.
 *
 * IMPORTANT:
 * - This file MUST only be imported from server components / server code.
 * - It MUST NOT be used from edge or client code.
 *
 * CACHING STRATEGY:
 * - Public content (chapters, steps, pages) is cached using unstable_cache
 * - Service-role queries are safe to cache (no user-specific data, no cookies())
 * - Short TTL (5 minutes) to balance performance and freshness
 * - Tagged for manual invalidation when content is updated
 * 
 * DEVELOPMENT INSTRUMENTATION:
 * - Cache hits/misses are logged in dev mode for performance verification
 */

import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { perfLog } from '@/lib/performance/debug'

// Verify this is server-only
if (typeof window !== 'undefined') {
  throw new Error('cache.server.ts must only be imported in server components')
}

// Service role client (bypasses RLS - only use for public content)
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function hasMeaningfulSupabaseError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as Record<string, unknown>
  const hasMeaningfulText = (value: unknown) => {
    if (typeof value !== 'string') return false
    const text = value.trim()
    if (!text) return false
    // Supabase/Turbopack occasionally surfaces placeholder-like text values.
    // Ignore these so we don't spam console with non-actionable "{}" errors.
    const normalized = text.toLowerCase()
    if (
      normalized === '{}' ||
      normalized === 'null' ||
      normalized === 'undefined' ||
      normalized === '[object object]'
    ) {
      return false
    }
    return true
  }
  return (
    hasMeaningfulText(record.message) ||
    hasMeaningfulText(record.code) ||
    hasMeaningfulText(record.details) ||
    hasMeaningfulText(record.hint)
  )
}

function isMissingColumnSupabaseError(error: unknown, columnName: string): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as Record<string, unknown>
  const message = typeof record.message === 'string' ? record.message.toLowerCase() : ''
  const details = typeof record.details === 'string' ? record.details.toLowerCase() : ''
  const code = typeof record.code === 'string' ? record.code : ''
  const column = columnName.toLowerCase()
  // Postgres undefined_column is 42703. We also match text defensively.
  return (
    code === '42703' ||
    message.includes(column) ||
    message.includes('column') ||
    details.includes(column)
  )
}

/**
 * Get chapter + steps bundle via a single RPC.
 * Cached for 5 minutes per chapter slug.
 */
export const getCachedChapterBundle = unstable_cache(
  async (chapterSlug: string) => {
    perfLog.cache(`Fetching chapter bundle: ${chapterSlug}`)
    const supabase = createServiceClient()

    // Primary path: use the RPC for best performance
    const { data, error } = await supabase.rpc('get_chapter_bundle', {
      chapter_slug: chapterSlug,
    })

    const hasValidData = Array.isArray(data) && data.length > 0 && data[0]?.chapter_data

    if (hasValidData) {
      const chapter = data[0].chapter_data as any
      const steps = data[0].steps_data as any[]

      return {
        chapter,
        steps,
        error: null,
      }
    }

    // Fallback path: if the RPC is missing or misconfigured, fall back to direct queries

    const { data: chapterRows, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('slug', chapterSlug)
      .eq('is_published', true)
      .limit(1)

    if (chapterError || !chapterRows || chapterRows.length === 0) {
      return { chapter: null, steps: [], error: chapterError || error }
    }

    const chapter = chapterRows[0] as any

    const { data: stepsRows, error: stepsError } = await supabase
      .from('chapter_steps')
      .select('*')
      .eq('chapter_id', chapter.id)
      .order('order_index', { ascending: true })

    if (stepsError) {
      console.error('getCachedChapterBundle: error fetching steps in fallback', stepsError)
    }

    return {
      chapter,
      steps: (stepsRows as any[]) || [],
      error: stepsError || chapterError || error || null,
    }
  },
  ['chapter-bundle'],
  {
    revalidate: 300, // 5 minutes
    tags: ['chapters', 'steps', 'content'],
  }
)

/**
 * Get all pages for a step.
 * Cached for 5 minutes per step.
 */
export const getCachedStepPages = unstable_cache(
  async (stepId: string) => {
    perfLog.cache(`Fetching step pages: ${stepId}`)
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('step_pages')
      .select('*')
      .eq('step_id', stepId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching step pages:', error)
      return []
    }

    return data || []
  },
  ['step-pages'],
  {
    revalidate: 300, // 5 minutes
    tags: ['pages', 'content'],
  }
)

/**
 * Get all published chapters (for dashboard / map).
 * Cached for 5 minutes to reduce repeated DB hits.
 */
export const getCachedAllChapters = unstable_cache(
  async () => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching chapters:', error)
      return []
    }

    return data || []
  },
  ['all-published-chapters'],
  {
    revalidate: 300, // 5 minutes
    tags: ['chapters', 'content'],
  }
)

/**
 * Get fallback preview image per chapter from the first "read" step/page.
 * Used when chapter-level preview image is missing.
 */
export const getCachedChapterReadingPreviewImages = unstable_cache(
  async () => {
    const supabase = createServiceClient()

    const { data: readSteps, error: readStepsError } = await supabase
      .from('chapter_steps')
      .select('id, chapter_id, step_type, order_index')
      .eq('step_type', 'read')
      .order('chapter_id', { ascending: true })
      .order('order_index', { ascending: true })

    if (hasMeaningfulSupabaseError(readStepsError) || !readSteps) {
      if (hasMeaningfulSupabaseError(readStepsError)) {
        console.error('Error fetching read steps for preview fallback:', readStepsError)
      }
      return {} as Record<string, string>
    }

    // Keep only the first read step per chapter.
    const firstReadStepByChapter = new Map<string, string>()
    for (const step of readSteps as any[]) {
      const chapterId = typeof step.chapter_id === 'string' ? step.chapter_id : null
      if (!chapterId) continue
      if (!firstReadStepByChapter.has(chapterId) && typeof step.id === 'string') {
        firstReadStepByChapter.set(chapterId, step.id)
      }
    }

    const stepIds = Array.from(firstReadStepByChapter.values())
    if (stepIds.length === 0) return {} as Record<string, string>

    let { data: pages, error: pagesError } = await supabase
      .from('step_pages')
      .select('step_id, hero_image_url, content, order_index')
      .in('step_id', stepIds)
      .order('order_index', { ascending: true })

    // Backward-compatible fallback for older DB states where step_pages.hero_image_url
    // does not exist yet. We can still resolve preview from content image blocks.
    if (isMissingColumnSupabaseError(pagesError, 'hero_image_url')) {
      const fallbackQuery = await supabase
        .from('step_pages')
        .select('step_id, content, order_index')
        .in('step_id', stepIds)
        .order('order_index', { ascending: true })
      pages = fallbackQuery.data as any
      pagesError = fallbackQuery.error
    }

    if (hasMeaningfulSupabaseError(pagesError) || !pages) {
      if (hasMeaningfulSupabaseError(pagesError)) {
        console.error('Error fetching read step pages for preview fallback:', pagesError)
      }
      return {} as Record<string, string>
    }

    const previewByChapterId: Record<string, string> = {}

    // Build reverse lookup step_id -> chapter_id.
    const chapterByStepId = new Map<string, string>()
    for (const [chapterId, stepId] of firstReadStepByChapter.entries()) {
      chapterByStepId.set(stepId, chapterId)
    }

    for (const page of pages as any[]) {
      const stepId = typeof page.step_id === 'string' ? page.step_id : null
      if (!stepId) continue

      const chapterId = chapterByStepId.get(stepId)
      if (!chapterId || previewByChapterId[chapterId]) continue

      const hero = typeof page.hero_image_url === 'string' ? page.hero_image_url.trim() : ''
      if (hero) {
        previewByChapterId[chapterId] = hero
        continue
      }

      let content: any[] = []
      if (Array.isArray(page.content)) {
        content = page.content
      } else if (typeof page.content === 'string') {
        try {
          const parsed = JSON.parse(page.content)
          content = Array.isArray(parsed) ? parsed : []
        } catch {
          content = []
        }
      }
      const imageBlock = content.find(
        (block: any) => block && block.type === 'image' && typeof block.src === 'string' && block.src.trim().length > 0
      )
      if (imageBlock?.src) {
        previewByChapterId[chapterId] = String(imageBlock.src)
      }
    }

    return previewByChapterId
  },
  ['chapter-reading-preview-images'],
  {
    revalidate: 300,
    tags: ['chapters', 'steps', 'pages', 'content'],
  }
)

/**
 * Get published chapter by chapter_number (for legacy /chapter/[chapterId] routes).
 */
export async function getCachedChapterByNumber(chapterNumber: number) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('chapters')
    .select('id, slug, chapter_number')
    .eq('chapter_number', chapterNumber)
    .eq('is_published', true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Get chapter bundle for admin preview (includes unpublished chapters).
 *
 * IMPORTANT: The DB function `get_chapter_bundle` filters `is_published = true`, so it
 * cannot load drafts. Admins must load via direct table queries first.
 */
export async function getCachedChapterBundleAdmin(chapterSlug: string) {
  const supabase = createServiceClient()
  const normalizedSlug = chapterSlug.trim()

  if (!normalizedSlug) {
    return null
  }

  // Primary: direct chapter row (published or not) — matches how admins preview drafts.
  let { data: chapterRows, error: chapterError } = await supabase
    .from('chapters')
    .select('*')
    .eq('slug', normalizedSlug)
    .limit(1)

  // Case-insensitive slug match only when safe: ILIKE treats `_` and `%` as wildcards.
  if (
    !chapterError &&
    (!chapterRows || chapterRows.length === 0) &&
    !normalizedSlug.includes('_') &&
    !normalizedSlug.includes('%')
  ) {
    const { data: ilikeRows, error: ilikeError } = await supabase
      .from('chapters')
      .select('*')
      .ilike('slug', normalizedSlug)
      .limit(1)
    if (!ilikeError && ilikeRows && ilikeRows.length > 0) {
      chapterRows = ilikeRows
      chapterError = null
    }
  }

  if (chapterRows && chapterRows.length > 0) {
    const chapter = chapterRows[0] as any

    const { data: stepsRows, error: stepsError } = await supabase
      .from('chapter_steps')
      .select('*')
      .eq('chapter_id', chapter.id)
      .order('order_index', { ascending: true })

    if (stepsError) {
      console.error('getCachedChapterBundleAdmin: error fetching steps', stepsError)
    }

    return {
      chapter,
      steps: (stepsRows as any[]) || [],
      error: stepsError || chapterError || null,
    }
  }

  // Last resort: RPC only returns published chapters; still useful if slug matched RPC expectations but direct query failed unexpectedly.
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_chapter_bundle', {
    chapter_slug: normalizedSlug,
  })
  const hasValidData =
    Array.isArray(rpcData) && rpcData.length > 0 && rpcData[0]?.chapter_data

  if (hasValidData) {
    return {
      chapter: rpcData[0].chapter_data as any,
      steps: rpcData[0].steps_data as any[],
      error: null,
    }
  }

  console.error(
    'getCachedChapterBundleAdmin: no chapter found for slug',
    JSON.stringify({ slug: normalizedSlug, chapterError, rpcError })
  )
  return null
}

/**
 * Get a single step by ID (cached).
 * Useful for prefetching next step metadata.
 */
export const getCachedStepById = unstable_cache(
  async (stepId: string) => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('chapter_steps')
      .select('*')
      .eq('id', stepId)
      .single()

    if (error) {
      console.error('Error fetching step by ID:', error)
      return null
    }

    return data
  },
  ['step-by-id'],
  {
    revalidate: 300,
    tags: ['steps', 'content'],
  }
)

/**
 * Invalidate content caches after admin updates.
 * Call this from admin routes after creating/updating/deleting content.
 * 
 * @example
 * ```ts
 * import { invalidateContentCache } from '@/lib/content/cache.server'
 * 
 * // After updating a chapter
 * await updateChapter(...)
 * invalidateContentCache(['chapters'])
 * 
 * // After updating multiple content types
 * invalidateContentCache(['chapters', 'steps', 'pages'])
 * ```
 */
export function invalidateContentCache(tags: string[] = ['content']) {
  const { revalidateTag } = require('next/cache')
  
  for (const tag of tags) {
    revalidateTag(tag)
  }
  
  return { invalidated: tags }
}
