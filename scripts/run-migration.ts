import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('\n=== RUNNING MIGRATION: Add hero_image_url to step_pages ===\n')

  const migrationPath = path.join(__dirname, '..', 'migrations', 'add_hero_image_to_pages.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    // Try direct query if RPC doesn't exist
    console.log('RPC not available, trying direct query...')
    
    const { error: directError } = await supabase.from('step_pages').select('hero_image_url').limit(1)
    
    if (directError && directError.message.includes('column') && directError.message.includes('does not exist')) {
      console.error('❌ Migration needed but cannot run automatically')
      console.log('\nPlease run this SQL in your Supabase SQL Editor:')
      console.log('─'.repeat(60))
      console.log(sql)
      console.log('─'.repeat(60))
      process.exit(1)
    } else if (!directError) {
      console.log('✅ Column hero_image_url already exists!')
    } else {
      console.error('Error checking column:', directError)
      process.exit(1)
    }
  } else {
    console.log('✅ Migration completed successfully!')
  }

  console.log('\n=== DONE ===\n')
}

runMigration().catch(console.error)
