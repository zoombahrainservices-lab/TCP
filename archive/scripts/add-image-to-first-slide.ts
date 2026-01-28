/**
 * Script to add an image to the first slide/chunk of Day 1
 * 
 * Usage:
 *   tsx scripts/add-image-to-first-slide.ts <path-to-image-file>
 * 
 * This script will:
 * 1. Upload the image to Supabase Storage (chunk-images bucket)
 * 2. Add the image URL to the first chunk of Day 1 chapter
 * 
 * Prerequisites:
 *   - Image file must exist locally
 *   - Supabase bucket 'chunk-images' must exist and be public
 *   - Day 1 chapter must exist with chunks
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const BUCKET_NAME = 'chunk-images'
const DAY_NUMBER = 1

async function addImageToFirstChunk(imagePath: string) {
  try {
    // 1. Verify image file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image file not found: ${imagePath}`)
      process.exit(1)
    }

    const stats = fs.statSync(imagePath)
    if (!stats.isFile()) {
      console.error(`❌ Path is not a file: ${imagePath}`)
      process.exit(1)
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (stats.size > maxSize) {
      console.error(`❌ Image file is too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max 5MB)`)
      process.exit(1)
    }

    console.log(`✅ Found image file: ${imagePath} (${(stats.size / 1024).toFixed(2)}KB)`)

    // 2. Get Day 1 chapter
    console.log('\n📖 Fetching Day 1 chapter...')
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, day_number, chunks')
      .eq('day_number', DAY_NUMBER)
      .single()

    if (chapterError || !chapter) {
      console.error(`❌ Failed to fetch Day 1 chapter: ${chapterError?.message || 'Chapter not found'}`)
      process.exit(1)
    }

    console.log(`✅ Found chapter: Day ${chapter.day_number} (ID: ${chapter.id})`)

    // 3. Check if chunks exist
    const chunks = Array.isArray(chapter.chunks) ? chapter.chunks : []
    if (chunks.length === 0) {
      console.error('❌ Day 1 chapter has no chunks. Please create chunks first.')
      process.exit(1)
    }

    console.log(`✅ Found ${chunks.length} chunk(s)`)

    // 4. Read image file
    console.log('\n📤 Reading image file...')
    const imageBuffer = fs.readFileSync(imagePath)
    const fileExt = path.extname(imagePath).slice(1).toLowerCase() || 'png'
    const fileName = path.basename(imagePath, path.extname(imagePath))
    
    // Determine content type
    const contentTypeMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    }
    const contentType = contentTypeMap[fileExt] || 'image/png'

    // 5. Upload to Supabase Storage
    console.log('\n☁️  Uploading to Supabase Storage...')
    const firstChunk = chunks[0]
    const chunkId = firstChunk.id || 1
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
      process.exit(1)
    }

    console.log(`✅ Uploaded to: ${storagePath}`)

    // 6. Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)

    if (!urlData?.publicUrl) {
      console.error('❌ Failed to get public URL')
      process.exit(1)
    }

    const imageUrl = urlData.publicUrl
    console.log(`✅ Public URL: ${imageUrl}`)

    // 7. Update first chunk with image URL
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

    console.log('✅ Successfully added image to first chunk!')
    console.log('\n📋 Summary:')
    console.log(`   - Image: ${path.basename(imagePath)}`)
    console.log(`   - Chunk: First chunk (ID: ${chunkId})`)
    console.log(`   - URL: ${imageUrl}`)
    console.log('\n✨ Done! The image will now appear in the reader for Day 1.')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Main execution
const imagePath = process.argv[2]

if (!imagePath) {
  console.error('Usage: tsx scripts/add-image-to-first-slide.ts <path-to-image-file>')
  console.error('\nExample:')
  console.error('  tsx scripts/add-image-to-first-slide.ts ./my-image.png')
  process.exit(1)
}

addImageToFirstChunk(imagePath)
