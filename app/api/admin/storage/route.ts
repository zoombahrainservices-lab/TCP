import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { listAllImages, deleteImage, getImageMetadata, getStorageUsage } from '@/lib/storage/management'

// GET - List images or get metadata
export async function GET(request: NextRequest) {
  try {
    await requireAuth('admin')

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const path = searchParams.get('path')

    switch (action) {
      case 'list': {
        const prefix = searchParams.get('prefix') || undefined
        const images = await listAllImages(prefix)
        return NextResponse.json({ images })
      }

      case 'metadata': {
        if (!path) {
          return NextResponse.json({ error: 'Path required' }, { status: 400 })
        }
        const metadata = await getImageMetadata(path)
        if (!metadata) {
          return NextResponse.json({ error: 'Image not found' }, { status: 404 })
        }
        return NextResponse.json({ metadata })
      }

      case 'usage': {
        const usage = await getStorageUsage()
        return NextResponse.json({ usage })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Storage GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Storage operation failed' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an image
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth('admin')

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 })
    }

    const result = await deleteImage(path)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Delete failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Storage DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    )
  }
}
