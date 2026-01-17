/**
 * Script to verify the image was added to the first chunk
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

async function verifyImage() {
  try {
    console.log('🔍 Verifying image in first chunk...\n')

    // Get Day 1 chapter
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('id, day_number, chunks')
      .eq('day_number', 1)

    if (error || !chapters || chapters.length === 0) {
      console.error(`❌ Failed to fetch chapter: ${error?.message || 'Not found'}`)
      process.exit(1)
    }

    const chapter = chapters[0]
    const chunks = Array.isArray(chapter.chunks) ? chapter.chunks : []

    if (chunks.length === 0) {
      console.error('❌ No chunks found')
      process.exit(1)
    }

    const firstChunk = chunks[0]
    console.log('📋 First chunk data:')
    console.log(JSON.stringify(firstChunk, null, 2))

    if (firstChunk.imageUrl) {
      console.log(`\n✅ Image URL found: ${firstChunk.imageUrl}`)
      
      // Test if image is accessible
      console.log('\n🌐 Testing image accessibility...')
      try {
        const response = await fetch(firstChunk.imageUrl, { method: 'HEAD' })
        if (response.ok) {
          console.log(`✅ Image is accessible (Status: ${response.status})`)
          console.log(`   Content-Type: ${response.headers.get('content-type')}`)
        } else {
          console.log(`❌ Image not accessible (Status: ${response.status})`)
        }
      } catch (err: any) {
        console.log(`❌ Error accessing image: ${err.message}`)
      }
    } else {
      console.log('\n❌ No imageUrl found in first chunk!')
      console.log('   The image was not saved to the chunk.')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

verifyImage()
