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

async function addHeroImageColumn() {
  console.log('🔧 Adding hero_image_url column to step_pages table...\n');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE step_pages
      ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
      
      COMMENT ON COLUMN step_pages.hero_image_url IS 'Optional hero/cover image URL for this specific page';
    `
  });

  if (error) {
    console.error('❌ Error adding column:', error);
    // Try alternative approach
    console.log('\n🔄 Trying direct SQL execution...\n');
    
    const { error: error2 } = await supabase.from('step_pages').select('hero_image_url').limit(1);
    
    if (error2 && error2.message.includes('does not exist')) {
      console.error('❌ Column does not exist and cannot be added via RPC');
      console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
      console.log('---');
      console.log('ALTER TABLE step_pages');
      console.log('ADD COLUMN IF NOT EXISTS hero_image_url TEXT;');
      console.log('---');
      process.exit(1);
    }
  } else {
    console.log('✅ Column added successfully!');
  }
}

addHeroImageColumn()
  .then(() => {
    console.log('\n✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
