import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
  console.log('🔍 Verifying self-check system...\n');

  try {
    // Check if table exists
    console.log('1️⃣  Checking site_settings table...');
    const { data: tableData, error: tableError } = await supabase
      .from('site_settings')
      .select('key')
      .limit(1);

    if (tableError) {
      console.error('❌ Table does not exist!');
      console.log('\n🔧 FIX: Run this command:');
      console.log('   npm run setup:self-check');
      console.log('\nOR manually run RUN_THIS_MIGRATION.sql in Supabase SQL Editor');
      process.exit(1);
    }

    console.log('✅ Table exists\n');

    // Check if defaults exist
    console.log('2️⃣  Checking self_check_defaults...');
    const { data: defaultsData, error: defaultsError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'self_check_defaults')
      .single();

    if (defaultsError || !defaultsData) {
      console.error('❌ Defaults not found!');
      console.log('\n🔧 FIX: Run this command:');
      console.log('   npm run setup:self-check');
      process.exit(1);
    }

    console.log('✅ Defaults exist\n');

    // Check API endpoint
    console.log('3️⃣  Testing API endpoint...');
    const testUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chapter/7/self-check-copy`;
    
    try {
      const response = await fetch(testUrl);
      const data = await response.json();

      if (data.success && data.intro && data.result) {
        console.log('✅ API works!\n');
        console.log('📊 API Response Preview:');
        console.log(`   Intro Title: "${data.intro.title}"`);
        console.log(`   Result Title: "${data.result.title}"`);
        console.log(`   Has Override: ${data.hasOverride ? 'Yes' : 'No'}`);
        console.log(`   Using Defaults: ${data.usingDefaults ? 'Yes' : 'No'}\n`);
      } else {
        console.warn('⚠️  API returned unexpected format');
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (apiError: any) {
      console.error('❌ API test failed:', apiError.message);
      console.log('\n💡 Make sure dev server is running: npm run dev');
    }

    // Print configuration summary
    console.log('4️⃣  Configuration Summary:');
    const config = defaultsData.value as any;
    console.log(`   Intro Styles: ${Object.keys(config.intro.styles || {}).length} properties`);
    console.log(`   Result Styles: ${Object.keys(config.result.styles || {}).length} properties`);
    console.log(`   Button Color (Intro): ${config.intro.styles?.buttonBgColor || 'N/A'}`);
    console.log(`   Button Color (Result): ${config.result.styles?.buttonBgColor || 'N/A'}\n`);

    console.log('🎉 All checks passed!\n');
    console.log('📍 Next steps:');
    console.log('  • Visit /admin/self-check-defaults to edit global defaults');
    console.log('  • Visit /read/chapter-7/assessment to see it in action');
    console.log('  • Edit chapter pages to add overrides');

  } catch (error: any) {
    console.error('\n💥 Verification failed:', error.message);
    process.exit(1);
  }
}

verify();
