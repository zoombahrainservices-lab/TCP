/**
 * Script to add image to first chunk of Day 1
 * Uploads image to Supabase Storage and updates the chunk in database
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('   Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
const BUCKET_NAME = 'chunk-images'
const DAY_NUMBER = 1

async function addImageToFirstChunk(imagePath: string) {
  try {
    console.log('📸 Adding image to first chunk of Day 1...\n')

    // 1. Verify image file exists
    const fullPath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.join(process.cwd(), imagePath)
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Image file not found: ${fullPath}`)
      process.exit(1)
    }

    const stats = fs.statSync(fullPath)
    console.log(`✅ Found image: ${path.basename(fullPath)} (${(stats.size / 1024).toFixed(2)}KB)`)

    // 2. Get Day 1 chapter
    console.log('\n📖 Fetching Day 1 chapter...')
    const { data: chapters, error: chapterError } = await supabase
      .from('chapters')
      .select('id, day_number, chunks')
      .eq('day_number', DAY_NUMBER)

    if (chapterError) {
      console.error(`❌ Failed to fetch chapter: ${chapterError.message}`)
      process.exit(1)
    }

    if (!chapters || chapters.length === 0) {
      console.error('❌ Day 1 chapter not found')
      process.exit(1)
    }

    const chapter = chapters[0]

    const chunks = Array.isArray(chapter.chunks) ? chapter.chunks : []
    if (chunks.length === 0) {
      console.error('❌ Day 1 has no chunks')
      process.exit(1)
    }

    console.log(`✅ Found ${chunks.length} chunk(s)`)
    const firstChunk = chunks[0]
    const chunkId = firstChunk.id || 1

    // 3. Read image file
    console.log('\n📤 Reading image file...')
    const imageBuffer = fs.readFileSync(fullPath)
    const fileExt = path.extname(fullPath).slice(1).toLowerCase() || 'png'
    
    const contentTypeMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    }
    const contentType = contentTypeMap[fileExt] || 'image/png'

    // 4. Upload to Supabase Storage
    console.log('\n☁️  Uploading to Supabase Storage...')
    const timestamp = Date.now()
    const storagePath = `day${DAY_NUMBER}/chunk${chunkId}/${timestamp}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, imageBuffer, {
        contentType: contentType,
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ Upload failed: ${uploadError.message}`)
      if (uploadError.message.includes('Bucket not found')) {
        console.error('\n💡 Tip: Create the "chunk-images" bucket in Supabase Dashboard → Storage')
        console.error('   Make sure it is set to Public')
      }
      process.exit(1)
    }

    console.log(`✅ Uploaded to: ${storagePath}`)

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)

    if (!urlData?.publicUrl) {
      console.error('❌ Failed to get public URL')
      process.exit(1)
    }

    const imageUrl = urlData.publicUrl
    console.log(`✅ Public URL: ${imageUrl}`)

    // 6. Update first chunk with image URL
    console.log('\n💾 Updating first chunk with image URL...')
    const updatedChunks = [...chunks]
    updatedChunks[0] = {
      ...updatedChunks[0],
      imageUrl: imageUrl
    }

    const { error: updateError } = await supabase
      .from('chapters')
      .update({ chunks: updatedChunks })
      .eq('id', chapter.id)

    if (updateError) {
      console.error(`❌ Failed to update chapter: ${updateError.message}`)
      process.exit(1)
    }

    console.log('\n✅ Successfully added image to first chunk!')
    console.log('\n📋 Summary:')
    console.log(`   - Image: ${path.basename(fullPath)}`)
    console.log(`   - Chunk: First chunk (ID: ${chunkId})`)
    console.log(`   - URL: ${imageUrl}`)
    console.log('\n✨ The image will now appear in Learning Mode for Day 1!')
    console.log('   Refresh the page to see it.')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Main execution
const imagePath = process.argv[2] || 'tcp-platform/public/WhatsApp Image 2026-01-17 at 12.38.44 PM.jpeg'

addImageToFirstChunk(imagePath)
