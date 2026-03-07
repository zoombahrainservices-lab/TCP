import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkChapterStructure() {
  console.log('\n=== CHECKING CHAPTER STRUCTURE ===\n')

  // 1. Check all chapters
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, slug, title, is_published')
    .order('chapter_number')

  console.log('📚 CHAPTERS:')
  chapters?.forEach(ch => {
    console.log(`  Chapter ${ch.chapter_number}: "${ch.title}"`)
    console.log(`    Slug: ${ch.slug}`)
    console.log(`    ID: ${ch.id}`)
    console.log(`    Published: ${ch.is_published}`)
    console.log('')
  })

  // 2. Check steps for each chapter
  for (const chapter of chapters || []) {
    console.log(`\n📖 STEPS FOR CHAPTER ${chapter.chapter_number}:`)
    const { data: steps } = await supabase
      .from('chapter_steps')
      .select('id, step_type, slug, title, order_index')
      .eq('chapter_id', chapter.id)
      .order('order_index')

    if (!steps || steps.length === 0) {
      console.log(`  ⚠️  NO STEPS FOUND FOR CHAPTER ${chapter.chapter_number}`)
      continue
    }

    for (const step of steps) {
      console.log(`  ${step.order_index}. ${step.step_type} (${step.slug})`)
      
      // Check if step has pages
      const { data: pages, count } = await supabase
        .from('step_pages')
        .select('id', { count: 'exact' })
        .eq('step_id', step.id)

      console.log(`     Pages: ${count || 0}`)
      
      if (!count || count === 0) {
        console.log(`     ⚠️  NO CONTENT - Will show "Coming Soon"`)
      }
    }
  }

  console.log('\n=== DONE ===\n')
}

checkChapterStructure().catch(console.error)
