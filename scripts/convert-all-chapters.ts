import { convertPdfToImages } from './convert-pdf-to-images'
import { generateChapterPdfBytes } from '../lib/pdf/chapter'
import { createAdminClient } from '../lib/supabase/admin'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as fs from 'fs/promises'

interface ChapterMetadata {
  dayNumber: number
  totalPages: number
  title: string
}

/**
 * Converts all chapters (Day 1-30) from PDFs to images
 * For Day 1: Uses existing static PDF
 * For Days 2-30: Generates PDF from database content first
 */
async function convertAllChapters() {
  const adminClient = createAdminClient()
  const chaptersDir = join(process.cwd(), 'public', 'chapters')
  
  // Ensure chapters directory exists
  if (!existsSync(chaptersDir)) {
    mkdirSync(chaptersDir, { recursive: true })
  }

  const metadata: ChapterMetadata[] = []

  // Process Day 1 (static PDF)
  console.log('\n=== Processing Day 1 (Foundation) ===')
  const day1PdfPath = join(process.cwd(), 'public', 'tcp-foundation-chapter1.pdf')
  const day1OutputDir = join(chaptersDir, 'chapter01')

  if (existsSync(day1PdfPath)) {
    try {
      const result = await convertPdfToImages({
        pdfPath: day1PdfPath,
        outputDir: day1OutputDir,
        imageFormat: 'png',
        width: 1200,
      })

      // Get chapter title from database
      const { data: chapter } = await adminClient
        .from('chapters')
        .select('title')
        .eq('day_number', 1)
        .single()

      metadata.push({
        dayNumber: 1,
        totalPages: result.totalPages,
        title: chapter?.title || 'From Stage Star to Silent Struggles',
      })

      // Save metadata
      const metaPath = join(day1OutputDir, 'meta.json')
      writeFileSync(
        metaPath,
        JSON.stringify({ totalPages: result.totalPages, title: chapter?.title }, null, 2)
      )

      console.log(`✓ Day 1: ${result.totalPages} pages converted`)
    } catch (error: any) {
      console.error(`✗ Day 1 failed:`, error.message)
    }
  } else {
    console.warn(`⚠ Day 1 PDF not found at ${day1PdfPath}`)
  }

  // Process Days 2-30 (generate PDFs from database)
  console.log('\n=== Processing Days 2-30 ===')
  
  for (let dayNumber = 2; dayNumber <= 30; dayNumber++) {
    console.log(`\n--- Processing Day ${dayNumber} ---`)
    
    try {
      // Fetch chapter from database
      const { data: chapter, error: chapterError } = await adminClient
        .from('chapters')
        .select('*')
        .eq('day_number', dayNumber)
        .single()

      if (chapterError || !chapter) {
        console.warn(`⚠ Day ${dayNumber}: Chapter not found in database, skipping`)
        continue
      }

      // Generate PDF from chapter content
      const pdfBytes = await generateChapterPdfBytes({
        day_number: chapter.day_number,
        title: chapter.title,
        subtitle: chapter.subtitle || undefined,
        content: chapter.content,
        task_description: chapter.task_description,
      })

      // Save PDF temporarily
      const tempPdfDir = join(process.cwd(), 'temp-pdfs')
      if (!existsSync(tempPdfDir)) {
        mkdirSync(tempPdfDir, { recursive: true })
      }
      const tempPdfPath = join(tempPdfDir, `chapter${String(dayNumber).padStart(2, '0')}.pdf`)
      await fs.writeFile(tempPdfPath, pdfBytes)

      // Convert PDF to images
      const outputDir = join(chaptersDir, `chapter${String(dayNumber).padStart(2, '0')}`)
      const result = await convertPdfToImages({
        pdfPath: tempPdfPath,
        outputDir,
        imageFormat: 'png',
        width: 1200,
      })

      // Save metadata
      const metaPath = join(outputDir, 'meta.json')
      writeFileSync(
        metaPath,
        JSON.stringify({ totalPages: result.totalPages, title: chapter.title }, null, 2)
      )

      metadata.push({
        dayNumber,
        totalPages: result.totalPages,
        title: chapter.title,
      })

      // Clean up temp PDF
      await fs.unlink(tempPdfPath)

      console.log(`✓ Day ${dayNumber}: ${result.totalPages} pages converted`)
    } catch (error: any) {
      console.error(`✗ Day ${dayNumber} failed:`, error.message)
    }
  }

  // Save master metadata
  const masterMetaPath = join(chaptersDir, 'chapters-metadata.json')
  writeFileSync(masterMetaPath, JSON.stringify(metadata, null, 2))

  console.log('\n=== Conversion Complete ===')
  console.log(`Total chapters processed: ${metadata.length}`)
  console.log(`Metadata saved to: ${masterMetaPath}`)
  console.log('\nChapters converted:')
  metadata.forEach((m) => {
    console.log(`  Day ${m.dayNumber}: ${m.totalPages} pages - ${m.title}`)
  })
}

// Run if executed directly
async function main() {
  try {
    await convertAllChapters()
  } catch (error: any) {
    console.error('Fatal error:', error.message)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  main()
}
