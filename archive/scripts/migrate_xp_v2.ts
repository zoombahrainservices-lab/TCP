import { createAdminClient } from '@/lib/supabase/admin'
import { XP_CONFIG } from '@/config/xp'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

type Args = {
  dryRun: boolean
  reset: boolean
  userId?: string
}

function parseArgs(argv: string[]): Args {
  const dryRun = argv.includes('--dry-run')
  const reset = argv.includes('--reset')
  const userIdx = argv.findIndex(a => a === '--user')
  const userId = userIdx >= 0 ? argv[userIdx + 1] : undefined
  return { dryRun, reset, userId }
}

type ProgressRow = {
  student_id: string
  zone_id: number
  chapter_id: number
  phase_id: number
}

async function migrateXpV2() {
  const args = parseArgs(process.argv.slice(2))
  const supabase = createAdminClient()

  console.log('═══════════════════════════════════════════')
  console.log('XP V2 MIGRATION (events backfill)')
  console.log('═══════════════════════════════════════════')
  console.log(`dryRun: ${args.dryRun}`)
  console.log(`reset: ${args.reset}`)
  if (args.userId) console.log(`user: ${args.userId}`)
  console.log('')

  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'student')
    .maybeSingle()

  // maybeSingle() isn't appropriate when there are many rows; fall back to select without it
  if (studentsError) {
    // ignore and retry below
  }

  const { data: studentRows, error: allStudentsError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'student')

  if (allStudentsError) {
    throw new Error(`Failed to fetch students: ${allStudentsError.message}`)
  }

  const studentIds = (studentRows ?? [])
    .map((r: any) => r.id as string)
    .filter(id => (args.userId ? id === args.userId : true))

  console.log(`Students to process: ${studentIds.length}`)

  let totalEventsInserted = 0
  let totalProfilesUpdated = 0

  for (const studentId of studentIds) {
    console.log(`\n— Processing ${studentId}`)

    if (args.reset) {
      if (args.dryRun) {
        console.log('  [dry-run] would delete existing xp_events for user')
      } else {
        const { error: delError } = await supabase.from('xp_events').delete().eq('user_id', studentId)
        if (delError) throw new Error(`Failed to reset xp_events for ${studentId}: ${delError.message}`)
        console.log('  deleted existing xp_events')
      }
    }

    const { data: progressRows, error: progressError } = await supabase
      .from('student_progress')
      .select('student_id, zone_id, chapter_id, phase_id')
      .eq('student_id', studentId)
      .not('completed_at', 'is', null)

    if (progressError) {
      throw new Error(`Failed to fetch student_progress for ${studentId}: ${progressError.message}`)
    }

    const completed = (progressRows ?? []) as ProgressRow[]

    // Phase events
    let insertedForStudent = 0
    if (completed.length > 0) {
      const phaseEvents = completed.map(r => ({
        user_id: studentId,
        event_type: 'PHASE_COMPLETE',
        ref_id: r.phase_id,
        xp_amount: XP_CONFIG.XP_PER_PHASE, // perfect bonuses can't be reconstructed reliably from historical responses
      }))

      if (args.dryRun) {
        console.log(`  [dry-run] would upsert ${phaseEvents.length} PHASE_COMPLETE events`)
      } else {
        const { data, error } = await supabase
          .from('xp_events')
          .upsert(phaseEvents, { onConflict: 'user_id,event_type,ref_id', ignoreDuplicates: true })
          .select('id')

        if (error) throw new Error(`Failed to upsert PHASE_COMPLETE events: ${error.message}`)
        insertedForStudent += Array.isArray(data) ? data.length : 0
      }
    }

    // Mission events (chapters with all phases completed)
    const chaptersCompletedCount: Map<number, number> = new Map()
    const zoneIdByChapter: Map<number, number> = new Map()
    for (const r of completed) {
      chaptersCompletedCount.set(r.chapter_id, (chaptersCompletedCount.get(r.chapter_id) ?? 0) + 1)
      zoneIdByChapter.set(r.chapter_id, r.zone_id)
    }

    const completedChapterIds = Array.from(chaptersCompletedCount.entries())
      .filter(([, count]) => count >= XP_CONFIG.PHASES_PER_MISSION)
      .map(([chapterId]) => chapterId)

    if (completedChapterIds.length > 0) {
      const missionEvents = completedChapterIds.map(chapterId => ({
        user_id: studentId,
        event_type: 'MISSION_COMPLETE',
        ref_id: chapterId,
        xp_amount: XP_CONFIG.XP_PER_MISSION,
      }))

      if (args.dryRun) {
        console.log(`  [dry-run] would upsert ${missionEvents.length} MISSION_COMPLETE events`)
      } else {
        const { data, error } = await supabase
          .from('xp_events')
          .upsert(missionEvents, { onConflict: 'user_id,event_type,ref_id', ignoreDuplicates: true })
          .select('id')
        if (error) throw new Error(`Failed to upsert MISSION_COMPLETE events: ${error.message}`)
        insertedForStudent += Array.isArray(data) ? data.length : 0
      }
    }

    // Zone events (all missions in zone completed)
    // Determine how many chapters exist per zone, then compare.
    const { data: chaptersInZones, error: chaptersInZonesError } = await supabase
      .from('chapters')
      .select('id, zone_id')

    if (chaptersInZonesError) {
      throw new Error(`Failed to fetch chapters: ${chaptersInZonesError.message}`)
    }

    const totalChaptersByZone: Map<number, number> = new Map()
    for (const c of chaptersInZones ?? []) {
      const zid = (c as any).zone_id as number | null
      if (!zid) continue
      totalChaptersByZone.set(zid, (totalChaptersByZone.get(zid) ?? 0) + 1)
    }

    const completedChaptersByZone: Map<number, number> = new Map()
    for (const chapterId of completedChapterIds) {
      const zid = zoneIdByChapter.get(chapterId)
      if (!zid) continue
      completedChaptersByZone.set(zid, (completedChaptersByZone.get(zid) ?? 0) + 1)
    }

    const completedZoneIds = Array.from(completedChaptersByZone.entries())
      .filter(([zoneId, completeChapters]) => (totalChaptersByZone.get(zoneId) ?? 0) > 0 && completeChapters >= (totalChaptersByZone.get(zoneId) ?? 0))
      .map(([zoneId]) => zoneId)

    if (completedZoneIds.length > 0) {
      const zoneEvents = completedZoneIds.map(zoneId => ({
        user_id: studentId,
        event_type: 'ZONE_COMPLETE',
        ref_id: zoneId,
        xp_amount: XP_CONFIG.XP_PER_ZONE,
      }))

      if (args.dryRun) {
        console.log(`  [dry-run] would upsert ${zoneEvents.length} ZONE_COMPLETE events`)
      } else {
        const { data, error } = await supabase
          .from('xp_events')
          .upsert(zoneEvents, { onConflict: 'user_id,event_type,ref_id', ignoreDuplicates: true })
          .select('id')
        if (error) throw new Error(`Failed to upsert ZONE_COMPLETE events: ${error.message}`)
        insertedForStudent += Array.isArray(data) ? data.length : 0
      }
    }

    // Recompute totals and update profile
    if (args.dryRun) {
      console.log('  [dry-run] would recompute SUM(xp_events) and update profiles.xp/total_xp_earned')
    } else {
      const { data: ev, error: evError } = await supabase
        .from('xp_events')
        .select('xp_amount')
        .eq('user_id', studentId)

      if (evError) throw new Error(`Failed to read xp_events for totals: ${evError.message}`)

      const total = (ev ?? []).reduce((acc: number, r: any) => acc + (r.xp_amount ?? 0), 0)

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ xp: total, total_xp_earned: total })
        .eq('id', studentId)

      if (profileUpdateError) {
        throw new Error(`Failed to update profile totals: ${profileUpdateError.message}`)
      }

      totalProfilesUpdated += 1
    }

    totalEventsInserted += insertedForStudent
    console.log(`  events inserted (this run): ${insertedForStudent}`)
  }

  console.log('\n═══════════════════════════════════════════')
  console.log('MIGRATION COMPLETE')
  console.log('═══════════════════════════════════════════')
  console.log(`Total events inserted: ${totalEventsInserted}`)
  console.log(`Profiles updated: ${totalProfilesUpdated}`)
  console.log('')
}

migrateXpV2().catch(err => {
  console.error('❌ migrate_xp_v2 failed:', err?.message ?? err)
  process.exit(1)
})

