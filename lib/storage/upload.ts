import { createClient } from '@/lib/supabase/client'

export async function uploadChapterAsset(
  file: File,
  path: string
): Promise<{ url: string; error?: string }> {
  const supabase = createClient()

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chapter-assets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: '', error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chapter-assets')
      .getPublicUrl(data.path)

    return { url: publicUrl }
  } catch (error: any) {
    console.error('Upload exception:', error)
    return { url: '', error: error.message || 'Upload failed' }
  }
}
