/**
 * Simplified PDF to image converter using pdf-lib to extract pages
 * and convert them to images without requiring canvas (Windows-friendly)
 */

import { PDFDocument } from 'pdf-lib'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as fs from 'fs/promises'

interface ConversionOptions {
  pdfPath: string
  outputDir: string
}

interface ConversionResult {
  totalPages: number
  outputMessage: string
}

/**
 * Simple converter that extracts PDF page info
 * Note: This creates a metadata file without actual images
 * For production, you would use a service like Cloudinary or imgproxy to convert PDFs
 */
export async function analyzePdf(
  options: ConversionOptions
): Promise<ConversionResult> {
  const { pdfPath, outputDir } = options

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // Check if PDF exists
  if (!existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`)
  }

  // Read PDF file
  const pdfBytes = await fs.readFile(pdfPath)
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const totalPages = pdfDoc.getPageCount()

  console.log(`PDF Analysis:`)
  console.log(`  Total pages: ${totalPages}`)
  console.log(`  Output directory: ${outputDir}`)

  // Create metadata file
  const metadata = {
    totalPages,
    title: 'From Stage Star to Silent Struggles',
    note: 'Images need to be manually created or use an online service',
  }

  const metaPath = join(outputDir, 'meta.json')
  writeFileSync(metaPath, JSON.stringify(metadata, null, 2))

  console.log(`\nMetadata saved to: ${metaPath}`)
  console.log(`\n⚠️  IMPORTANT: You need to manually create the page images.`)
  console.log(`\nOptions to create images:`)
  console.log(`  1. Use an online PDF to PNG converter (e.g., ilovepdf.com, pdf2png.com)`)
  console.log(`  2. Use Adobe Acrobat: File > Export To > Image > PNG`)
  console.log(`  3. Use a Mac/Linux machine with ImageMagick or Poppler`)
  console.log(`  4. Use an online service API (Cloudinary, imgproxy, etc.)`)
  console.log(`\nSave images as: page01.png, page02.png, etc. in ${outputDir}`)

  return {
    totalPages,
    outputMessage: `Metadata created. ${totalPages} page images needed.`,
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: tsx analyze-pdf.ts <pdfPath> <outputDir>')
    console.error(
      'Example: tsx analyze-pdf.ts ./public/tcp-foundation-chapter1.pdf ./public/chapters/chapter01'
    )
    process.exit(1)
  }

  const [pdfPath, outputDir] = args

  try {
    const result = await analyzePdf({
      pdfPath,
      outputDir,
    })

    console.log(`\n✓ ${result.outputMessage}`)
  } catch (error: any) {
    console.error('Analysis failed:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  main()
}
