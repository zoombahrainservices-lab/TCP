'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserStats() {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('role')

  if (error) {
    throw new Error('Failed to fetch user stats')
  }

  const stats = {
    students: profiles?.filter(p => p.role === 'student').length || 0,
    parents: profiles?.filter(p => p.role === 'parent').length || 0,
    mentors: profiles?.filter(p => p.role === 'mentor').length || 0,
    admins: profiles?.filter(p => p.role === 'admin').length || 0,
    total: profiles?.length || 0,
  }

  return stats
}

export async function getAllChapters() {
  const supabase = await createClient()

  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('*')
    .order('day_number', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch chapters')
  }

  return chapters || []
}

export async function getChapter(id: number) {
  const supabase = await createClient()

  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !chapter) {
    throw new Error('Chapter not found')
  }

  return chapter
}

export async function createChapter(data: {
  day_number: number
  title: string
  subtitle?: string
  content: string
  task_description: string
  before_questions: any[]
  after_questions: any[]
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('chapters')
    .insert({
      day_number: data.day_number,
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      task_description: data.task_description,
      before_questions: data.before_questions,
      after_questions: data.after_questions,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/chapters')
  return { success: true }
}

export async function updateChapter(id: number, data: {
  day_number: number
  title: string
  subtitle?: string
  content: string
  task_description: string
  before_questions: any[]
  after_questions: any[]
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('chapters')
    .update({
      day_number: data.day_number,
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      task_description: data.task_description,
      before_questions: data.before_questions,
      after_questions: data.after_questions,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/chapters')
  revalidatePath(`/admin/chapters/${id}`)
  return { success: true }
}

export async function deleteChapter(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/chapters')
  return { success: true }
}
