/**
 * Delete ALL Auth Users (Supabase)
 *
 * Uses the Supabase Admin API (service_role) to list and delete every user
 * in auth.users. Run this when you want a full reset before re-opening
 * registration.
 *
 * Usage (must run from tcp-platform directory):
 *   cd tcp-platform
 *   npx tsx scripts/delete-all-auth-users.ts
 *   # or: npm run db:delete-users
 *
 * CHANGE THESE KEYS IN PRODUCTION – do not commit real keys to git.
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as readline from 'readline'
import { config } from 'dotenv'

config({ path: path.join(__dirname, '..', '.env.local') })

// Fallback keys – used if .env.local is missing or empty. CHANGE IN PRODUCTION.
const FALLBACK = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://qwunorikhvsckdagkfao.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW5vcmlraHZzY2tkYWdrZmFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ1MjU2NiwiZXhwIjoyMDg0MDI4NTY2fQ.6loaqNOauzaIQaGQforUjHn0W7L_aTmamLv1tfxxXiY',
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const usingEnv = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
console.log(`Supabase: ${url} (${usingEnv ? 'from .env.local' : 'fallback keys'})\n`)

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ask(q: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(`${q} (yes/no): `, (a) => {
      rl.close()
      resolve(a.toLowerCase().trim() === 'yes')
    })
  })
}

async function main() {
  // Connectivity check: list users first
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    console.error('Cannot reach Supabase Auth:', listError.message)
    console.error('Check URL and SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
  }

  const users = listData?.users ?? []
  const totalCount = users.length

  console.log(`Found ${totalCount} user(s) in auth.users.`)
  if (totalCount > 0) {
    users.slice(0, 10).forEach((u) => console.log(`  - ${u.email ?? u.id}`))
    if (totalCount > 10) console.log(`  ... and ${totalCount - 10} more`)
    console.log('')
  } else {
    console.log('Nothing to delete. Auth is already empty (or wrong project).\n')
    return
  }

  const ok = await ask('Are you sure you want to delete every auth user?')
  if (!ok) {
    console.log('Cancelled.')
    return
  }

  let page = 1
  const perPage = 1000
  let deleted = 0
  const failed: { id: string; email?: string; err: string }[] = []

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('listUsers error:', error.message)
      process.exit(1)
    }
    const pageUsers = data.users
    if (!pageUsers?.length) break

    for (const u of pageUsers) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id)
      if (delErr) {
        failed.push({
          id: u.id,
          email: u.email ?? undefined,
          err: delErr.message,
        })
        console.log(`  ✗ ${u.email ?? u.id}: ${delErr.message}`)
      } else {
        deleted++
        console.log(`  ✓ ${u.email ?? u.id}`)
      }
    }

    if (pageUsers.length < perPage) break
    page++
  }

  console.log(`\nDeleted ${deleted} user(s).`)
  if (failed.length) {
    console.log(`Failed ${failed.length}:`)
    failed.forEach((f) => console.log(`  - ${f.email ?? f.id}: ${f.err}`))
    console.log('\nIf failures mention storage ownership, empty or fix storage first.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
