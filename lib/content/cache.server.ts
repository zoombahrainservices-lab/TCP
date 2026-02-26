/**
 * Server-only content helpers using the Supabase service-role client.
 *
 * IMPORTANT:
 * - This file MUST only be imported from server components / server code.
 * - It MUST NOT be used from edge or client code.
 *
 * NOTE:
 * We intentionally do NOT wrap these in `unstable_cache` anymore because
 * Next.js forbids using dynamic sources like `cookies()` anywhere inside
 * a cache scope. To avoid subtle coupling issues, we keep these as plain
 * async helpers. Performance wins still come from:
 * - using a single RPC (`get_chapter_bundle`)
 * - avoiding per-request middleware auth checks for public content
 */

import { createClient } from '@supabase/supabase-js'

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

/**
 * Get chapter + steps bundle via a single RPC.
 */
export async function getCachedChapterBundle(chapterSlug: string) {
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
}

/**
 * Get all pages for a step.
 */
export async function getCachedStepPages(stepId: string) {
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
}

/**
 * Get all published chapters (for dashboard / map).
 */
export async function getCachedAllChapters() {
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
}

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
 */
export async function getCachedChapterBundleAdmin(chapterSlug: string) {
  const supabase = createServiceClient()

  // Primary path: use RPC (ignores is_published so drafts can be previewed)
  const { data, error } = await supabase.rpc('get_chapter_bundle', {
    chapter_slug: chapterSlug,
  })

  const hasValidData = Array.isArray(data) && data.length > 0 && data[0]?.chapter_data
  const hasRealError = !!error

  if (hasValidData) {
    const chapter = data[0].chapter_data as any
    const steps = data[0].steps_data as any[]

    return {
      chapter,
      steps,
      error: null,
    }
  }

  // Fallback path for admin preview if RPC is missing/misconfigured
  if (hasRealError) {
    console.error(
      'getCachedChapterBundleAdmin: RPC get_chapter_bundle failed or returned no data, falling back to direct queries',
      error
    )
  }

  const { data: chapterRows, error: chapterError } = await supabase
    .from('chapters')
    .select('*')
    .eq('slug', chapterSlug)
    .limit(1)

  if (chapterError || !chapterRows || chapterRows.length === 0) {
    console.error('getCachedChapterBundleAdmin: failed to fetch chapter via fallback', chapterError || error)
    return null
  }

  const chapter = chapterRows[0] as any

  const { data: stepsRows, error: stepsError } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapter.id)
    .order('order_index', { ascending: true })

  if (stepsError) {
    console.error('getCachedChapterBundleAdmin: error fetching steps in fallback', stepsError)
  }

  return {
    chapter,
    steps: (stepsRows as any[]) || [],
    error: stepsError || chapterError || error || null,
  }
}
