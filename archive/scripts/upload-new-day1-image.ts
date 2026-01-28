import { createAdminClient } from '@/lib/supabase/admin'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: join(process.cwd(), '.env.local') })

const BUCKET_NAME = 'chunk-images'
const DAY_NUMBER = 1
const IMAGE_PATH = 'public/WhatsApp Image 2026-01-17 at 1.18.29 PM.jpeg'

async function uploadNewImageToDay1() {
  console.log('🚀 Starting image upload for Day 1, Chunk 1...\n')
  
  const supabase = createAdminClient()
  
  try {
    // Step 1: Read the image file
    console.log('📁 Reading image file...')
    const imageBuffer = readFileSync(join(process.cwd(), IMAGE_PATH))
    console.log(`✅ File read successfully (${imageBuffer.length} bytes)\n`)
    
    // Step 2: Upload to Supabase Storage
    console.log('☁️  Uploading to Supabase Storage...')
    const timestamp = Date.now()
    const storagePath = `day${DAY_NUMBER}/chunk1/${timestamp}.jpeg`
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }
    
    console.log(`✅ Uploaded to: ${storagePath}\n`)
    
    // Step 3: Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)
    
    const publicUrl = urlData.publicUrl
    console.log(`🔗 Public URL: ${publicUrl}\n`)
    
    // Step 4: Fetch current chapter data
    console.log('📖 Fetching Day 1 chapter data...')
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, day_number, chunks')
      .eq('day_number', DAY_NUMBER)
      .single()
    
    if (chapterError || !chapter) {
      throw new Error(`Failed to fetch chapter: ${chapterError?.message || 'Chapter not found'}`)
    }
    
    console.log(`✅ Found chapter: ID ${chapter.id}\n`)
    
    // Step 5: Update first chunk with new image URL
    console.log('📝 Updating first chunk with image URL...')
    const chunks = chapter.chunks as any[]
    
    if (!chunks || chunks.length === 0) {
      throw new Error('No chunks found for Day 1')
    }
    
    // Update the first chunk's imageUrl
    chunks[0] = {
      ...chunks[0],
      imageUrl: publicUrl
    }
    
    // Step 6: Save updated chunks back to database
    const { error: updateError } = await supabase
      .from('chapters')
      .update({ chunks })
      .eq('id', chapter.id)
    
    if (updateError) {
      throw new Error(`Failed to update chapter: ${updateError.message}`)
    }
    
    console.log('✅ Chapter updated successfully!\n')
    
    // Step 7: Verify the update
    console.log('🔍 Verifying update...')
    const { data: verifyData } = await supabase
      .from('chapters')
      .select('chunks')
      .eq('id', chapter.id)
      .single()
    
    const verifiedChunks = verifyData?.chunks as any[]
    const firstChunkImage = verifiedChunks?.[0]?.imageUrl
    
    if (firstChunkImage === publicUrl) {
      console.log('✅ Verification successful!\n')
      console.log('═══════════════════════════════════════════')
      console.log('✨ SUCCESS! Image uploaded and linked to Day 1, Chunk 1')
      console.log('═══════════════════════════════════════════')
      console.log(`\n📸 Image URL: ${publicUrl}`)
      console.log(`\n🎯 You can now see this image in Learning Mode for Day 1`)
    } else {
      console.log('⚠️  Verification failed - URL mismatch')
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

uploadNewImageToDay1()
