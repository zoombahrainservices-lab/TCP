/**
 * Empty the `chapter-assets` storage bucket.
 *
 * This uses the Supabase Storage API with the service role key.
 * It will delete ALL files in the `chapter-assets` bucket.
 *
 * Run with:
 *   npx ts-node scripts/empty-chapter-assets.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('⚠️  This will PERMANENTLY delete all files from the `chapter-assets` bucket.')
  console.log('Bucket: chapter-assets')

  // First, list a few files just to show what's there
  const { data: rootList, error: listError } = await supabase.storage
    .from('chapter-assets')
    .list('', { limit: 10 })

  if (listError) {
    console.error('❌ Failed to list bucket contents:', listError.message)
  } else {
    console.log('📂 Sample of current contents (up to 10 entries):')
    if (!rootList || rootList.length === 0) {
      console.log('  (bucket is already empty)')
    } else {
      for (const entry of rootList) {
        console.log('  -', entry.name)
      }
    }
  }

  console.log('\n🧹 Emptying bucket `chapter-assets`...\n')

  // Supabase JS v2 provides emptyBucket on the storage admin API when using a service key
  const { error: emptyError } = await supabase.storage.emptyBucket('chapter-assets')

  if (emptyError) {
    console.error('❌ Failed to empty bucket:', emptyError.message)
    process.exit(1)
  }

  console.log('✅ Bucket `chapter-assets` has been emptied.')
}

main()
  .then(() => {
    console.log('✅ Script finished')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Error while emptying bucket:', err)
    process.exit(1)
  })

