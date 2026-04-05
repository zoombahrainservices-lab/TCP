import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Intelligent image mapping based on page title/content
function getImageForPage(pageTitle: string, pageContent: any, stepType: string): string | null {
  const titleLower = pageTitle?.toLowerCase() || '';
  const base = '/chapter/chapter 2';

  // Reading section - story progression images
  if (stepType === 'read') {
    if (titleLower.includes('nightmare') || titleLower.includes('everything changed')) {
      return `${base}/Nightmare.webp`;
    }
    if (titleLower.includes('how it started') || titleLower.includes('started')) {
      return `${base}/How it started.webp`;
    }
    if (titleLower.includes('truth') || titleLower.includes('what people say')) {
      return `${base}/the truth.webp`;
    }
    if (titleLower.includes('what actually') || titleLower.includes('actually happened')) {
      return `${base}/what actually happend.webp`;
    }
    if (titleLower.includes('research') || titleLower.includes('study')) {
      return `${base}/the research.webp`;
    }
    if (titleLower.includes('comeback') || titleLower.includes('back')) {
      return `${base}/the comeback.webp`;
    }
    if (titleLower.includes('your move') || titleLower.includes('move')) {
      return `${base}/your move.webp`;
    }
    if (titleLower.includes('real talks') || titleLower.includes('conversation')) {
      return `${base}/real talks.webp`;
    }
  }

  // Self-check section
  if (stepType === 'self_check') {
    return `${base}/Nightmare.webp`; // Use cover for self-check
  }

  // Framework section - VOICE framework
  if (stepType === 'framework') {
    // Main framework cover
    if (titleLower.includes('voice') || titleLower.includes('framework')) {
      return `${base}/voice.webp`;
    }
    // Individual letters
    if (titleLower.includes('validate') || titleLower === 'v') {
      return `${base}/v.webp`;
    }
    if (titleLower.includes('observe') || titleLower === 'o') {
      return `${base}/o.webp`;
    }
    if (titleLower.includes('identify') || titleLower === 'i') {
      return `${base}/i.webp`;
    }
    if (titleLower.includes('context') || titleLower === 'c') {
      return `${base}/c.webp`;
    }
    if (titleLower.includes('express') || titleLower === 'e') {
      return `${base}/e.webp`;
    }
  }

  // Techniques section
  if (stepType === 'techniques') {
    if (titleLower.includes('technique 1') || titleLower.includes('first technique')) {
      return `${base}/t1.webp`;
    }
    if (titleLower.includes('technique 2') || titleLower.includes('second technique')) {
      return `${base}/t2.webp`;
    }
    if (titleLower.includes('technique 3') || titleLower.includes('third technique')) {
      return `${base}/t3.webp`;
    }
  }

  return null;
}

async function fixChapter2Images() {
  console.log('🔍 Checking Chapter 2 pages...\n');

  // Get chapter 2
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('*')
    .eq('chapter_number', 2)
    .single();

  if (chapterError || !chapter) {
    console.error('❌ Error fetching chapter 2:', chapterError);
    return;
  }

  console.log(`✅ Found Chapter 2: ${chapter.title}`);
  console.log(`   Slug: ${chapter.slug}\n`);

  // Get all chapter_steps for chapter 2
  const { data: steps, error: stepsError } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapter.id)
    .order('order_index');

  if (stepsError || !steps || steps.length === 0) {
    console.error('❌ Error fetching steps:', stepsError);
    return;
  }

  console.log(`📚 Found ${steps.length} steps\n`);

  let totalUpdated = 0;
  let totalChecked = 0;

  for (const step of steps) {
    console.log(`\n📖 Step: ${step.title} (${step.step_type})`);

    // Get pages for this step
    const { data: pages, error: pagesError } = await supabase
      .from('step_pages')
      .select('*')
      .eq('step_id', step.id)
      .order('order_index');

    if (pagesError) {
      console.error('   ❌ Error fetching pages:', pagesError);
      continue;
    }

    if (!pages || pages.length === 0) {
      console.log('   No pages found');
      continue;
    }

    console.log(`   Found ${pages.length} pages`);

    for (const page of pages) {
      totalChecked++;
      const currentImage = page.hero_image_url;
      const suggestedImage = getImageForPage(page.title, page.content, step.step_type);

      console.log(`\n   Page ${page.order_index + 1}: "${page.title}"`);
      console.log(`      Current: ${currentImage || '(none)'}`);
      console.log(`      Suggested: ${suggestedImage || '(none)'}`);

      if (suggestedImage && currentImage !== suggestedImage) {
        console.log(`      ✏️  Updating...`);
        
        const { error: updateError } = await supabase
          .from('step_pages')
          .update({ hero_image_url: suggestedImage })
          .eq('id', page.id);

        if (updateError) {
          console.error(`      ❌ Error updating:`, updateError);
        } else {
          console.log(`      ✅ Updated!`);
          totalUpdated++;
        }
      } else if (suggestedImage) {
        console.log(`      ✓ Already correct`);
      } else {
        console.log(`      ⚠️  No matching image found - title: "${page.title}"`);
      }
    }
  }

  console.log(`\n\n🎉 Summary:`);
  console.log(`   Checked: ${totalChecked} pages`);
  console.log(`   Updated: ${totalUpdated} pages`);
}

// Run the script
fixChapter2Images()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
