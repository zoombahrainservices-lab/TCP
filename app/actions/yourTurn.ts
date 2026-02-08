'use server'

import { createClient } from '@/lib/supabase/server'

/** Single response per Your Turn prompt (one response per promptKey). */
export type YourTurnResponseItem = {
  id: number
  promptKey: string
  responseText: string
  promptText: string | null
  submittedAt: string
  createdAt: string
}

/** Map: promptKey → single response (or null). One response per Your Turn. */
export type YourTurnResponsesByPrompt = Record<string, YourTurnResponseItem | null>

const TYPE_KEY = 'your_turn_response'

/**
 * Get Your Turn responses for a chapter: one response per promptKey (S has one, P has one, etc.).
 */
export async function getYourTurnResponses(
  chapterId: number
): Promise<YourTurnResponsesByPrompt> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return {}

  const { data, error } = await supabase
    .from('artifacts')
    .select('id, data, created_at')
    .eq('user_id', userData.user.id)
    .eq('chapter_id', chapterId)
    .eq('type', TYPE_KEY)
    .order('created_at', { ascending: false })

  if (error || !data) return {}

  const byPrompt: Record<string, YourTurnResponseItem> = {}
  for (const row of data) {
    const d = row.data as Record<string, unknown>
    const promptKey = String(d.promptKey ?? '')
    if (!promptKey || byPrompt[promptKey]) continue
    byPrompt[promptKey] = {
      id: row.id,
      promptKey,
      responseText: String(d.responseText ?? ''),
      promptText: d.promptText != null ? String(d.promptText) : null,
      submittedAt: String(d.submittedAt ?? ''),
      createdAt: row.created_at ?? ''
    }
  }
  return byPrompt
}

/**
 * Save or update the single response for this Your Turn (promptKey).
 * One response per prompt: S has one, P has one; submitting again overwrites that prompt's response.
 */
export async function saveYourTurnResponse(
  chapterId: number,
  promptKey: string,
  responseText: string,
  promptText: string
) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('Not authenticated')

  const payload = {
    promptKey,
    responseText,
    promptText,
    submittedAt: new Date().toISOString()
  }

  const { data: rows } = await supabase
    .from('artifacts')
    .select('id, data')
    .eq('user_id', userData.user.id)
    .eq('chapter_id', chapterId)
    .eq('type', TYPE_KEY)

  const existing = rows?.find(
    (r) => (r.data as Record<string, unknown>)?.promptKey === promptKey
  )

  if (existing?.id != null) {
    const { error } = await supabase
      .from('artifacts')
      .update({ data: payload })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await supabase.from('artifacts').insert({
    user_id: userData.user.id,
    chapter_id: chapterId,
    type: TYPE_KEY,
    data: payload
  })
  if (error) throw new Error(error.message)
}
