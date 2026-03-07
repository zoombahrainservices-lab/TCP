import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth/guards'

/**
 * Migrate external image URLs in page content to Supabase bucket.
 * Finds all image blocks, downloads images, uploads to bucket, updates URLs.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth('admin')
    
    const { pageId, content, chapterSlug, stepSlug, pageOrder } = await request.json()
    
    if (!pageId || !content || !Array.isArray(content)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const admin = createAdminClient()
    const migratedImages: Array<{ oldUrl: string; newUrl: string; blockIndex: number }> = []
    const errors: Array<{ url: string; error: string }> = []

    // Find all image blocks in content
    const updatedContent = [...content]
    
    for (let i = 0; i < updatedContent.length; i++) {
      const block = updatedContent[i]
      
      // Skip if not an image block or no src
      if (!block || block.type !== 'image' || !block.src || typeof block.src !== 'string') {
        continue
      }

      const imageUrl = block.src.trim()
      
      // Skip if already in our bucket
      if (imageUrl.includes('supabase.co') && imageUrl.includes('chapter-assets')) {
        console.log(`Skipping already migrated image: ${imageUrl}`)
        continue
      }

      // Skip if it's a relative path (already local)
      if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
        console.log(`Skipping local image: ${imageUrl}`)
        continue
      }

      try {
        console.log(`Migrating image ${i + 1}: ${imageUrl}`)
        
        // Download the image
        const imageResponse = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`)
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
        
        // Determine file extension from content-type
        let ext = 'jpg'
        if (contentType.includes('png')) ext = 'png'
        else if (contentType.includes('webp')) ext = 'webp'
        else if (contentType.includes('gif')) ext = 'gif'
        else if (contentType.includes('svg')) ext = 'svg'

        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const filename = `migrated-${timestamp}-${randomStr}.${ext}`
        
        // Create storage path
        const sanitizedChapterSlug = (chapterSlug || 'general').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
        const sanitizedStepSlug = (stepSlug || 'content').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
        const storagePath = `chapters/${sanitizedChapterSlug}/${sanitizedStepSlug}/page-${pageOrder || 0}/${filename}`

        console.log(`Uploading to: ${storagePath}`)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await admin.storage
          .from('chapter-assets')
          .upload(storagePath, Buffer.from(imageBuffer), {
            contentType,
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: urlData } = admin.storage
          .from('chapter-assets')
          .getPublicUrl(storagePath)

        const newUrl = urlData.publicUrl

        // Track in image_references table (optional, best-effort)
        try {
          await admin
            .from('image_references')
            .insert({
              storage_path: storagePath,
              storage_bucket: 'chapter-assets',
              file_size: imageBuffer.byteLength,
              content_type: contentType,
              chapter_slug: chapterSlug || null,
            })
        } catch (err: any) {
          console.error('Failed to track image reference:', err?.message || err)
        }

        // Update the block in content
        updatedContent[i] = {
          ...block,
          src: newUrl
        }

        migratedImages.push({
          oldUrl: imageUrl,
          newUrl,
          blockIndex: i
        })

        console.log(`✓ Migrated: ${imageUrl} → ${newUrl}`)

      } catch (error: any) {
        console.error(`Failed to migrate image at block ${i}:`, error)
        errors.push({
          url: imageUrl,
          error: error.message || 'Unknown error'
        })
      }
    }

    // Update page content in database
    if (migratedImages.length > 0) {
      const { error: updateError } = await admin
        .from('step_pages')
        .update({ content: updatedContent })
        .eq('id', pageId)

      if (updateError) {
        return NextResponse.json({
          error: 'Failed to update page content',
          details: updateError.message
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      migratedImages,
      errors,
      updatedContent,
      summary: {
        total: migratedImages.length,
        failed: errors.length
      }
    })

  } catch (error: any) {
    console.error('Image migration error:', error)
    return NextResponse.json({ 
      error: error.message || 'Migration failed' 
    }, { status: 500 })
  }
}
