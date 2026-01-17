'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getUserStats() {
  const adminClient = createAdminClient()
  
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('role')

  const students = profiles?.filter(p => p.role === 'student').length || 0
  const parents = profiles?.filter(p => p.role === 'parent').length || 0
  const mentors = profiles?.filter(p => p.role === 'mentor').length || 0
  const total = profiles?.length || 0

  return { students, parents, mentors, total }
}

export async function getAllParents() {
  const adminClient = createAdminClient()
  
  const { data: parents, error } = await adminClient
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('role', 'parent')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllParents error:', error)
    throw new Error('Failed to fetch parents')
  }

  // Get child count for each parent
  const parentsWithChildren = await Promise.all(
    (parents || []).map(async (parent) => {
      const { data: links } = await adminClient
        .from('parent_child_links')
        .select('child_id')
        .eq('parent_id', parent.id)

      return {
        ...parent,
        childrenCount: links?.length || 0,
      }
    })
  )

  return parentsWithChildren
}

export async function getAllStudents() {
  const adminClient = createAdminClient()
  
  const { data: students, error } = await adminClient
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllStudents error:', error)
    throw new Error('Failed to fetch students')
  }

  // Get progress for each student
  const studentsWithProgress = await Promise.all(
    (students || []).map(async (student) => {
      const { data: records } = await adminClient
        .from('daily_records')
        .select('day_number, completed')
        .eq('student_id', student.id)
        .eq('completed', true)

      const { data: links } = await adminClient
        .from('parent_child_links')
        .select('parent_id')
        .eq('child_id', student.id)

      const { data: parent } = links && links.length > 0 
        ? await adminClient
            .from('profiles')
            .select('full_name')
            .eq('id', links[0].parent_id)
            .single()
        : { data: null }

      return {
        ...student,
        completedDays: records?.length || 0,
        completionPercentage: Math.round(((records?.length || 0) / 30) * 100),
        parentName: parent?.full_name || 'No Parent',
      }
    })
  )

  return studentsWithProgress
}

export async function getStudentResponses(studentId: string) {
  const adminClient = createAdminClient()
  
  const { data: student } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', studentId)
    .single()

  const { data: records, error } = await adminClient
    .from('daily_records')
    .select(`
      *,
      uploads (*)
    `)
    .eq('student_id', studentId)
    .eq('completed', true)
    .order('day_number', { ascending: true })

  if (error) {
    console.error('getStudentResponses error:', error)
    throw new Error('Failed to fetch student responses')
  }

  const { data: chapters } = await adminClient
    .from('chapters')
    .select('day_number, title')
    .order('day_number', { ascending: true })

  const responsesWithChapters = (records || []).map(record => {
    const chapter = chapters?.find(c => c.day_number === record.day_number)
    return {
      ...record,
      chapterTitle: chapter?.title || `Day ${record.day_number}`,
    }
  })

  return {
    studentName: student?.full_name || 'Student',
    responses: responsesWithChapters,
  }
}

export async function deleteUser(userId: string) {
  const adminClient = createAdminClient()
  
  // Delete auth user
  const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
  
  if (authError) {
    console.error('deleteUser error:', authError)
    throw new Error('Failed to delete user')
  }

  return { success: true }
}

export async function getAllChapters() {
  const adminClient = createAdminClient()
  
  const { data: chapters, error } = await adminClient
    .from('chapters')
    .select('*')
    .order('day_number', { ascending: true })

  if (error) {
    console.error('getAllChapters error:', error)
    throw new Error('Failed to fetch chapters')
  }

  return chapters || []
}

export async function deleteChapter(chapterId: string) {
  const adminClient = createAdminClient()
  
  const { error } = await adminClient
    .from('chapters')
    .delete()
    .eq('id', chapterId)

  if (error) {
    console.error('deleteChapter error:', error)
    throw new Error('Failed to delete chapter')
  }

  return { success: true }
}

export async function getChapter(chapterId: number) {
  const adminClient = createAdminClient()
  
  const { data: chapter, error } = await adminClient
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single()

  if (error) {
    console.error('getChapter error:', error)
    throw new Error('Failed to fetch chapter')
  }

  return chapter
}

export async function updateChapter(chapterId: number, data: any) {
  const adminClient = createAdminClient()
  
  const updateData: any = {
    day_number: data.day_number,
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    task_description: data.task_description,
    task_deadline_hours: data.task_deadline_hours,
    before_questions: data.before_questions,
    after_questions: data.after_questions,
  }

  // Include chunks if they exist
  if (data.chunks) {
    updateData.chunks = data.chunks
  }

  const { error } = await adminClient
    .from('chapters')
    .update(updateData)
    .eq('id', chapterId)

  if (error) {
    console.error('updateChapter error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function createChapter(data: any) {
  const adminClient = createAdminClient()
  
  const insertData: any = {
    day_number: data.day_number,
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    task_description: data.task_description,
    task_deadline_hours: data.task_deadline_hours,
    before_questions: data.before_questions,
    after_questions: data.after_questions,
  }

  // Include chunks if they exist
  if (data.chunks) {
    insertData.chunks = data.chunks
  }

  const { error } = await adminClient
    .from('chapters')
    .insert(insertData)

  if (error) {
    console.error('createChapter error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
