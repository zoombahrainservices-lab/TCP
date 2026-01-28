import { createClient } from '@/lib/supabase/client'

const BUCKET_NAME = 'chunk-images'

export interface UploadChunkImageParams {
  file: File
  chunkId: number
  dayNumber: number
}

/**
 * Upload an image for a chunk and return the public URL
 */
export async function uploadChunkImage({
  file,
  chunkId,
  dayNumber
}: UploadChunkImageParams): Promise<string> {
  const supabase = createClient()
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('Image must be smaller than 5MB')
  }
  
  // Generate unique path
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const sanitizedExt = fileExt?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `day${dayNumber}/chunk${chunkId}/${timestamp}.${sanitizedExt}`
  
  // Upload file
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      upsert: true,
      contentType: file.type
    })
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }
  
  // Get public URL
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  
  if (!data.publicUrl) {
    throw new Error('Failed to get public URL')
  }
  
  return data.publicUrl
}

/**
 * Remove an image from storage using its public URL
 */
export async function removeChunkImage(publicUrl: string): Promise<void> {
  const supabase = createClient()
  
  // Extract path from public URL
  // URL format: https://.../storage/v1/object/public/chunk-images/path/to/file.jpg
  const pathMatch = publicUrl.match(/chunk-images\/(.+)$/)
  
  if (!pathMatch || !pathMatch[1]) {
    throw new Error('Invalid public URL format')
  }
  
  const path = pathMatch[1]
  
  // Delete file
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])
  
  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}
