import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface Chapter {
  day_number: number
  title: string
  subtitle?: string
  content: string
  task_description: string
}

/**
 * Wraps text to fit within a specified width
 */
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const lines: string[] = []
  const paragraphs = text.split('\n')
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('')
      continue
    }
    
    const words = paragraph.split(' ')
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, fontSize)
      
      if (width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
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
  
  // Content (split into lines, handle pagination)
  const contentLines = wrapText(chapter.content, maxWidth, bodyFont, 12)
  
  for (const line of contentLines) {
    checkNewPage(20)
    
    page.drawText(line, {
      x: margin,
      y,
      size: 12,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
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
  
  const taskLines = wrapText(chapter.task_description, maxWidth, bodyFont, 12)
  
  for (const line of taskLines) {
    checkNewPage(20)
    
    page.drawText(line, {
      x: margin,
      y,
      size: 12,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
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
