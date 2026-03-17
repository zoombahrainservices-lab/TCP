import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runMigration() {
  console.log('🚀 Running migration...\n');

  // The SQL statements we need to run
  const sqlStatements = [
    // Create table
    `CREATE TABLE IF NOT EXISTS site_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      key text UNIQUE NOT NULL,
      value jsonb NOT NULL,
      description text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );`,
    
    // Create index
    `CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);`,
    
    // Enable RLS
    `ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;`,
    
    // Create policies
    `CREATE POLICY IF NOT EXISTS "Public read access to site_settings"
      ON site_settings FOR SELECT USING (true);`,
    
    `CREATE POLICY IF NOT EXISTS "Admin write access to site_settings"
      ON site_settings FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.user_id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );`
  ];

  try {
    // Execute each SQL statement using REST API
    for (let i = 0; i < sqlStatements.length; i++) {
      console.log(`${i + 1}/${sqlStatements.length} Executing SQL statement...`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sqlStatements[i] })
      });

      if (!response.ok && i === 0) {
        // First statement failed, try direct insert method
        console.log('⚠️  RPC method not available, using direct insert...');
        break;
      }
    }

    // Now insert the default data using the client
    console.log('\n📝 Inserting default configuration...');
    
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

    const { data, error } = await supabase
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

    if (error) {
      console.error('❌ Error:', error.message);
      console.log('\n⚠️  The table may not exist. You need to run the SQL manually.');
      console.log('\n📋 Run this in Supabase SQL Editor:');
      console.log('\nSee URGENT_FIX_CHANGES_NOT_SAVING.md for complete SQL\n');
      process.exit(1);
    }

    console.log('✅ Configuration inserted!\n');

    // Verify
    console.log('🔍 Verifying...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'self_check_defaults')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      process.exit(1);
    }

    console.log('✅ Verification successful!\n');
    console.log('🎉 Migration completed!\n');
    console.log('📍 Next steps:');
    console.log('  1. Restart your dev server');
    console.log('  2. Hard refresh browser (Ctrl+Shift+R)');
    console.log('  3. Visit /read/chapter-7/assessment');
    console.log('  4. Your changes should now be visible!\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n⚠️  Manual migration required.');
    console.log('📄 See URGENT_FIX_CHANGES_NOT_SAVING.md for SQL to run\n');
    process.exit(1);
  }
}

runMigration();
