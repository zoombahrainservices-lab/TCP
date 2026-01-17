/**
 * Utility functions for loading chapter page images
 */

interface ChapterMetadata {
  totalPages: number
  title: string
}

/**
 * Get the image path for a specific chapter page
 */
export function getChapterPageImage(
  dayNumber: number,
  pageNumber: number,
  format: 'png' | 'webp' = 'png'
): string {
  const chapterDir = `chapter${String(dayNumber).padStart(2, '0')}`
  const pageFile = `page${String(pageNumber).padStart(2, '0')}.${format}`
  return `/chapters/${chapterDir}/${pageFile}`
}

/**
 * Get metadata for a chapter (client-side only)
 */
export async function getChapterMetadataClient(dayNumber: number): Promise<ChapterMetadata | null> {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const chapterDir = `chapter${String(dayNumber).padStart(2, '0')}`
    const metadataPath = `/chapters/${chapterDir}/meta.json`
    
    const response = await fetch(metadataPath)
    if (!response.ok) {
      return null
    }
    
    const metadata = await response.json()
    return {
      totalPages: metadata.totalPages || 0,
      title: metadata.title || `Day ${dayNumber}`,
    }
  } catch (error) {
    console.error(`Failed to load metadata for chapter ${dayNumber}:`, error)
    return null
  }
}

/**
 * Preload chapter pages (for smooth navigation)
 */
export function preloadChapterPages(
  dayNumber: number,
  startPage: number,
  endPage: number,
  format: 'png' | 'webp' = 'png'
): void {
  // Only preload in browser environment
  if (typeof window === 'undefined') return

  const imagesToPreload: string[] = []
  
  for (let page = Math.max(1, startPage); page <= endPage; page++) {
    const imagePath = getChapterPageImage(dayNumber, page, format)
    imagesToPreload.push(imagePath)
  }

  // Preload images
  imagesToPreload.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

/**
 * Check if a chapter has images available (client-side only)
 */
export async function hasChapterImages(dayNumber: number): Promise<boolean> {
  try {
    const metadata = await getChapterMetadataClient(dayNumber)
    return metadata !== null && metadata.totalPages > 0
  } catch {
    return false
  }
}

/**
 * Get all page image paths for a chapter
 */
export function getAllChapterPageImages(
  dayNumber: number,
  totalPages: number,
  format: 'png' | 'webp' = 'png'
): string[] {
  const images: string[] = []
  for (let page = 1; page <= totalPages; page++) {
    images.push(getChapterPageImage(dayNumber, page, format))
  }
  return images
}
