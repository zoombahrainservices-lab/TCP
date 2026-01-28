import { createAdminClient } from '@/lib/supabase/admin'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

type Discrepancy = {
  studentId: string
  profileXp: number
  eventsXp: number
  delta: number
}

async function compareXpSystems() {
  const supabase = createAdminClient()

  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id, xp, total_xp_earned')
    .eq('role', 'student')

  if (studentsError) {
    throw new Error(`Failed to fetch students: ${studentsError.message}`)
  }

  const discrepancies: Discrepancy[] = []

  for (const s of students ?? []) {
    const studentId = s.id as string
    const profileXp = (s.xp as number | null) ?? 0

    const { data: events, error: eventsError } = await supabase
      .from('xp_events')
      .select('xp_amount')
      .eq('user_id', studentId)

    if (eventsError) {
      throw new Error(`Failed to fetch xp_events for ${studentId}: ${eventsError.message}`)
    }

    const eventsXp = (events ?? []).reduce((acc: number, r: any) => acc + (r.xp_amount ?? 0), 0)
    const delta = profileXp - eventsXp

    if (delta !== 0) {
      discrepancies.push({ studentId, profileXp, eventsXp, delta })
    }
  }

  // Report
  console.log('═══════════════════════════════════════════')
  console.log('XP SYSTEM COMPARISON REPORT')
  console.log('═══════════════════════════════════════════')
  console.log(`Students checked: ${students?.length ?? 0}`)
  console.log(`Discrepancies: ${discrepancies.length}`)

  if (discrepancies.length > 0) {
    console.log('\nTop discrepancies (by absolute delta):')
    discrepancies
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 25)
      .forEach(d => {
        console.log(
          `- ${d.studentId}: profiles.xp=${d.profileXp}, events=${d.eventsXp}, delta=${d.delta}`
        )
      })
  }

  process.exit(discrepancies.length > 0 ? 2 : 0)
}

compareXpSystems().catch(err => {
  console.error('❌ compare_xp_systems failed:', err?.message ?? err)
  process.exit(1)
})

