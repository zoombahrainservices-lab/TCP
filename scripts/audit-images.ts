import fs from 'fs';
import path from 'path';

const IMAGE_DIRS = [
  'public/slider-work-on-quizz/chapter1',
  'public/chapter/chapter 2'
];

const MAX_SIZE_KB = 500; // Warn if image > 500KB

function getFileSizeInKB(filepath: string): number {
  const stats = fs.statSync(filepath);
  return Math.round(stats.size / 1024);
}

function auditDirectory(dir: string) {
  const fullPath = path.join(process.cwd(), dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Directory not found: ${dir}\n`);
    return;
  }

  const files = fs.readdirSync(fullPath, { recursive: true, withFileTypes: true });
  const images = files.filter(f => 
    f.isFile() && /\.(png|jpg|jpeg|webp|gif)$/i.test(f.name)
  );

  console.log(`\n📁 ${dir}`);
  console.log(`Found ${images.length} images\n`);

  let totalSize = 0;
  let largeImages = 0;
  const largeImagesList: Array<{name: string, size: number, path: string}> = [];

  for (const img of images) {
    // For Node 18+, dirent.path returns the directory path
    const imgDir = typeof img.path === 'string' ? img.path : img.parentPath || fullPath;
    const fullImgPath = path.join(imgDir, img.name);
    
    if (!fs.existsSync(fullImgPath)) {
      console.log(`⚠️  Skipping missing file: ${img.name}`);
      continue;
    }
    
    const sizeKB = getFileSizeInKB(fullImgPath);
    totalSize += sizeKB;

    if (sizeKB > MAX_SIZE_KB) {
      largeImages++;
      const relativePath = path.relative(process.cwd(), fullImgPath);
      largeImagesList.push({
        name: img.name,
        size: sizeKB,
        path: relativePath
      });
      console.log(`⚠️  ${img.name}: ${sizeKB}KB (over ${MAX_SIZE_KB}KB)`);
      console.log(`   Path: ${relativePath}`);
    }
  }

  console.log(`\n📊 Total: ${Math.round(totalSize / 1024)}MB across ${images.length} images`);
  console.log(`🚨 ${largeImages} images exceed ${MAX_SIZE_KB}KB\n`);
  
  if (largeImages > 0) {
    console.log(`\n💡 Recommendation: Optimize ${largeImages} images using the optimize-images script\n`);
  }
  
  return { totalImages: images.length, largeImages, totalSizeMB: Math.round(totalSize / 1024) };
}

console.log('🔍 IMAGE AUDIT REPORT\n');
console.log('='.repeat(60));

let grandTotalImages = 0;
let grandTotalLarge = 0;
let grandTotalSizeMB = 0;

for (const dir of IMAGE_DIRS) {
  const result = auditDirectory(dir);
  if (result) {
    grandTotalImages += result.totalImages;
    grandTotalLarge += result.largeImages;
    grandTotalSizeMB += result.totalSizeMB;
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📈 GRAND TOTAL:');
console.log(`   Total images: ${grandTotalImages}`);
console.log(`   Large images (>${MAX_SIZE_KB}KB): ${grandTotalLarge}`);
console.log(`   Total size: ${grandTotalSizeMB}MB`);
console.log(`   Average size: ${grandTotalImages > 0 ? Math.round((grandTotalSizeMB * 1024) / grandTotalImages) : 0}KB per image\n`);

if (grandTotalLarge > 0) {
  console.log(`\n🎯 ACTION: Run 'npx tsx scripts/optimize-images.ts' to optimize ${grandTotalLarge} large images\n`);
} else {
  console.log(`\n✅ All images are optimized! (under ${MAX_SIZE_KB}KB each)\n`);
}
