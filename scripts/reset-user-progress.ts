/**
 * Reset one user's progress completely (steps, chapters, assessments, XP, streaks, etc.).
 * Auth account and profile are kept; all progress data is deleted.
 *
 * Usage:
 *   RESET_USER_EMAIL=you@example.com npx tsx scripts/reset-user-progress.ts
 *   RESET_USER_ID=uuid-here        npx tsx scripts/reset-user-progress.ts
 *   npx tsx scripts/reset-user-progress.ts you@example.com
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

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('Error looking up user by email:', error.message);
    return null;
  }
  return data?.id ?? null;
}

async function resetUserProgress(userId: string): Promise<void> {
  const tables: Array<{ name: string; key: string }> = [
    { name: 'step_completions', key: 'user_id' },
    { name: 'chapter_progress', key: 'user_id' },
    { name: 'chapter_sessions', key: 'user_id' },
    { name: 'assessments', key: 'user_id' },
    { name: 'artifacts', key: 'user_id' },
    { name: 'xp_logs', key: 'user_id' },
    { name: 'chapter_skill_scores', key: 'user_id' },
    { name: 'streak_history', key: 'user_id' },
    { name: 'user_badges', key: 'user_id' },
    { name: 'user_gamification', key: 'user_id' },
  ];

  for (const { name, key } of tables) {
    const { error } = await supabase
      .from(name)
      .delete()
      .eq(key, userId);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`   ⏭ ${name}: table not found, skip`);
      } else {
        console.error(`   ❌ ${name}:`, error.message);
      }
      continue;
    }
    console.log(`   ✓ ${name}: deleted`);
  }
}

async function main() {
  const emailArg = process.argv[2];
  const email = process.env.RESET_USER_EMAIL || emailArg;
  const userIdEnv = process.env.RESET_USER_ID;

  let userId: string | null = null;

  if (userIdEnv) {
    userId = userIdEnv.trim();
    console.log('Using RESET_USER_ID:', userId);
  } else if (email) {
    console.log('Looking up user by email:', email);
    userId = await getUserIdByEmail(email);
    if (!userId) {
      console.error('No profile found for that email. Check the address or use RESET_USER_ID=<uuid>');
      process.exit(1);
    }
    console.log('Found user id:', userId);
  } else {
    console.error('Provide user by email or id:');
    console.error('  RESET_USER_EMAIL=you@example.com npx tsx scripts/reset-user-progress.ts');
    console.error('  RESET_USER_ID=<uuid>             npx tsx scripts/reset-user-progress.ts');
    console.error('  npx tsx scripts/reset-user-progress.ts you@example.com');
    process.exit(1);
  }

  console.log('\n🗑 Resetting all progress for user:', userId);
  await resetUserProgress(userId);
  console.log('\n✅ User progress reset complete. Profile and auth account are unchanged.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
