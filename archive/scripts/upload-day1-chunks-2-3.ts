import { createAdminClient } from '@/lib/supabase/admin'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: join(process.cwd(), '.env.local') })

const BUCKET_NAME = 'chunk-images'
const DAY_NUMBER = 1

const IMAGES = [
  {
    chunkId: 2,
    path: 'public/WhatsApp Image 2026-01-17 at 1.32.05 PM.jpeg',
    description: '2nd slide image'
  },
  {
    chunkId: 3,
    path: 'public/WhatsApp Image 2026-01-17 at 1.36.06 PM.jpeg',
    description: '3rd slide image'
  }
]

async function uploadImagesToDay1() {
  console.log('🚀 Starting image uploads for Day 1, Chunks 2 & 3...\n')
  
  const supabase = createAdminClient()
  
  try {
    // Step 1: Fetch current chapter data
    console.log('📖 Fetching Day 1 chapter data...')
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, day_number, chunks')
      .eq('day_number', DAY_NUMBER)
      .single()
    
    if (chapterError || !chapter) {
      throw new Error(`Failed to fetch chapter: ${chapterError?.message || 'Chapter not found'}`)
    }
    
    console.log(`✅ Found chapter: ID ${chapter.id}`)
    const chunks = chapter.chunks as any[]
    
    if (!chunks || chunks.length < 3) {
      throw new Error(`Not enough chunks found. Expected at least 3, found ${chunks.length}`)
    }
    
    console.log(`✅ Found ${chunks.length} chunks\n`)
    
    // Step 2: Upload each image
    const uploadedUrls: { chunkId: number; url: string }[] = []
    
    for (const image of IMAGES) {
      console.log(`📸 Processing ${image.description} (Chunk ${image.chunkId})...`)
      
      // Read the image file
      console.log(`   📁 Reading: ${image.path}`)
      const imageBuffer = readFileSync(join(process.cwd(), image.path))
      console.log(`   ✅ File read (${imageBuffer.length} bytes)`)
      
      // Upload to Supabase Storage
      console.log(`   ☁️  Uploading to Supabase Storage...`)
      const timestamp = Date.now()
      const storagePath = `day${DAY_NUMBER}/chunk${image.chunkId}/${timestamp}.jpeg`
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })
      
      if (uploadError) {
        throw new Error(`Upload failed for chunk ${image.chunkId}: ${uploadError.message}`)
      }
      
      console.log(`   ✅ Uploaded to: ${storagePath}`)
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath)
      
      const publicUrl = urlData.publicUrl
      console.log(`   🔗 Public URL: ${publicUrl}`)
      
      uploadedUrls.push({ chunkId: image.chunkId, url: publicUrl })
      
      // Update the chunk with image URL
      chunks[image.chunkId - 1] = {
        ...chunks[image.chunkId - 1],
        imageUrl: publicUrl
      }
      
      console.log(`   ✅ Chunk ${image.chunkId} updated with image URL\n`)
    }
    
    // Step 3: Save updated chunks back to database
    console.log('💾 Saving updated chunks to database...')
    const { error: updateError } = await supabase
      .from('chapters')
      .update({ chunks })
      .eq('id', chapter.id)
    
    if (updateError) {
      throw new Error(`Failed to update chapter: ${updateError.message}`)
    }
    
    console.log('✅ Chapter updated successfully!\n')
    
    // Step 4: Verify the update
    console.log('🔍 Verifying update...')
    const { data: verifyData } = await supabase
      .from('chapters')
      .select('chunks')
      .eq('id', chapter.id)
      .single()
    
    const verifiedChunks = verifyData?.chunks as any[]
    
    console.log('\n═══════════════════════════════════════════')
    console.log('✨ SUCCESS! Images uploaded and linked')
    console.log('═══════════════════════════════════════════')
    
    for (const uploaded of uploadedUrls) {
      const chunk = verifiedChunks[uploaded.chunkId - 1]
      if (chunk?.imageUrl === uploaded.url) {
        console.log(`\n✅ Chunk ${uploaded.chunkId}: ${uploaded.url}`)
      } else {
        console.log(`\n⚠️  Chunk ${uploaded.chunkId}: Verification failed`)
      }
    }
    
    console.log('\n🎯 Images are now available in Learning Mode for Day 1')
    console.log('📦 All images are stored in Supabase Storage bucket: chunk-images')
    console.log('═══════════════════════════════════════════\n')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    if (error.stack) {
      console.error('\nStack:', error.stack)
    }
    process.exit(1)
  }
}

uploadImagesToDay1()
