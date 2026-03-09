import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all chapters
    const { data: chapters } = await supabase
      .from('chapters')
      .select('*')
      .order('chapter_number')
    
    if (!chapters || chapters.length === 0) {
      return NextResponse.json({ error: 'No chapters found' })
    }
    
    // Get the latest chapter (or chapter 4 if it exists)
    const chapter = chapters.find(c => c.chapter_number === 4) || chapters[chapters.length - 1]
    
    // Get all steps for this chapter
    const { data: steps } = await supabase
      .from('chapter_steps')
      .select('*')
      .eq('chapter_id', chapter.id)
      .order('order_index')
    
    // Get pages for all steps
    const pagesPromises = (steps || []).map(async (step) => {
      const { data: pages } = await supabase
        .from('step_pages')
        .select('*')
        .eq('step_id', step.id)
        .order('order_index')
      
      return {
        stepSlug: step.slug,
        stepTitle: step.title,
        pages: pages?.map(p => ({
          id: p.id,
          title: p.title,
          order_index: p.order_index,
          contentBlocks: p.content?.slice(0, 3) || [] // First 3 blocks only
        }))
      }
    })
    
    const stepsWithPages = await Promise.all(pagesPromises)
    
    return NextResponse.json({ 
      chapter: {
        id: chapter.id,
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        slug: chapter.slug
      },
      allChapters: chapters.map(c => ({ number: c.chapter_number, title: c.title, slug: c.slug })),
      stepsWithPages
    }, { headers: { 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}
