/**
 * Check if the image file exists in Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkStorage() {
  try {
    console.log('🔍 Checking Supabase Storage...\n')

    // List files in the bucket
    const { data: files, error } = await supabase.storage
      .from('chunk-images')
      .list('day1/chunk1', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error(`❌ Error listing files: ${error.message}`)
      process.exit(1)
    }

    if (!files || files.length === 0) {
      console.log('❌ No files found in day1/chunk1/')
      console.log('\n💡 The image might not have been uploaded correctly.')
      console.log('   Try uploading again via the admin UI.')
    } else {
      console.log(`✅ Found ${files.length} file(s) in day1/chunk1/:`)
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${(file.metadata?.size / 1024).toFixed(2)}KB)`)
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('chunk-images')
          .getPublicUrl(`day1/chunk1/${file.name}`)
        
        console.log(`      URL: ${urlData.publicUrl}`)
      })
    }

    // Also check the bucket settings
    console.log('\n📦 Checking bucket configuration...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error(`❌ Error listing buckets: ${bucketError.message}`)
    } else {
      const chunkBucket = buckets?.find(b => b.name === 'chunk-images')
      if (chunkBucket) {
        console.log(`✅ Bucket 'chunk-images' exists`)
        console.log(`   Public: ${chunkBucket.public ? 'Yes ✅' : 'No ❌'}`)
        if (!chunkBucket.public) {
          console.log('\n⚠️  WARNING: Bucket is not public!')
          console.log('   Go to Supabase Dashboard → Storage → chunk-images')
          console.log('   Make sure "Public bucket" is enabled')
        }
      } else {
        console.log('❌ Bucket "chunk-images" not found')
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkStorage()
