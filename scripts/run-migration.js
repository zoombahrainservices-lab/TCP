/**
 * Run this script to create the site_settings table and insert defaults
 * Usage: node scripts/run-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running site_settings migration...\n');

  try {
    // Step 1: Create table
    console.log('1️⃣  Creating site_settings table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS site_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        key text UNIQUE NOT NULL,
        value jsonb NOT NULL,
        description text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    // Try alternative method if RPC doesn't exist
    if (tableError) {
      console.log('⚠️  RPC method failed, using direct query...');
      const { error: directError } = await supabase.from('site_settings').select('id').limit(1);
      
      if (directError && directError.message.includes('does not exist')) {
        console.error('❌ Cannot create table automatically. Please run migration manually in Supabase SQL Editor.');
        console.log('\n📋 Copy and run this SQL in Supabase dashboard:\n');
        console.log(readFileSync(join(__dirname, '..', 'RUN_THIS_MIGRATION.sql'), 'utf-8'));
        process.exit(1);
      }
    }

    console.log('✅ Table created/verified\n');

    // Step 2: Create index
    console.log('2️⃣  Creating index...');
    await supabase.rpc('exec_sql', { 
      sql: 'CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);' 
    });
    console.log('✅ Index created\n');

    // Step 3: Insert defaults
    console.log('3️⃣  Inserting default self-check configuration...');
    
    const defaultConfig = {
      intro: {
        title: 'Self-Check',
        subtitle: 'Take a quick snapshot of where you are in this chapter.',
        body1: 'This check is just for you. Answer based on how things feel right now, not how you wish they were.',
        body2: "It's not a test or a grade. It's a baseline for this chapter so you can see your progress as you move through the lessons.",
        highlightTitle: "You'll rate 5 statements from 1 to 7.",
        highlightBody: "Takes about a minute. Your score shows which zone you're in and what to focus on next.",
        styles: {
          titleColor: '#111827',
          titleSize: '5xl',
          subtitleColor: '#6b7280',
          bodyBgColor: '#ffffff',
          bodyTextColor: '#1f2937',
          highlightBgColor: '#fef3c7',
          highlightBorderColor: '#f59e0b',
          highlightTextColor: '#111827',
          buttonBgColor: '#f7b418',
          buttonHoverColor: '#e5a309',
          buttonTextColor: '#000000',
        },
      },
      result: {
        title: 'Self-Check Results',
        subtitle: 'This is your starting point for this chapter—not your ending point.',
        styles: {
          titleColor: '#111827',
          subtitleColor: '#6b7280',
          scoreBgColor: '#ffffff',
          scoreTextColor: '#111827',
          explanationBgColor: '#fef3c7',
          explanationTextColor: '#111827',
          buttonBgColor: '#ff6a38',
          buttonHoverColor: '#e55a28',
          buttonTextColor: '#ffffff',
        },
      },
    };

    const { data, error: insertError } = await supabase
      .from('site_settings')
      .upsert({
        key: 'self_check_defaults',
        value: defaultConfig,
        description: 'Default self-check intro and result page configuration (text and styles)',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
      throw insertError;
    }

    console.log('✅ Default configuration inserted\n');

    // Step 4: Verify
    console.log('4️⃣  Verifying installation...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'self_check_defaults')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      throw verifyError;
    }

    console.log('✅ Verification successful!\n');
    console.log('📊 Installed configuration:');
    console.log(JSON.stringify(verifyData.value, null, 2));

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📍 Next steps:');
    console.log('  1. Visit /admin/self-check-defaults to customize');
    console.log('  2. Visit any chapter self-check page to see it in action');
    console.log('  3. Edit chapter-specific overrides in page editor');

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.log('\n📋 Manual instructions:');
    console.log('  1. Open Supabase dashboard');
    console.log('  2. Go to SQL Editor');
    console.log('  3. Copy contents of RUN_THIS_MIGRATION.sql');
    console.log('  4. Paste and run');
    process.exit(1);
  }
}

runMigration();
