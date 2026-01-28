import { createClient } from '@/lib/supabase/server'

export async function uploadFile(file: File, userId: string): Promise<string> {
  const supabase = await createClient()
  
  // Generate unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error } = await supabase.storage
    .from('student-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  return filePath
}

export async function getPublicUrl(path: string): Promise<string> {
  const supabase = await createClient()
  
  const { data } = supabase.storage
    .from('student-uploads')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase.storage
    .from('student-uploads')
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => file.type.startsWith(type))
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}
