 'use server'

import { createClient } from '@/lib/supabase/server'

export type IdentityResolutionData = {
  identity: string
  value1: string
  value2: string
  value3: string
  commitment: string
  daily1: string
  daily2: string
  daily3: string
  noLonger: string
  why: string
}

const CHAPTER_ID = 1
const TYPE_KEY = 'identity_resolution'

export async function getIdentityResolutionForChapter1(): Promise<IdentityResolutionData | null> {
  const supabase = await createClient()

  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) {
    return null
  }

  const { data, error } = await supabase
    .from('artifacts')
    .select('data')
    .eq('user_id', userData.user.id)
    .eq('chapter_id', CHAPTER_ID)
    .eq('type', TYPE_KEY)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  const payload = (data.data || {}) as Partial<IdentityResolutionData>

  return {
    identity: payload.identity ?? '',
    value1: payload.value1 ?? '',
    value2: payload.value2 ?? '',
    value3: payload.value3 ?? '',
    commitment: payload.commitment ?? '',
    daily1: payload.daily1 ?? '',
    daily2: payload.daily2 ?? '',
    daily3: payload.daily3 ?? '',
    noLonger: payload.noLonger ?? '',
    why: payload.why ?? '',
  }
}

export async function saveIdentityResolutionForChapter1(payload: IdentityResolutionData) {
  const supabase = await createClient()

  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.from('artifacts').insert({
    user_id: userData.user.id,
    chapter_id: CHAPTER_ID,
    type: TYPE_KEY,
    data: payload,
  })

  if (error) {
    throw new Error(error.message || 'Failed to save identity resolution')
  }
}

