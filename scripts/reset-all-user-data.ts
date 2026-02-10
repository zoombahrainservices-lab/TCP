/**
 * Reset ALL users' progress (steps, chapters, assessments, XP, streaks, etc.).
 * Auth and profiles are NOT touched. Content (chapters, steps, pages) is NOT touched.
 *
 * Usage:
 *   npx tsx scripts/reset-all-user-data.ts
 *   npm run reset-all-user-data
 *
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const TABLES = [
  'step_completions',
  'chapter_progress',
  'chapter_sessions',
  'assessments',
  'artifacts',
  'xp_logs',
  'chapter_skill_scores',
  'streak_history',
  'user_badges',
  'user_gamification',
];

async function resetAll() {
  console.log('\n🗑 Resetting ALL user data...\n');

  for (const table of TABLES) {
    const { error } = await supabase
      .from(table)
      .delete()
      .not('user_id', 'is', null);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`   ⏭ ${table}: table not found, skip`);
      } else {
        console.error(`   ❌ ${table}:`, error.message);
      }
      continue;
    }
    console.log(`   ✓ ${table}`);
  }

  console.log('\n✅ All user progress data cleared. Auth users and profiles unchanged.\n');
}

resetAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
