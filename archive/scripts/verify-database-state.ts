/**
 * Database State Verification Script
 * Verifies cleanup was successful and checks student profile structure
 * Run with: npx tsx scripts/verify-database-state.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║           DATABASE STATE VERIFICATION                     ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // Check student progress data
  console.log('📋 Student Progress Data:\n')
  
  const { count: progressCount } = await supabase
    .from('student_progress')
    .select('*', { count: 'exact', head: true })
  console.log(`   ✓ student_progress: ${progressCount} records`)
  
  const { count: uploadsCount } = await supabase
    .from('phase_uploads')
    .select('*', { count: 'exact', head: true })
  console.log(`   ✓ phase_uploads: ${uploadsCount} records`)
  
  const { count: xpCount } = await supabase
    .from('xp_events')
    .select('*', { count: 'exact', head: true })
  console.log(`   ✓ xp_events: ${xpCount} records\n`)
  
  // Check student profiles
  console.log('👥 Student Profiles:\n')
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
  
  if (students) {
    console.log(`   Found ${students.length} student profile(s)`)
    students.forEach((student, idx) => {
      console.log(`   ${idx + 1}. ${student.full_name || 'Unknown'}`)
      console.log(`      - XP: ${student.xp ?? 'N/A'}`)
      console.log(`      - Level: ${student.level ?? 'N/A'}`)
      console.log(`      - Has badges column: ${student.hasOwnProperty('badges')}`)
    })
  }
  console.log('')
  
  // Check content structure
  console.log('📚 Content Structure:\n')
  
  const { count: zonesCount } = await supabase
    .from('zones')
    .select('*', { count: 'exact', head: true })
  console.log(`   ✓ zones: ${zonesCount} records`)
  
  const { count: chaptersCount } = await supabase
    .from('chapters')
    .select('*', { count: 'exact', head: true })
  console.log(`   ✓ chapters: ${chaptersCount} records`)
  
  const { count: phasesCount } = await supabase
    .from('phases')
    .select('*', { count: 'exact', head: true })
  console.log(`   ✓ phases: ${phasesCount} records\n`)
  
  // Check chapter chunks and images
  console.log('🖼️  Chapter Images:\n')
  const { data: chapters } = await supabase
    .from('chapters')
    .select('day_number, title, chunks')
    .order('day_number')
  
  if (chapters) {
    for (const chapter of chapters) {
      const chunksArray = chapter.chunks as any[]
      if (chunksArray && Array.isArray(chunksArray)) {
        const chunksWithImages = chunksArray.filter(c => c.imageUrl && c.imageUrl !== 'null').length
        console.log(`   Day ${chapter.day_number}: ${chapter.title}`)
        console.log(`      - ${chunksArray.length} chunks, ${chunksWithImages} with images`)
        
        // Show first image URL as sample
        const firstImageChunk = chunksArray.find(c => c.imageUrl && c.imageUrl !== 'null')
        if (firstImageChunk) {
          console.log(`      - Sample URL: ${firstImageChunk.imageUrl.substring(0, 60)}...`)
        }
      } else {
        console.log(`   Day ${chapter.day_number}: ${chapter.title} - No chunks`)
      }
    }
  }
  
  console.log('\n✅ Verification complete!\n')
}

main()
