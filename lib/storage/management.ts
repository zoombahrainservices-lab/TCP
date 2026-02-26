import { createClient } from '@/lib/supabase/server'

export interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: {
    eTag: string
    size: number
    mimetype: string
    cacheControl: string
  }
}

export interface ImageMetadata {
  path: string
  name: string
  size: number
  mimetype: string
  created_at: string
  updated_at: string
  publicUrl: string
}

/**
 * List all images in a given path (recursive)
 */
export async function listAllImages(prefix?: string): Promise<ImageMetadata[]> {
  const supabase = createClient()
  
  try {
    const { data: files, error } = await supabase.storage
      .from('chapter-assets')
      .list(prefix || '', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Error listing images:', error)
      return []
    }

    if (!files) return []

    // Filter for image files and format metadata
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const images: ImageMetadata[] = []

    for (const file of files) {
      const isImage = imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      if (!isImage) continue

      const filePath = prefix ? `${prefix}/${file.name}` : file.name
      const { data: { publicUrl } } = supabase.storage
        .from('chapter-assets')
        .getPublicUrl(filePath)

      images.push({
        path: filePath,
        name: file.name,
        size: file.metadata?.size || 0,
        mimetype: file.metadata?.mimetype || 'image/*',
        created_at: file.created_at || '',
        updated_at: file.updated_at || '',
        publicUrl
      })
    }

    return images
  } catch (error) {
    console.error('Exception listing images:', error)
    return []
  }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from('chapter-assets')
      .remove([path])

    if (error) {
      console.error('Error deleting image:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Exception deleting image:', error)
    return { success: false, error: error.message || 'Delete failed' }
  }
}

/**
 * Get metadata for a specific image
 */
export async function getImageMetadata(path: string): Promise<ImageMetadata | null> {
  const supabase = createClient()
  
  try {
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chapter-assets')
      .getPublicUrl(path)

    // Parse path to get name
    const name = path.split('/').pop() || path

    // For now, return basic metadata
    // In production, you might want to store this in a database
    return {
      path,
      name,
      size: 0,
      mimetype: 'image/*',
      created_at: '',
      updated_at: '',
      publicUrl
    }
  } catch (error) {
    console.error('Exception getting image metadata:', error)
    return null
  }
}

/**
 * Bulk upload files to storage
 */
export async function bulkUpload(
  files: File[],
  destinationPath: string
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const supabase = createClient()
  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    try {
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${destinationPath}/${fileName}`

      const { data, error } = await supabase.storage
        .from('chapter-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        errors.push(`${file.name}: ${error.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chapter-assets')
        .getPublicUrl(data.path)

      urls.push(publicUrl)
    } catch (error: any) {
      errors.push(`${file.name}: ${error.message || 'Upload failed'}`)
    }
  }

  return {
    success: errors.length === 0,
    urls,
    errors
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageUsage(): Promise<{
  totalSize: number
  totalImages: number
  byChapter: Record<string, { size: number; count: number }>
}> {
  const supabase = createClient()
  
  try {
    const { data: files, error } = await supabase.storage
      .from('chapter-assets')
      .list('', {
        limit: 10000,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error || !files) {
      return { totalSize: 0, totalImages: 0, byChapter: {} }
    }

    let totalSize = 0
    let totalImages = 0
    const byChapter: Record<string, { size: number; count: number }> = {}

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

    for (const file of files) {
      const isImage = imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      if (!isImage) continue

      const size = file.metadata?.size || 0
      totalSize += size
      totalImages++

      // Extract chapter slug from path (e.g., "chapter-1/...")
      const pathParts = file.name.split('/')
      if (pathParts.length > 0) {
        const chapterSlug = pathParts[0]
        if (!byChapter[chapterSlug]) {
          byChapter[chapterSlug] = { size: 0, count: 0 }
        }
        byChapter[chapterSlug].size += size
        byChapter[chapterSlug].count++
      }
    }

    return { totalSize, totalImages, byChapter }
  } catch (error) {
    console.error('Exception getting storage usage:', error)
    return { totalSize: 0, totalImages: 0, byChapter: {} }
  }
}
