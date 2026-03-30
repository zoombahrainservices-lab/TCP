import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

const optimizationConfig = [
  // Dashboard backgrounds - generate multiple sizes for responsive loading
  {
    input: 'BG.png',
    outputs: [
      { width: 640, name: 'BG-mobile.webp', quality: 80 },
      { width: 828, name: 'BG-tablet.webp', quality: 80 },
      { width: 1200, name: 'BG-desktop.webp', quality: 75 },
      { width: 1920, name: 'BG-large.webp', quality: 75 },
    ]
  },
  {
    input: 'dbg.png',
    outputs: [
      { width: 640, name: 'dbg-mobile.webp', quality: 80 },
      { width: 828, name: 'dbg-tablet.webp', quality: 80 },
      { width: 1200, name: 'dbg-desktop.webp', quality: 75 },
      { width: 1920, name: 'dbg-large.webp', quality: 75 },
    ]
  },
  // Chapter card image
  {
    input: 'slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    outputs: [
      { width: 260, name: 'slider-work-on-quizz/chapter1/chaper1-1-sm.webp', quality: 85 },
      { width: 520, name: 'slider-work-on-quizz/chapter1/chaper1-1-md.webp', quality: 80 },
    ]
  }
];

async function optimizeImage(inputPath, outputPath, width, quality) {
  try {
    await sharp(inputPath)
      .resize(width, null, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality })
      .toFile(outputPath);
    
    const stats = await sharp(outputPath).metadata();
    const fileSize = (stats.size / 1024).toFixed(2);
    console.log(`✓ Created ${outputPath} (${width}w, ${fileSize} KB)`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');
  
  for (const config of optimizationConfig) {
    const inputPath = join(publicDir, config.input);
    
    if (!existsSync(inputPath)) {
      console.warn(`⚠️  Input file not found: ${inputPath}`);
      continue;
    }
    
    console.log(`Processing: ${config.input}`);
    
    for (const output of config.outputs) {
      const outputPath = join(publicDir, output.name);
      const outputDir = dirname(outputPath);
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      await optimizeImage(inputPath, outputPath, output.width, output.quality);
    }
    
    console.log('');
  }
  
  console.log('✨ Image optimization complete!');
}

main().catch(console.error);
