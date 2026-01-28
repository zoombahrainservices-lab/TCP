'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/storage/uploads'
import { revalidatePath } from 'next/cache'

export type DayStatus = 'completed' | 'in-progress' | 'not-started'

export interface StudentProgress {
  completedDays: number[]
  inProgressDays: number[]
  suggestedDay: number
  totalDays: number
  completionPercentage: number
  dayStatuses: Record<number, DayStatus>
  // Keep currentDay for backward compatibility during transition
  currentDay: number
}

export async function getStudentProgress(studentId: string): Promise<StudentProgress> {
  const supabase = await createClient()

  // Get all records for this student
  const { data: records, error } = await supabase
    .from('daily_records')
    .select('day_number, completed')
    .eq('student_id', studentId)
    .order('day_number', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch progress')
  }

  const completedDays = records?.filter(r => r.completed).map(r => r.day_number) || []
  const inProgressDays = records?.filter(r => !r.completed).map(r => r.day_number) || []
  
  // Suggested day = lowest incomplete day, or next after max completed, or 1
  let suggestedDay = 1
  if (inProgressDays.length > 0) {
    suggestedDay = Math.min(...inProgressDays)
  } else if (completedDays.length > 0) {
    suggestedDay = Math.min(Math.max(...completedDays) + 1, 30)
  }

  // Build day statuses map for all 30 days
  const dayStatuses: Record<number, DayStatus> = {}
  for (let day = 1; day <= 30; day++) {
    if (completedDays.includes(day)) {
      dayStatuses[day] = 'completed'
    } else if (inProgressDays.includes(day)) {
      dayStatuses[day] = 'in-progress'
    } else {
      dayStatuses[day] = 'not-started'
    }
  }

  return {
    completedDays,
    inProgressDays,
    suggestedDay,
    totalDays: 30,
    completionPercentage: Math.round((completedDays.length / 30) * 100),
    dayStatuses,
    // Keep currentDay for backward compatibility
    currentDay: suggestedDay,
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

/**
 * Get chapter metadata including page count if images are available
 */
export async function getChapterMetadata(dayNumber: number): Promise<{ totalPages: number; hasImages: boolean } | null> {
  try {
    // Server-side: read from filesystem
    const fs = await import('fs/promises')
    const path = await import('path')
    const chapterDir = `chapter${String(dayNumber).padStart(2, '0')}`
    const metadataFilePath = path.join(process.cwd(), 'public', 'chapters', chapterDir, 'meta.json')
    
    try {
      const metadataContent = await fs.readFile(metadataFilePath, 'utf-8')
      const metadata = JSON.parse(metadataContent)
      return {
        totalPages: metadata.totalPages || 0,
        hasImages: true,
      }
    } catch (fileError) {
      // Metadata file doesn't exist - chapter images not available
      return null
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to load metadata for chapter ${dayNumber}:`, error)
    }
    return null
  }
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

export async function markContentFinished(recordId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('daily_records')
    .update({ content_finished_at: new Date().toISOString() })
    .eq('id', recordId)

  if (error) {
    throw new Error('Failed to mark content as finished')
  }

  revalidatePath('/student')
  return { success: true }
}

export async function acknowledgeTask(recordId: number, chapterId: number) {
  const supabase = await createClient()

  // Get chapter's task_deadline_hours
  const { data: chapter } = await supabase
    .from('chapters')
    .select('task_deadline_hours')
    .eq('id', chapterId)
    .single()

  const deadlineHours = chapter?.task_deadline_hours || 24

  // Calculate due date
  const now = new Date()
  const dueDate = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000)

  const { error } = await supabase
    .from('daily_records')
    .update({
      task_acknowledged_at: now.toISOString(),
      task_due_at: dueDate.toISOString(),
    })
    .eq('id', recordId)

  if (error) {
    throw new Error('Failed to acknowledge task')
  }

  revalidatePath('/student')
  return { success: true }
}

export async function getRecordWithTimestamps(recordId: number) {
  const supabase = await createClient()

  const { data: record, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('id', recordId)
    .single()

  if (error) {
    throw new Error('Failed to fetch record')
  }

  return record
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

  // Also mark proof_uploaded_at
  const { error: updateError } = await supabase
    .from('daily_records')
    .update({ proof_uploaded_at: new Date().toISOString() })
    .eq('id', recordId)

  if (updateError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update proof_uploaded_at:', updateError)
    }
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

export async function getAllDailyRecords(studentId: string) {
  const supabase = await createClient()

  const { data: records, error } = await supabase
    .from('daily_records')
    .select('day_number, reflection_text, before_answers, after_answers, completed, updated_at')
    .eq('student_id', studentId)
    .order('day_number', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch records')
  }

  return records || []
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
