import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGE_DIRS = [
  'public/slider-work-on-quizz/chapter1',
  'public/chapter/chapter 2'
];

const MAX_WIDTH = 1920; // Max width for optimized images
const QUALITY = 85; // WebP quality (1-100)
const TARGET_SIZE_KB = 500; // Try to get under 500KB

interface OptimizationResult {
  originalPath: string;
  originalSize: number;
  newSize: number;
  savings: number;
  savingsPercent: number;
}

async function optimizeImage(imagePath: string): Promise<OptimizationResult | null> {
  try {
    const originalStats = fs.statSync(imagePath);
    const originalSizeKB = Math.round(originalStats.size / 1024);

    // Skip if already small enough
    if (originalSizeKB <= TARGET_SIZE_KB) {
      console.log(`✓ Skipping ${path.basename(imagePath)} (already optimized: ${originalSizeKB}KB)`);
      return null;
    }

    console.log(`\n🔄 Optimizing: ${path.basename(imagePath)} (${originalSizeKB}KB)`);

    // Create backup
    const backupPath = imagePath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(imagePath, backupPath);
      console.log(`   📦 Backup created: ${path.basename(backupPath)}`);
    }

    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    const shouldResize = metadata.width && metadata.width > MAX_WIDTH;

    // Optimize based on original format
    const ext = path.extname(imagePath).toLowerCase();
    let outputBuffer: Buffer;

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      // Convert to WebP for best compression
      const sharpInstance = sharp(imagePath);
      
      if (shouldResize) {
        sharpInstance.resize(MAX_WIDTH, undefined, {
          fit: 'inside',
          withoutEnlargement: true
        });
        console.log(`   📐 Resizing from ${metadata.width}px to ${MAX_WIDTH}px width`);
      }

      outputBuffer = await sharpInstance
        .webp({ quality: QUALITY })
        .toBuffer();

      // Change extension to .webp
      const newPath = imagePath.replace(/\.(png|jpe?g)$/i, '.webp');
      fs.writeFileSync(newPath, outputBuffer);

      // If we created a new .webp file, remove the old one
      if (newPath !== imagePath) {
        fs.unlinkSync(imagePath);
        console.log(`   🔄 Converted to WebP format`);
      }

      const newSizeKB = Math.round(outputBuffer.length / 1024);
      const savings = originalSizeKB - newSizeKB;
      const savingsPercent = Math.round((savings / originalSizeKB) * 100);

      console.log(`   ✅ Optimized: ${originalSizeKB}KB → ${newSizeKB}KB (saved ${savings}KB / ${savingsPercent}%)`);

      return {
        originalPath: imagePath,
        originalSize: originalSizeKB,
        newSize: newSizeKB,
        savings,
        savingsPercent
      };
    } else if (ext === '.webp') {
      // Already WebP, just re-compress with quality settings
      const sharpInstance = sharp(imagePath);
      
      if (shouldResize) {
        sharpInstance.resize(MAX_WIDTH, undefined, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      outputBuffer = await sharpInstance
        .webp({ quality: QUALITY })
        .toBuffer();

      fs.writeFileSync(imagePath, outputBuffer);

      const newSizeKB = Math.round(outputBuffer.length / 1024);
      const savings = originalSizeKB - newSizeKB;
      const savingsPercent = Math.round((savings / originalSizeKB) * 100);

      console.log(`   ✅ Re-compressed: ${originalSizeKB}KB → ${newSizeKB}KB (saved ${savings}KB / ${savingsPercent}%)`);

      return {
        originalPath: imagePath,
        originalSize: originalSizeKB,
        newSize: newSizeKB,
        savings,
        savingsPercent
      };
    }

    return null;
  } catch (error) {
    console.error(`   ❌ Error optimizing ${imagePath}:`, error);
    return null;
  }
}

async function optimizeDirectory(dir: string): Promise<OptimizationResult[]> {
  const fullPath = path.join(process.cwd(), dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Directory not found: ${dir}\n`);
    return [];
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📁 Processing: ${dir}`);
  console.log('='.repeat(60));

  const files = fs.readdirSync(fullPath, { recursive: true, withFileTypes: true });
  const images = files.filter(f => 
    f.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(f.name) && !f.name.includes('.backup')
  );

  const results: OptimizationResult[] = [];

  for (const img of images) {
    const imgDir = typeof img.path === 'string' ? img.path : (img as any).parentPath || fullPath;
    const fullImgPath = path.join(imgDir, img.name);
    
    if (!fs.existsSync(fullImgPath)) {
      continue;
    }

    const result = await optimizeImage(fullImgPath);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

async function main() {
  console.log('\n🎨 IMAGE OPTIMIZATION\n');
  console.log('This will:');
  console.log('  • Convert PNGs/JPEGs to WebP format');
  console.log('  • Resize images larger than 1920px width');
  console.log(`  • Compress to ${QUALITY}% quality`);
  console.log('  • Create .backup files for safety\n');

  const allResults: OptimizationResult[] = [];

  for (const dir of IMAGE_DIRS) {
    const results = await optimizeDirectory(dir);
    allResults.push(...results);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📈 OPTIMIZATION SUMMARY:\n');

  if (allResults.length === 0) {
    console.log('✅ No images needed optimization!\n');
    return;
  }

  const totalOriginalSize = allResults.reduce((sum, r) => sum + r.originalSize, 0);
  const totalNewSize = allResults.reduce((sum, r) => sum + r.newSize, 0);
  const totalSavings = totalOriginalSize - totalNewSize;
  const totalSavingsPercent = Math.round((totalSavings / totalOriginalSize) * 100);

  console.log(`   Images optimized: ${allResults.length}`);
  console.log(`   Original size: ${Math.round(totalOriginalSize / 1024)}MB`);
  console.log(`   New size: ${Math.round(totalNewSize / 1024)}MB`);
  console.log(`   Total savings: ${Math.round(totalSavings / 1024)}MB (${totalSavingsPercent}%)\n`);

  console.log(`\n💡 Note: Original files are backed up with .backup extension`);
  console.log(`   To restore: rename .backup files back to original extension\n`);
}

main().catch(console.error);
