import { requireAuth } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { ChapterMapClient } from './ChapterMapClient'

export default async function MapPage() {
  const user = await requireAuth()
  const chapters = await getCachedAllChapters()
  
  const supabase = await createClient()
  
  // Extract published chapter IDs for bounded queries
  const publishedChapterIds = chapters.map((ch: any) => ch.id)
  
  // Get user's progress
  const { data: progressData } = await supabase
    .from('chapter_progress')
    .select('chapter_id, sections_completed')
    .eq('user_id', user.id)
  
  // Get steps ONLY for published chapters (bounded query)
  const { data: allSteps } = await supabase
    .from('chapter_steps')
    .select(`
      id,
      chapter_id,
      step_type,
      title,
      slug,
      order_index
    `)
    .in('chapter_id', publishedChapterIds)
    .order('order_index', { ascending: true })
  
  // Extract step IDs for bounded page query
  const stepIds = allSteps?.map(s => s.id) || []
  
  // Get pages ONLY for steps of published chapters (bounded query)
  const { data: allPages } = stepIds.length > 0 
    ? await supabase
        .from('step_pages')
        .select('id, step_id, title, slug, order_index')
        .in('step_id', stepIds)
        .order('order_index', { ascending: true })
    : { data: [] }
  
  // Get completed pages
  const { data: completedPages } = await supabase
    .from('step_completions')
    .select('page_id')
    .eq('user_id', user.id)
  
  const completedPageIds = new Set(completedPages?.map(c => c.page_id) || [])
  
  // Organize data by chapter (same logic as before)
  const chaptersWithProgress = chapters.map((chapter: any) => {
    const steps = allSteps?.filter(s => s.chapter_id === chapter.id) || []
    const stepsWithPages = steps.map(step => ({
      ...step,
      pages: (allPages?.filter(p => p.step_id === step.id) || []).map(page => ({
        ...page,
        isCompleted: completedPageIds.has(page.id)
      }))
    }))
    
    return {
      ...chapter,
      steps: stepsWithPages
    }
  })
  
  // Use role from requireAuth (already fetched profiles)
  const isAdmin = user.role === 'admin'
  
  // Determine current chapter (similar to dashboard logic)
  const publishedChapters = Array.isArray(chaptersWithProgress) ? chaptersWithProgress : []
  const progressList = Array.isArray(progressData) ? progressData : []
  
  const progressByNumber = new Map<number, any>()
  for (const row of progressList) {
    if (typeof row.chapter_id === 'number') {
      progressByNumber.set(row.chapter_id, row)
    }
  }
  
  let currentChapterNumber: number = 1
  for (const chapter of publishedChapters) {
    const chapterNum = chapter.chapter_number as number
    const progress = progressByNumber.get(chapterNum)
    const totalSections = progress?.sections_completed ?? 0
    
    // Find first incomplete chapter
    if (!progress || totalSections < 6) {
      currentChapterNumber = chapterNum
      break
    }
  }
  
  if (currentChapterNumber == null && publishedChapters.length > 0) {
    const last = publishedChapters[publishedChapters.length - 1]
    currentChapterNumber = last.chapter_number as number
  }
  
  const currentChapter = publishedChapters.find(c => c.chapter_number === currentChapterNumber) || publishedChapters[0]
  const currentChapterSlug = currentChapter?.slug || publishedChapters[0]?.slug || 'chapter-1'
  
  return (
    <ChapterMapClient 
      chapters={chaptersWithProgress} 
      isAdmin={isAdmin}
      currentChapterSlug={currentChapterSlug}
      initialChapterNumber={currentChapterNumber}
    />
  )
}
