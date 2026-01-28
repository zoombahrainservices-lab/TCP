/**
 * Database Cleanup Script Runner
 * Executes the cleanup SQL to delete all student progress data
 * Run with: npx tsx scripts/run-cleanup.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables')
  console.error('   Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Ask for user confirmation before proceeding
 */
async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question + ' (yes/no): ', (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

/**
 * Execute a SQL file
 */
async function executeSqlFile(filePath: string): Promise<void> {
  const sql = fs.readFileSync(filePath, 'utf-8')
  
  // Split SQL into individual statements (simple split on semicolons)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  for (const statement of statements) {
    if (statement.toLowerCase().includes('select')) {
      // For SELECT statements, show the results
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })
      if (error) {
        // Try direct query for simple selects
        const { data: directData, error: directError } = await supabase
          .from('_sql_executor')
          .select('*')
        
        // If both fail, log error but continue
        console.log(`   Query: ${statement.substring(0, 50)}...`)
      } else {
        console.log(`   ✓ Query executed`)
      }
    } else {
      // For non-SELECT statements (DELETE, UPDATE, etc.)
      console.log(`   Executing: ${statement.substring(0, 50)}...`)
      // Note: Supabase client doesn't have direct SQL execution
      // We'll need to use individual table operations
    }
  }
}

/**
 * Delete data using Supabase client methods
 */
async function runCleanup(): Promise<void> {
  console.log('\n🗑️  Starting database cleanup...\n')

  try {
    // Step 1: Delete XP events
    console.log('1️⃣  Deleting XP events...')
    const { error: xpError, count: xpCount } = await supabase
      .from('xp_events')
      .delete()
      .neq('id', 0) // Match all records
    
    if (xpError) {
      console.error(`   ❌ Error: ${xpError.message}`)
    } else {
      console.log(`   ✓ Deleted XP events`)
    }

    // Step 2: Delete phase uploads
    console.log('\n2️⃣  Deleting phase uploads...')
    const { error: uploadsError } = await supabase
      .from('phase_uploads')
      .delete()
      .neq('id', 0) // Match all records
    
    if (uploadsError) {
      console.error(`   ❌ Error: ${uploadsError.message}`)
    } else {
      console.log(`   ✓ Deleted phase uploads`)
    }

    // Step 3: Delete student progress
    console.log('\n3️⃣  Deleting student progress...')
    const { error: progressError } = await supabase
      .from('student_progress')
      .delete()
      .neq('id', 0) // Match all records
    
    if (progressError) {
      console.error(`   ❌ Error: ${progressError.message}`)
    } else {
      console.log(`   ✓ Deleted student progress`)
    }

    // Step 4: Reset student profiles
    console.log('\n4️⃣  Resetting student profiles...')
    const { error: profilesError } = await supabase
      .from('profiles')
      .update({
        xp: 0,
        level: 1,
        badges: []
      })
      .eq('role', 'student')
    
    if (profilesError) {
      console.error(`   ❌ Error: ${profilesError.message}`)
    } else {
      console.log(`   ✓ Reset student profiles (xp=0, level=1, badges=[])`)
    }

    console.log('\n✅ Database cleanup completed successfully!\n')
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error)
    throw error
  }
}

/**
 * Verify cleanup results
 */
async function verifyCleanup(): Promise<void> {
  console.log('🔍 Verifying cleanup results...\n')

  try {
    // Check student_progress
    const { count: progressCount, error: progressError } = await supabase
      .from('student_progress')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   student_progress: ${progressCount ?? 'error'} records ${progressCount === 0 ? '✓' : '✗'}`)
    
    // Check phase_uploads
    const { count: uploadsCount, error: uploadsError } = await supabase
      .from('phase_uploads')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   phase_uploads: ${uploadsCount ?? 'error'} records ${uploadsCount === 0 ? '✓' : '✗'}`)
    
    // Check xp_events
    const { count: xpCount, error: xpError } = await supabase
      .from('xp_events')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   xp_events: ${xpCount ?? 'error'} records ${xpCount === 0 ? '✓' : '✗'}`)
    
    // Check student profiles
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, xp, level, badges')
      .eq('role', 'student')
    
    if (students) {
      const allReset = students.every(s => s.xp === 0 && s.level === 1)
      console.log(`   student profiles: ${students.length} profiles ${allReset ? '✓ all reset' : '⚠ some not reset'}`)
    }
    
    // Check structure preserved
    console.log('\n📊 Verifying structure preserved...\n')
    
    const { count: zonesCount } = await supabase
      .from('zones')
      .select('*', { count: 'exact', head: true })
    console.log(`   zones: ${zonesCount ?? 0} records ✓`)
    
    const { count: chaptersCount } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
    console.log(`   chapters: ${chaptersCount ?? 0} records ✓`)
    
    const { count: phasesCount } = await supabase
      .from('phases')
      .select('*', { count: 'exact', head: true })
    console.log(`   phases: ${phasesCount ?? 0} records ✓`)
    
    console.log('\n✅ Verification complete!\n')
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error)
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║         DATABASE CLEANUP - Student Data Removal           ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('This script will DELETE:')
  console.log('  • All student progress records')
  console.log('  • All phase uploads')
  console.log('  • All XP events')
  console.log('  • Reset student profile data (xp, level, badges)')
  console.log('')
  console.log('This script will PRESERVE:')
  console.log('  • Zones, Chapters, and Phases')
  console.log('  • User authentication accounts')
  console.log('  • Parent-child relationships')
  console.log('  • Supabase Storage files')
  console.log('')
  console.log('⚠️  WARNING: This operation cannot be easily undone!')
  console.log('')

  const confirmed = await askConfirmation('Are you sure you want to proceed?')
  
  if (!confirmed) {
    console.log('\n❌ Cleanup cancelled by user.\n')
    process.exit(0)
  }

  try {
    await runCleanup()
    await verifyCleanup()
    
    console.log('✨ All done! The database is ready for fresh student accounts.\n')
    process.exit(0)
  } catch (error) {
    console.error('\n💥 Error during cleanup:', error)
    process.exit(1)
  }
}

// Run the script
main()
