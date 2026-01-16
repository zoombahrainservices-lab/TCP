import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface DailyResultData {
  dayNumber: number
  chapterTitle: string
  chapterSubtitle?: string
  beforeQuestions: Array<{ id: number; question: string }>
  afterQuestions: Array<{ id: number; question: string }>
  beforeAnswers: Array<{ questionId: number; question: string; answer: number }>
  afterAnswers: Array<{ questionId: number; question: string; answer: number }>
  reflection: string
  completed: boolean
  completedAt?: string
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
 * Calculates average score from answers
 */
function calculateAverage(answers: Array<{ answer: number }>): number {
  if (answers.length === 0) return 0
  const sum = answers.reduce((acc, a) => acc + a.answer, 0)
  return sum / answers.length
}

/**
 * Generates a PDF from daily result data
 */
export async function generateDailyResultPdfBytes(data: DailyResultData): Promise<Uint8Array> {
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
  page.drawText(`Day ${data.dayNumber} Results`, {
    x: margin,
    y,
    size: 24,
    font: titleFont,
    color: rgb(0, 0, 0),
  })
  y -= 30
  
  // Chapter title
  page.drawText(data.chapterTitle, {
    x: margin,
    y,
    size: 16,
    font: titleFont,
    color: rgb(0.2, 0.2, 0.2),
  })
  y -= 25
  
  // Subtitle if exists
  if (data.chapterSubtitle) {
    page.drawText(data.chapterSubtitle, {
      x: margin,
      y,
      size: 12,
      font: subtitleFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    y -= 25
  }
  
  // Completion status
  if (data.completed && data.completedAt) {
    const date = new Date(data.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    page.drawText(`Completed: ${date}`, {
      x: margin,
      y,
      size: 10,
      font: bodyFont,
      color: rgb(0.3, 0.7, 0.3),
    })
    y -= 30
  }
  
  // Before Self-Check Section
  y -= 10
  checkNewPage(60)
  
  page.drawText('Before Self-Check', {
    x: margin,
    y,
    size: 14,
    font: titleFont,
    color: rgb(0, 0, 0),
  })
  y -= 20
  
  const beforeAvg = calculateAverage(data.beforeAnswers)
  page.drawText(`Average Score: ${beforeAvg.toFixed(1)} / 5`, {
    x: margin,
    y,
    size: 11,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.2),
  })
  y -= 25
  
  for (const answer of data.beforeAnswers) {
    checkNewPage(40)
    
    const questionLines = wrapText(answer.question, maxWidth - 20, bodyFont, 10)
    for (const line of questionLines) {
      checkNewPage(15)
      page.drawText(line, {
        x: margin + 10,
        y,
        size: 10,
        font: bodyFont,
        color: rgb(0, 0, 0),
      })
      y -= 14
    }
    
    page.drawText(`Score: ${answer.answer} / 5`, {
      x: margin + 10,
      y,
      size: 10,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.7),
    })
    y -= 20
  }
  
  // After Self-Check Section
  y -= 10
  checkNewPage(60)
  
  page.drawText('After Self-Check', {
    x: margin,
    y,
    size: 14,
    font: titleFont,
    color: rgb(0, 0, 0),
  })
  y -= 20
  
  const afterAvg = calculateAverage(data.afterAnswers)
  page.drawText(`Average Score: ${afterAvg.toFixed(1)} / 5`, {
    x: margin,
    y,
    size: 11,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.2),
  })
  y -= 25
  
  for (const answer of data.afterAnswers) {
    checkNewPage(40)
    
    const questionLines = wrapText(answer.question, maxWidth - 20, bodyFont, 10)
    for (const line of questionLines) {
      checkNewPage(15)
      page.drawText(line, {
        x: margin + 10,
        y,
        size: 10,
        font: bodyFont,
        color: rgb(0, 0, 0),
      })
      y -= 14
    }
    
    page.drawText(`Score: ${answer.answer} / 5`, {
      x: margin + 10,
      y,
      size: 10,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.7),
    })
    y -= 20
  }
  
  // Score Improvement
  if (data.beforeAnswers.length > 0 && data.afterAnswers.length > 0) {
    y -= 10
    checkNewPage(40)
    
    const improvement = afterAvg - beforeAvg
    const improvementText = improvement >= 0 
      ? `+${improvement.toFixed(1)}` 
      : improvement.toFixed(1)
    
    page.drawText('Score Improvement', {
      x: margin,
      y,
      size: 14,
      font: titleFont,
      color: rgb(0, 0, 0),
    })
    y -= 20
    
    page.drawText(`${improvementText} points`, {
      x: margin,
      y,
      size: 12,
      font: bodyFont,
      color: improvement >= 0 ? rgb(0.2, 0.7, 0.2) : rgb(0.7, 0.2, 0.2),
    })
    y -= 30
  }
  
  // Reflection Section
  if (data.reflection) {
    y -= 10
    checkNewPage(60)
    
    page.drawText('Reflection', {
      x: margin,
      y,
      size: 14,
      font: titleFont,
      color: rgb(0, 0, 0),
    })
    y -= 25
    
    const reflectionLines = wrapText(data.reflection, maxWidth, bodyFont, 11)
    
    for (const line of reflectionLines) {
      checkNewPage(18)
      
      page.drawText(line, {
        x: margin,
        y,
        size: 11,
        font: bodyFont,
        color: rgb(0, 0, 0),
      })
      y -= 16
    }
  }
  
  // Footer on last page
  y -= 30
  checkNewPage(40)
  
  page.drawText('TCP Communication Program - Daily Results', {
    x: margin,
    y: margin - 20,
    size: 10,
    font: bodyFont,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  return await pdfDoc.save()
}
