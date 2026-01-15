'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/storage/uploads'
import { revalidatePath } from 'next/cache'

export async function getStudentProgress(studentId: string) {
  const supabase = await createClient()

  // Get all completed records for this student
  const { data: records, error } = await supabase
    .from('daily_records')
    .select('day_number, completed')
    .eq('student_id', studentId)
    .order('day_number', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch progress')
  }

  const completedDays = records?.filter(r => r.completed).map(r => r.day_number) || []
  const currentDay = completedDays.length > 0 ? Math.max(...completedDays) + 1 : 1
  
  // Ensure currentDay doesn't exceed 30
  const nextDay = currentDay > 30 ? 30 : currentDay

  return {
    completedDays,
    currentDay: nextDay,
    totalDays: 30,
    completionPercentage: Math.round((completedDays.length / 30) * 100),
  }
}

export async function getChapterContent(dayNumber: number) {
  const supabase = await createClient()

  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('day_number', dayNumber)
    .single()

  if (error || !chapter) {
    throw new Error('Chapter not found')
  }

  return chapter
}

export async function startDay(studentId: string, dayNumber: number) {
  const supabase = await createClient()

  // Check if record already exists
  const { data: existing } = await supabase
    .from('daily_records')
    .select('id')
    .eq('student_id', studentId)
    .eq('day_number', dayNumber)
    .single()

  if (existing) {
    return { recordId: existing.id }
  }

  // Get chapter ID
  const { data: chapter } = await supabase
    .from('chapters')
    .select('id')
    .eq('day_number', dayNumber)
    .single()

  if (!chapter) {
    throw new Error('Chapter not found')
  }

  // Create new daily record
  const { data: record, error } = await supabase
    .from('daily_records')
    .insert({
      student_id: studentId,
      chapter_id: chapter.id,
      day_number: dayNumber,
      completed: false,
    })
    .select('id')
    .single()

  if (error || !record) {
    throw new Error('Failed to start day')
  }

  return { recordId: record.id }
}

export async function saveBeforeAnswers(recordId: number, answers: any[]) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('daily_records')
    .update({ before_answers: answers })
    .eq('id', recordId)

  if (error) {
    throw new Error('Failed to save answers')
  }

  revalidatePath('/student')
  return { success: true }
}

export async function uploadProof(
  recordId: number,
  studentId: string,
  type: 'audio' | 'image' | 'text',
  fileOrText: File | string
) {
  const supabase = await createClient()

  let url = null
  let textContent = null

  if (type === 'text' && typeof fileOrText === 'string') {
    textContent = fileOrText
  } else if (fileOrText instanceof File) {
    // Upload file to storage
    const filePath = await uploadFile(fileOrText, studentId)
    const { data } = supabase.storage
      .from('student-uploads')
      .getPublicUrl(filePath)
    url = data.publicUrl
  }

  const { error } = await supabase
    .from('uploads')
    .insert({
      daily_record_id: recordId,
      type,
      url,
      text_content: textContent,
    })

  if (error) {
    throw new Error('Failed to upload proof')
  }

  revalidatePath('/student')
  return { success: true }
}

export async function saveAfterAnswersAndReflection(
  recordId: number,
  answers: any[],
  reflection: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('daily_records')
    .update({
      after_answers: answers,
      reflection_text: reflection,
    })
    .eq('id', recordId)

  if (error) {
    throw new Error('Failed to save reflection')
  }

  revalidatePath('/student')
  return { success: true }
}

export async function completeDay(recordId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('daily_records')
    .update({ completed: true })
    .eq('id', recordId)

  if (error) {
    throw new Error('Failed to complete day')
  }

  revalidatePath('/student')
  return { success: true }
}

export async function getDailyRecord(studentId: string, dayNumber: number) {
  const supabase = await createClient()

  const { data: record, error } = await supabase
    .from('daily_records')
    .select(`
      *,
      uploads (*)
    `)
    .eq('student_id', studentId)
    .eq('day_number', dayNumber)
    .single()

  if (error) {
    return null
  }

  return record
}
