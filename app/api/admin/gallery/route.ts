import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth/guards'

export async function GET() {
  try {
    await requireAuth('admin')
    
    const admin = createAdminClient()
    
    // List all files in the chapter-assets bucket
    const { data, error } = await admin.storage
      .from('chapter-assets')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Storage list error:', error)
      return NextResponse.json({ images: [] })
    }

    // Get public URLs for all files
    const images = data
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(file => {
        const { data: urlData } = admin.storage
          .from('chapter-assets')
          .getPublicUrl(file.name)
        return urlData.publicUrl
      })

    return NextResponse.json({ images })
  } catch (error: any) {
    console.error('Gallery route error:', error)
    return NextResponse.json({ error: error.message, images: [] }, { status: 500 })
  }
}
