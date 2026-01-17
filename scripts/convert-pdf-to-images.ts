import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as fs from 'fs/promises'

interface ConversionOptions {
  pdfPath: string
  outputDir: string
  imageFormat?: 'png' | 'webp'
  width?: number
  quality?: number
}

interface ConversionResult {
  totalPages: number
  outputFiles: string[]
  metadata: {
    format: string
    width: number
  }
}

/**
 * Converts a PDF file to images using pdf2pic (requires GraphicsMagick or ImageMagick)
 * Alternative: Uses a Node.js-based approach if external tools aren't available
 */
export async function convertPdfToImages(
  options: ConversionOptions
): Promise<ConversionResult> {
  const {
    pdfPath,
    outputDir,
    imageFormat = 'png',
    width = 1200,
    quality = 90,
  } = options

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // Check if PDF exists
  if (!existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`)
  }

  // Use pdfjs-dist for PDF parsing and canvas for rendering
  // Set worker source for pdfjs
  const pdfjsLib = await import('pdfjs-dist')
  
  // Read PDF file
  const pdfBytes = await fs.readFile(pdfPath)
  const loadingTask = pdfjsLib.getDocument({ 
    data: new Uint8Array(pdfBytes),
    useSystemFonts: true,
  })
  const pdf = await loadingTask.promise
  const totalPages = pdf.numPages

  const outputFiles: string[] = []
  const sharpModule = await import('sharp')
  const sharp = sharpModule.default || sharpModule
  const { createCanvas } = await import('canvas')

  // Convert each page to image
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    
    // Calculate scale to achieve desired width
    const pageView = page.view
    const pageWidth = pageView[2] - pageView[0]
    const scale = width / pageWidth
    const viewport = page.getViewport({ scale })

    // Create canvas
    const canvas = createCanvas(
      Math.round(viewport.width),
      Math.round(viewport.height)
    )
    const context = canvas.getContext('2d')

    // Render page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise

    // Convert canvas to buffer
    const imageBuffer = canvas.toBuffer('image/png')

    // Process with sharp for format conversion and optimization
    const fileName = `page${String(pageNum).padStart(2, '0')}.${imageFormat}`
    const outputPath = join(outputDir, fileName)

    let processedImage = sharp(imageBuffer)

    // Resize if needed (maintain aspect ratio)
    if (imageFormat === 'webp') {
      processedImage = processedImage.webp({ quality })
    } else {
      processedImage = processedImage.png({ quality: Math.round(quality * 0.9) })
    }

    await processedImage.toFile(outputPath)
    outputFiles.push(outputPath)

    console.log(`Converted page ${pageNum}/${totalPages} to ${fileName}`)
  }

  return {
    totalPages,
    outputFiles,
    metadata: {
      format: imageFormat,
      width,
    },
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('Usage: tsx convert-pdf-to-images.ts <pdfPath> <outputDir> [format] [width]')
    console.error('Example: tsx convert-pdf-to-images.ts ./public/tcp-foundation-chapter1.pdf ./public/chapters/chapter01 png 1200')
    process.exit(1)
  }

  const [pdfPath, outputDir, format = 'png', widthStr = '1200'] = args
  const width = parseInt(widthStr, 10)

  try {
    const result = await convertPdfToImages({
      pdfPath,
      outputDir,
      imageFormat: format as 'png' | 'webp',
      width,
    })
    
    console.log(`\nConversion complete!`)
    console.log(`Total pages: ${result.totalPages}`)
    console.log(`Output directory: ${outputDir}`)
    console.log(`Format: ${result.metadata.format}`)
    console.log(`Width: ${result.metadata.width}px`)
  } catch (error: any) {
    console.error('Conversion failed:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  main()
}
