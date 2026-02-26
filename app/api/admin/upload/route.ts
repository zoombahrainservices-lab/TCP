import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth/guards'

export async function POST(request: NextRequest) {
  try {
    await requireAuth('admin')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const chapterSlug = formData.get('chapterSlug') as string || 'general'
    const stepSlug = formData.get('stepSlug') as string || 'content'
    const pageOrder = formData.get('pageOrder') as string || '0'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
      return NextResponse.json({ error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    const admin = createAdminClient()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const sanitizedChapterSlug = chapterSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    const sanitizedStepSlug = stepSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    
    // Create hierarchical path: chapters/{chapter-slug}/{step-slug}/page-{order}/{filename}
    const filename = `${timestamp}-${randomStr}.${extension}`
    const storagePath = `chapters/${sanitizedChapterSlug}/${sanitizedStepSlug}/page-${pageOrder}/${filename}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await admin.storage
      .from('chapter-assets')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = admin.storage
      .from('chapter-assets')
      .getPublicUrl(storagePath)

    // Track in image_references table (optional, best-effort)
    try {
      await admin
        .from('image_references')
        .insert({
          storage_path: storagePath,
          storage_bucket: 'chapter-assets',
          file_size: file.size,
          content_type: file.type,
          chapter_slug: chapterSlug,
        })
    } catch (err: any) {
      console.error('Failed to track image reference:', err?.message || err)
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      path: storagePath,
    })
  } catch (error: any) {
    console.error('Upload route error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
