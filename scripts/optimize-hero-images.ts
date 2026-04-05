/**
 * Image Optimization Script for TCP Hero Images
 * 
 * Problem: Source images are too large (420KB WebP avg, 3MB PNG avg)
 * Solution: Resize + compress source images before Vercel optimization
 * 
 * Target:
 * - Max width: 1200px (sufficient for hero images)
 * - WebP quality: 85 (good balance)
 * - Target size: 100-200KB per image
 * 
 * IMPORTANT: Run this script ONCE to optimize all hero images.
 * Keep originals as backup in case quality is not acceptable.
 * 
 * Usage:
 *   npm install sharp
 *   npx tsx scripts/optimize-hero-images.ts --dry-run  # Preview changes
 *   npx tsx scripts/optimize-hero-images.ts            # Actually optimize
 */

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const CHAPTER_DIR = path.join(PUBLIC_DIR, 'chapter')
const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200
const WEBP_QUALITY = 85
const DRY_RUN = process.argv.includes('--dry-run')

interface OptimizationResult {
  file: string
  originalSize: number
  newSize: number
  savings: number
  savingsPercent: number
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.promises.stat(filePath)
  return stats.size
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

async function optimizeImage(inputPath: string): Promise<OptimizationResult | null> {
  const ext = path.extname(inputPath).toLowerCase()
  
  // Only process WebP and PNG
  if (!['.webp', '.png'].includes(ext)) {
    return null
  }

  // Skip backup files
  if (inputPath.includes('.backup')) {
    return null
  }

  const originalSize = await getFileSize(inputPath)
  
  // If already small enough (< 200KB), skip
  if (originalSize < 200 * 1024) {
    console.log(`  ⏭️  Skipping ${path.basename(inputPath)} (already optimized)`)
    return null
  }

  console.log(`  🔄 Processing ${path.basename(inputPath)} (${formatBytes(originalSize)})...`)

  if (DRY_RUN) {
    // In dry-run mode, just show what would be done
    return {
      file: inputPath,
      originalSize,
      newSize: originalSize * 0.4, // Estimate ~60% savings
      savings: originalSize * 0.6,
      savingsPercent: 60,
    }
  }

  try {
    // Create backup
    const backupPath = inputPath + '.backup'
    if (!fs.existsSync(backupPath)) {
      await fs.promises.copyFile(inputPath, backupPath)
      console.log(`    💾 Backed up to ${path.basename(backupPath)}`)
    }

    // Create temp file for optimization
    const tempPath = inputPath + '.tmp'

    // Optimize with sharp
    await sharp(inputPath)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(tempPath)

    const newSize = await getFileSize(tempPath)
    const savings = originalSize - newSize
    const savingsPercent = (savings / originalSize) * 100

    // Replace original with optimized (Windows-safe method)
    try {
      // Delete original first, then rename temp
      await fs.promises.unlink(inputPath)
      await fs.promises.rename(tempPath, inputPath)
    } catch (renameError) {
      // If rename fails, try copy + delete
      try {
        await fs.promises.copyFile(tempPath, inputPath)
        await fs.promises.unlink(tempPath)
      } catch (copyError) {
        console.error(`    ❌ Failed to replace file:`, copyError)
        return null
      }
    }

    console.log(`    ✅ Optimized: ${formatBytes(originalSize)} → ${formatBytes(newSize)} (saved ${savingsPercent.toFixed(1)}%)`)

    return {
      file: inputPath,
      originalSize,
      newSize,
      savings,
      savingsPercent,
    }
  } catch (error) {
    console.error(`    ❌ Failed to optimize ${path.basename(inputPath)}:`, error)
    return null
  }
}

async function processDirectory(dir: string): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = []

  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        const subResults = await processDirectory(fullPath)
        results.push(...subResults)
      } else if (entry.isFile()) {
        const result = await optimizeImage(fullPath)
        if (result) {
          results.push(result)
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error)
  }

  return results
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🖼️  TCP Hero Image Optimization Script')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes will be made)' : '⚡ LIVE (images will be optimized)'}`)
  console.log(`Target: Max ${MAX_WIDTH}x${MAX_HEIGHT}px, WebP quality ${WEBP_QUALITY}`)
  console.log(`Directory: ${CHAPTER_DIR}`)
  console.log('')

  if (!fs.existsSync(CHAPTER_DIR)) {
    console.error('❌ Chapter directory not found:', CHAPTER_DIR)
    process.exit(1)
  }

  console.log('📁 Scanning for images to optimize...')
  console.log('')

  const results = await processDirectory(CHAPTER_DIR)

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 OPTIMIZATION SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  if (results.length === 0) {
    console.log('✨ No images needed optimization!')
    return
  }

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0)
  const totalNew = results.reduce((sum, r) => sum + r.newSize, 0)
  const totalSavings = totalOriginal - totalNew
  const avgSavingsPercent = (totalSavings / totalOriginal) * 100

  console.log(`Images processed: ${results.length}`)
  console.log(`Total original size: ${formatBytes(totalOriginal)}`)
  console.log(`Total new size: ${formatBytes(totalNew)}`)
  console.log(`Total savings: ${formatBytes(totalSavings)} (${avgSavingsPercent.toFixed(1)}%)`)
  console.log('')

  if (DRY_RUN) {
    console.log('🔍 This was a dry run. Run without --dry-run to actually optimize.')
  } else {
    console.log('✅ Optimization complete!')
    console.log('💾 Original images backed up with .backup extension')
    console.log('')
    console.log('Next steps:')
    console.log('1. Test the app locally to verify image quality')
    console.log('2. If quality is good, commit the changes')
    console.log('3. If quality is bad, restore from .backup files')
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
