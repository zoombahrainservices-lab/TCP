import { createAdminClient } from '@/lib/supabase/admin'
import { config } from 'dotenv'
import { join } from 'path'
import { readFileSync } from 'fs'

// Load environment variables
config({ path: join(process.cwd(), '.env.local') })

async function addTaskDeadlineHoursColumn() {
  console.log('🔧 Adding task_deadline_hours column to chapters table...\n')
  
  const supabase = createAdminClient()
  
  try {
    // Read the migration SQL
    const migrationPath = join(process.cwd(), 'supabase/migrations/007_add_task_deadline_hours.sql')
    const sql = readFileSync(migrationPath, 'utf-8')
    
    // Execute the SQL
    console.log('📝 Executing migration SQL...')
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // If RPC doesn't exist, try direct query
      console.log('⚠️  RPC method not available, trying direct ALTER TABLE...')
      
      // Check if column exists first
      const { data: columns, error: checkError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'chapters')
        .eq('column_name', 'task_deadline_hours')
      
      if (checkError || !columns || columns.length === 0) {
        // Column doesn't exist, add it
        console.log('➕ Column does not exist, adding it...')
        
        // Use raw SQL via query
        const alterSql = `
          ALTER TABLE chapters
          ADD COLUMN IF NOT EXISTS task_deadline_hours INTEGER DEFAULT 24;
        `
        
        // Supabase doesn't support direct ALTER TABLE via client
        // So we'll use a workaround: try to update a record with the field
        // If it fails, the column doesn't exist
        
        console.log('✅ Migration SQL prepared')
        console.log('\n═══════════════════════════════════════════')
        console.log('⚠️  MANUAL STEP REQUIRED')
        console.log('═══════════════════════════════════════════')
        console.log('\nPlease run this SQL in your Supabase SQL Editor:')
        console.log('\n' + alterSql)
        console.log('\nOr run the migration file:')
        console.log('supabase/migrations/007_add_task_deadline_hours.sql')
        console.log('\n═══════════════════════════════════════════\n')
        
        return
      } else {
        console.log('✅ Column already exists!')
        return
      }
    }
    
    console.log('✅ Migration executed successfully!')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.log('\n═══════════════════════════════════════════')
    console.log('⚠️  MANUAL STEP REQUIRED')
    console.log('═══════════════════════════════════════════')
    console.log('\nPlease run this SQL in your Supabase SQL Editor:')
    console.log('\nALTER TABLE chapters')
    console.log('  ADD COLUMN IF NOT EXISTS task_deadline_hours INTEGER DEFAULT 24;')
    console.log('\n═══════════════════════════════════════════\n')
  }
}

addTaskDeadlineHoursColumn()
