import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPageSchema() {
  console.log('\n=== CHECKING STEP_PAGES SCHEMA ===\n')

  // Get a sample page to see its structure
  const { data: samplePage } = await supabase
    .from('step_pages')
    .select('*')
    .limit(1)
    .single()

  if (samplePage) {
    console.log('Sample Page Structure:')
    console.log(JSON.stringify(samplePage, null, 2))
  }

  console.log('\n=== DONE ===\n')
}

checkPageSchema().catch(console.error)
