/**
 * Migration Script: Upload existing images to Supabase Storage
 * 
 * This script:
 * 1. Scans all step_pages for image blocks with src URLs
 * 2. Downloads each image from its current URL
 * 3. Uploads to chapter-assets bucket with organized structure
 * 4. Updates the database with new storage URLs
 * 
 * Run with: npx ts-node scripts/migrate-images-to-storage.ts
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import path from 'path'
import { randomBytes } from 'crypto'

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ImageBlock {
  type: 'image'
  src: string
  alt?: string
  caption?: string
}

interface Page {
  id: string
  step_id: string
  content: any[]
  order_index: number
}

interface Step {
  id: string
  chapter_id: string
  slug: string
}

interface Chapter {
  id: string
  slug: string
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    // Skip if already in storage bucket
    if (url.includes('/storage/v1/object/public/chapter-assets/')) {
      console.log('  ⏭️  Already in storage bucket, skipping')
      return null
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer)
  } catch (error) {
    console.error(`  ❌ Failed to download: ${error}`)
    return null
  }
}

async function uploadToStorage(
  buffer: Buffer,
  chapterSlug: string,
  stepSlug: string,
  pageOrder: number,
  originalUrl: string
): Promise<string | null> {
  try {
    // Extract extension from original URL or default to jpg
    const urlPath = new URL(originalUrl).pathname
    const extension = path.extname(urlPath) || '.jpg'
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = randomBytes(4).toString('hex')
    const filename = `${timestamp}-${randomStr}${extension}`
    
    // Sanitize slugs
    const sanitizedChapterSlug = chapterSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    const sanitizedStepSlug = stepSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    
    const storagePath = `chapters/${sanitizedChapterSlug}/${sanitizedStepSlug}/page-${pageOrder}/${filename}`
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('chapter-assets')
      .upload(storagePath, buffer, {
        contentType: getContentType(extension),
        upsert: false,
      })
    
    if (error) {
      console.error(`  ❌ Upload failed: ${error.message}`)
      return null
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chapter-assets')
      .getPublicUrl(storagePath)
    
    // Track in image_references table
    await supabase
      .from('image_references')
      .insert({
        storage_path: storagePath,
        storage_bucket: 'chapter-assets',
        file_size: buffer.length,
        content_type: getContentType(extension),
        chapter_slug: chapterSlug,
      })
      .catch(err => console.error('  ⚠️  Failed to track reference:', err.message))
    
    console.log(`  ✅ Uploaded to: ${storagePath}`)
    return urlData.publicUrl
  } catch (error: any) {
    console.error(`  ❌ Upload error: ${error.message}`)
    return null
  }
}

function getContentType(extension: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }
  return types[extension.toLowerCase()] || 'image/jpeg'
}

async function migrateImages() {
  console.log('🚀 Starting image migration to storage...\n')
  
  // 1. Fetch all pages with their chapters and steps
  const { data: pages, error: pagesError } = await supabase
    .from('step_pages')
    .select('id, step_id, content, order_index')
    .not('content', 'is', null)
  
  if (pagesError) {
    console.error('❌ Failed to fetch pages:', pagesError)
    return
  }
  
  console.log(`📄 Found ${pages.length} pages to scan\n`)
  
  let totalImages = 0
  let migratedImages = 0
  let skippedImages = 0
  let failedImages = 0
  
  for (const page of pages) {
    // Get step and chapter info
    const { data: step } = await supabase
      .from('chapter_steps')
      .select('id, chapter_id, slug')
      .eq('id', page.step_id)
      .single()
    
    if (!step) continue
    
    const { data: chapter } = await supabase
      .from('chapters')
      .select('id, slug')
      .eq('id', step.chapter_id)
      .single()
    
    if (!chapter) continue
    
    const content = page.content as any[]
    if (!content || !Array.isArray(content)) continue
    
    let pageUpdated = false
    const newContent = [...content]
    
    // 2. Scan for image blocks
    for (let i = 0; i < newContent.length; i++) {
      const block = newContent[i]
      
      if (block.type === 'image' && block.src) {
        totalImages++
        console.log(`\n📸 Image ${totalImages}:`)
        console.log(`  📍 Page: ${chapter.slug}/${step.slug}/page-${page.order_index}`)
        console.log(`  🔗 Original: ${block.src.substring(0, 80)}...`)
        
        // Skip if already in storage
        if (block.src.includes('/storage/v1/object/public/chapter-assets/')) {
          skippedImages++
          console.log('  ⏭️  Already migrated')
          continue
        }
        
        // 3. Download image
        const buffer = await downloadImage(block.src)
        if (!buffer) {
          failedImages++
          continue
        }
        
        // 4. Upload to storage
        const newUrl = await uploadToStorage(
          buffer,
          chapter.slug,
          step.slug,
          page.order_index,
          block.src
        )
        
        if (newUrl) {
          newContent[i] = { ...block, src: newUrl }
          pageUpdated = true
          migratedImages++
        } else {
          failedImages++
        }
      }
    }
    
    // 5. Update page if any images were migrated
    if (pageUpdated) {
      const { error: updateError } = await supabase
        .from('step_pages')
        .update({ content: newContent })
        .eq('id', page.id)
      
      if (updateError) {
        console.error(`  ❌ Failed to update page: ${updateError.message}`)
      } else {
        console.log(`  💾 Page updated with new URLs`)
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary:')
  console.log('='.repeat(60))
  console.log(`Total images found:     ${totalImages}`)
  console.log(`✅ Successfully migrated: ${migratedImages}`)
  console.log(`⏭️  Already in storage:   ${skippedImages}`)
  console.log(`❌ Failed:                ${failedImages}`)
  console.log('='.repeat(60))
  
  if (migratedImages > 0) {
    console.log('\n✨ Migration complete! All images are now in chapter-assets bucket.')
  } else if (skippedImages > 0) {
    console.log('\n✨ All images are already in storage bucket.')
  } else {
    console.log('\n⚠️  No images were migrated. Check the logs above for details.')
  }
}

// Run migration
migrateImages()
  .then(() => {
    console.log('\n✅ Script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
