/**
 * Upload Local Images to Supabase Storage
 * 
 * This script:
 * 1. Scans the /public folder for all images
 * 2. Uploads each image to chapter-assets bucket with organized structure
 * 3. Updates database references from local paths to storage URLs
 * 4. Provides detailed progress report
 * 
 * Run with: npx ts-node scripts/upload-local-images.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: '.env.local' })

const readFile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface UploadResult {
  localPath: string
  storagePath: string
  publicUrl: string
  size: number
}

// Map local paths to organized storage paths
function getStoragePath(localPath: string): { chapter: string; section: string; filename: string } {
  // Remove /public prefix if present
  const normalized = localPath.replace(/^\/public\//, '/').replace(/^public[\/\\]/, '')
  
  // Extract meaningful parts
  if (normalized.includes('/chapter/chapter 1/') || normalized.includes('\\chapter\\chapter 1\\')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'stage-star-silent-struggles',
      section: 'reading',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  if (normalized.includes('/chapter/chapter 2/') || normalized.includes('\\chapter\\chapter 2\\')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'genius-who-couldnt-speak',
      section: 'reading',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  if (normalized.includes('slider-work-on-quizz/chapter1/frameworks')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'stage-star-silent-struggles',
      section: 'framework',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  if (normalized.includes('slider-work-on-quizz/chapter1/technique')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'stage-star-silent-struggles',
      section: 'techniques',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  if (normalized.includes('slider-work-on-quizz/chapter1/follow through')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'stage-star-silent-struggles',
      section: 'follow-through',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  if (normalized.includes('slider-work-on-quizz/chapter1')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'stage-star-silent-struggles',
      section: 'reading',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  if (normalized.includes('map books')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'global',
      section: 'map-assets',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  if (normalized.includes('slider-work-on-quizz')) {
    const filename = path.basename(normalized)
    return {
      chapter: 'global',
      section: 'onboarding',
      filename: filename.replace(/\s+/g, '-').toLowerCase()
    }
  }
  
  // Global assets (BG.png, TCP-logo.png, etc.)
  const filename = path.basename(normalized)
  return {
    chapter: 'global',
    section: 'assets',
    filename: filename.replace(/\s+/g, '-').toLowerCase()
  }
}

async function getAllImageFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await readdir(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const fileStat = await stat(filePath)
    
    if (fileStat.isDirectory()) {
      await getAllImageFiles(filePath, fileList)
    } else {
      const ext = path.extname(file).toLowerCase()
      if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) {
        fileList.push(filePath)
      }
    }
  }
  
  return fileList
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

async function uploadImage(localPath: string): Promise<UploadResult | null> {
  try {
    // Read file
    const buffer = await readFile(localPath)
    const { chapter, section, filename } = getStoragePath(localPath)
    const extension = path.extname(filename)
    
    // Create storage path
    const storagePath = `chapters/${chapter}/${section}/${filename}`
    
    // Check if already uploaded
    const { data: existing } = await supabase.storage
      .from('chapter-assets')
      .list(`chapters/${chapter}/${section}`, {
        search: filename
      })
    
    if (existing && existing.length > 0) {
      console.log(`  ⏭️  Already exists: ${storagePath}`)
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chapter-assets')
        .getPublicUrl(storagePath)
      
      return {
        localPath,
        storagePath,
        publicUrl: urlData.publicUrl,
        size: buffer.length
      }
    }
    
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
    
    // Track in image_references table (best-effort, non-blocking)
    try {
      await supabase
        .from('image_references')
        .insert({
          storage_path: storagePath,
          storage_bucket: 'chapter-assets',
          file_size: buffer.length,
          content_type: getContentType(extension),
          chapter_slug: chapter,
        })
    } catch (err: any) {
      console.error('  ⚠️  Failed to track reference:', err?.message || err)
    }
    
    console.log(`  ✅ Uploaded: ${storagePath}`)
    
    return {
      localPath,
      storagePath,
      publicUrl: urlData.publicUrl,
      size: buffer.length
    }
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`)
    return null
  }
}

async function updateDatabaseReferences(mapping: Map<string, string>) {
  console.log('\n📝 Updating database references...\n')
  
  // Fetch all pages
  const { data: pages, error: pagesError } = await supabase
    .from('step_pages')
    .select('id, content')
    .not('content', 'is', null)
  
  if (pagesError) {
    console.error('❌ Failed to fetch pages:', pagesError)
    return 0
  }
  
  let updatedPages = 0
  
  for (const page of pages) {
    const content = page.content as any[]
    if (!content || !Array.isArray(content)) continue
    
    let hasChanges = false
    const newContent = content.map(block => {
      if (block.type === 'image' && block.src) {
        // Normalize the path for comparison
        const normalized = block.src
          .replace(/^\/public\//, '/')
          .replace(/\\/g, '/')
        
        // Try to find matching storage URL
        for (const [localPath, storageUrl] of mapping) {
          const localNormalized = localPath
            .replace(/^public[\\\/]/, '/')
            .replace(/\\/g, '/')
          
          if (normalized === localNormalized || 
              normalized.endsWith(path.basename(localPath)) ||
              localNormalized.includes(normalized)) {
            hasChanges = true
            console.log(`  🔄 ${block.src} → ${storageUrl}`)
            return { ...block, src: storageUrl }
          }
        }
      }
      return block
    })
    
    if (hasChanges) {
      const { error: updateError } = await supabase
        .from('step_pages')
        .update({ content: newContent })
        .eq('id', page.id)
      
      if (updateError) {
        console.error(`  ❌ Failed to update page ${page.id}:`, updateError.message)
      } else {
        updatedPages++
        console.log(`  ✅ Updated page ${page.id}`)
      }
    }
  }
  
  return updatedPages
}

async function main() {
  console.log('🚀 Starting local images upload...\n')
  
  const publicDir = path.join(process.cwd(), 'public')
  
  if (!fs.existsSync(publicDir)) {
    console.error('❌ Public directory not found:', publicDir)
    process.exit(1)
  }
  
  console.log('📂 Scanning public folder for images...\n')
  
  // Get all image files
  const imageFiles = await getAllImageFiles(publicDir)
  
  console.log(`📸 Found ${imageFiles.length} images\n`)
  
  let uploaded = 0
  let skipped = 0
  let failed = 0
  const pathMapping = new Map<string, string>()
  
  // Upload each image
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i]
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/')
    
    console.log(`\n[${i + 1}/${imageFiles.length}] ${relativePath}`)
    
    const result = await uploadImage(file)
    
    if (result) {
      if (result.publicUrl) {
        uploaded++
        // Store mapping for database update
        pathMapping.set(relativePath, result.publicUrl)
      } else {
        skipped++
      }
    } else {
      failed++
    }
  }
  
  // Update database references
  console.log('\n' + '='.repeat(60))
  const updatedPages = await updateDatabaseReferences(pathMapping)
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Upload Summary:')
  console.log('='.repeat(60))
  console.log(`Total images found:      ${imageFiles.length}`)
  console.log(`✅ Successfully uploaded:  ${uploaded}`)
  console.log(`⏭️  Already existed:       ${skipped}`)
  console.log(`❌ Failed:                 ${failed}`)
  console.log(`📝 Database pages updated: ${updatedPages}`)
  console.log('='.repeat(60))
  
  if (uploaded > 0) {
    console.log('\n✨ Upload complete! All images are now in chapter-assets bucket.')
  } else if (skipped > 0) {
    console.log('\n✨ All images are already in storage bucket.')
  }
  
  console.log('\n💡 Next steps:')
  console.log('1. Check Supabase Storage dashboard to verify uploads')
  console.log('2. Test image display in admin panel')
  console.log('3. Test image display on user-facing pages')
}

// Run upload
main()
  .then(() => {
    console.log('\n✅ Script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error)
    process.exit(1)
  })
