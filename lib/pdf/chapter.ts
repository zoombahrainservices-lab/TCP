import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface ChapterChunk {
  id: number
  title?: string
  body: string[]
  imageUrl?: string | null
}

interface Chapter {
  day_number: number
  title: string
  subtitle?: string
  content: string
  task_description: string
  chunks?: ChapterChunk[]
}

/**
 * Sanitizes text for PDF - removes problematic characters
 */
function sanitizeText(text: string): string {
  if (!text) return ''
  // Remove or replace problematic characters that pdf-lib can't handle
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/[\u0000-\u001F]/g, '') // Remove control characters except newlines
    .trim()
}

/**
 * Wraps text to fit within a specified width
 */
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  if (!text) return []
  
  const lines: string[] = []
  const paragraphs = text.split('\n')
  
  for (const paragraph of paragraphs) {
    const sanitized = sanitizeText(paragraph)
    if (!sanitized) {
      lines.push('')
      continue
    }
    
    const words = sanitized.split(' ')
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      
      try {
        const width = font.widthOfTextAtSize(testLine, fontSize)
        
        if (width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      } catch (error) {
        // If there's an error measuring text, try to sanitize the word
        const sanitizedWord = sanitizeText(word)
        if (sanitizedWord) {
          const testLineSanitized = currentLine ? `${currentLine} ${sanitizedWord}` : sanitizedWord
          try {
            const width = font.widthOfTextAtSize(testLineSanitized, fontSize)
            if (width > maxWidth && currentLine) {
              lines.push(currentLine)
              currentLine = sanitizedWord
            } else {
              currentLine = testLineSanitized
            }
          } catch (e) {
            // Skip problematic words
            continue
          }
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
  }
  
  return lines
}

/**
 * Generates a PDF from chapter content
 */
export async function generateChapterPdfBytes(chapter: Chapter): Promise<Uint8Array> {
  // Validate chapter data
  if (!chapter) {
    throw new Error('Chapter data is required')
  }
  
  if (!chapter.title) {
    throw new Error('Chapter title is required')
  }
  
  // Content can be empty if chunks exist
  const hasContent = chapter.content || (chapter.chunks && Array.isArray(chapter.chunks) && chapter.chunks.length > 0)
  if (!hasContent) {
    throw new Error('Chapter must have either content or chunks')
  }
  
  const pdfDoc = await PDFDocument.create()
  
  // Embed fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const subtitleFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
  
  let page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()
  const margin = 50
  const maxWidth = width - 2 * margin
  let y = height - margin
  
  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (y < margin + requiredSpace) {
      page = pdfDoc.addPage([595, 842])
      y = height - margin
      return true
    }
    return false
  }
  
  // Title
  page.drawText(`Day ${chapter.day_number}: ${chapter.title}`, {
    x: margin,
    y,
    size: 24,
    font: titleFont,
    color: rgb(0, 0, 0),
  })
  y -= 40
  
  // Subtitle
  if (chapter.subtitle) {
    checkNewPage(30)
    page.drawText(chapter.subtitle, {
      x: margin,
      y,
      size: 14,
      font: subtitleFont,
      color: rgb(0.3, 0.3, 0.3),
    })
    y -= 35
  }
  
  // Content section
  checkNewPage(40)
  page.drawText('Chapter Content', {
    x: margin,
    y,
    size: 16,
    font: titleFont,
    color: rgb(0, 0, 0),
  })
  y -= 25
  
  // Build content from chunks if available, otherwise use content field
  let contentText = chapter.content || ''
  
  // If chunks exist, convert them to text content
  if (chapter.chunks && Array.isArray(chapter.chunks) && chapter.chunks.length > 0) {
    const chunksText: string[] = []
    chapter.chunks.forEach((chunk: ChapterChunk) => {
      if (chunk.title) {
        chunksText.push(`\n## ${chunk.title}\n`)
      }
      if (chunk.body && Array.isArray(chunk.body)) {
        chunk.body.forEach((paragraph: string) => {
          chunksText.push(paragraph)
          chunksText.push('') // Empty line between paragraphs
        })
      }
    })
    contentText = chunksText.join('\n')
  }
  
  // Content (split into lines, handle pagination)
  const contentLines = wrapText(contentText, maxWidth, bodyFont, 12)
  
  for (const line of contentLines) {
    checkNewPage(20)
    
    try {
      const sanitizedLine = sanitizeText(line)
      if (sanitizedLine) {
        page.drawText(sanitizedLine, {
          x: margin,
          y,
          size: 12,
          font: bodyFont,
          color: rgb(0, 0, 0),
        })
      }
    } catch (error) {
      console.error('Error drawing text line:', error, 'Line:', line)
      // Skip problematic lines
    }
    y -= 18
  }
  
  // Task description section
  y -= 20
  checkNewPage(40)
  
  page.drawText('Your Task:', {
    x: margin,
    y,
    size: 16,
    font: titleFont,
    color: rgb(0, 0, 0),
  })
  y -= 25
  
  const taskText = chapter.task_description || ''
  const taskLines = wrapText(taskText, maxWidth, bodyFont, 12)
  
  for (const line of taskLines) {
    checkNewPage(20)
    
    try {
      const sanitizedLine = sanitizeText(line)
      if (sanitizedLine) {
        page.drawText(sanitizedLine, {
          x: margin,
          y,
          size: 12,
          font: bodyFont,
          color: rgb(0, 0, 0),
        })
      }
    } catch (error) {
      console.error('Error drawing task line:', error, 'Line:', line)
      // Skip problematic lines
    }
    y -= 18
  }
  
  // Footer on last page
  y -= 30
  checkNewPage(40)
  
  page.drawText('TCP Communication Program', {
    x: margin,
    y: margin - 20,
    size: 10,
    font: bodyFont,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  return await pdfDoc.save()
}
