import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

function makeCountQueryResponse(count: number) {
  return { data: null, error: null, count } as any
}

function makeServerClientStub(opts: {
  phaseSingle: any
  chapterPhaseCount: number
  chapterCompletedCount: number
  zoneChapters: Array<{ id: number }>
  zonePhaseCount: number
  zoneCompletedCount: number
}) {
  const from = (table: string) => {
    if (table === 'phases') {
      return {
        select: (_sel: any, selOpts?: any) => {
          // count queries use head:true
          if (selOpts?.head) {
            return {
              eq: (_c: string, _v: any) => ({
                then: (resolve: any) => Promise.resolve(makeCountQueryResponse(opts.chapterPhaseCount)).then(resolve),
              }),
              in: (_c: string, _v: any[]) => ({
                then: (resolve: any) => Promise.resolve(makeCountQueryResponse(opts.zonePhaseCount)).then(resolve),
              }),
            }
          }

          // single phase lookup
          return {
            eq: (_c: string, _v: any) => ({
              single: async () => ({ data: opts.phaseSingle, error: null }),
            }),
          }
        },
      }
    }

    if (table === 'student_progress') {
      return {
        select: (_sel: any, selOpts?: any) => {
          if (selOpts?.head) {
            let mode: 'chapter' | 'zone' = 'chapter'
            const chain: any = {
              eq: (c: string, _v: any) => {
                if (c === 'chapter_id') mode = 'chapter'
                if (c === 'zone_id') mode = 'zone'
                return chain
              },
              not: () => ({
                then: (resolve: any) =>
                  Promise.resolve(
                    makeCountQueryResponse(mode === 'chapter' ? opts.chapterCompletedCount : opts.zoneCompletedCount)
                  ).then(resolve),
              }),
            }
            return chain
          }
          throw new Error('Unexpected student_progress query')
        },
      }
    }

    if (table === 'chapters') {
      return {
        select: (_sel: any) => ({
          eq: (_c: string, _v: any) => ({
            then: (resolve: any) => Promise.resolve({ data: opts.zoneChapters, error: null }).then(resolve),
          }),
        }),
      }
    }

    throw new Error(`Unexpected table: ${table}`)
  }

  return { from }
}

function makeAdminClientStub(opts: {
  upsertInsertedFlags: boolean[]
  sumXpAmounts: number[]
  existingLevel: number
  updatedProfile: { xp: number; level: number; total_xp_earned: number }
}) {
  const upsertFlags = [...opts.upsertInsertedFlags]

  const from = (table: string) => {
    if (table === 'xp_events') {
      return {
        upsert: () => ({
          select: () => {
            const inserted = upsertFlags.shift() ?? false
            return Promise.resolve({ data: inserted ? [{ id: 1 }] : [], error: null })
          },
        }),
        select: () => ({
          eq: () => Promise.resolve({ data: opts.sumXpAmounts.map(xp_amount => ({ xp_amount })), error: null }),
        }),
      }
    }

    if (table === 'profiles') {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { level: opts.existingLevel }, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: opts.updatedProfile, error: null }),
            }),
          }),
        }),
      }
    }

    if (table === 'notifications') {
      return {
        insert: async () => ({ data: null, error: null }),
      }
    }

    throw new Error(`Unexpected admin table: ${table}`)
  }

  return { from }
}

// Mock Supabase clients used by awardXpForPhaseCompletion
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { awardXpForPhaseCompletion } from '@/app/actions/xp'
import { XP_CONFIG } from '@/config/xp'

describe('XP v2 awarding (ledger-based)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.XP_SYSTEM_VERSION = 'v2'
  })

  it('Completing 1 phase awards +P (and not mission/zone)', async () => {
    ;(createClient as any).mockResolvedValue(
      makeServerClientStub({
        phaseSingle: { id: 10, chapter_id: 1, chapter: { id: 1, zone_id: 1 } },
        chapterPhaseCount: 5,
        chapterCompletedCount: 1,
        zoneChapters: [{ id: 1 }],
        zonePhaseCount: 5,
        zoneCompletedCount: 1,
      })
    )

    ;(createAdminClient as any).mockReturnValue(
      makeAdminClientStub({
        upsertInsertedFlags: [true, false, false],
        sumXpAmounts: [XP_CONFIG.XP_PER_PHASE],
        existingLevel: 1,
        updatedProfile: { xp: XP_CONFIG.XP_PER_PHASE, level: 1, total_xp_earned: XP_CONFIG.XP_PER_PHASE },
      })
    )

    const result = await awardXpForPhaseCompletion({ studentId: 'u1', phaseId: 10 })
    expect(result.xpAwarded.phase).toBe(XP_CONFIG.XP_PER_PHASE)
    expect(result.xpAwarded.mission).toBe(0)
    expect(result.xpAwarded.zone).toBe(0)
  })

  it('Completing last phase in a mission awards +P +M once', async () => {
    ;(createClient as any).mockResolvedValue(
      makeServerClientStub({
        phaseSingle: { id: 10, chapter_id: 1, chapter: { id: 1, zone_id: 1 } },
        chapterPhaseCount: 5,
        chapterCompletedCount: 5,
        zoneChapters: [{ id: 1 }],
        zonePhaseCount: 5,
        zoneCompletedCount: 5,
      })
    )

    ;(createAdminClient as any).mockReturnValue(
      makeAdminClientStub({
        upsertInsertedFlags: [true, true, true],
        sumXpAmounts: [XP_CONFIG.XP_PER_PHASE, XP_CONFIG.XP_PER_MISSION, XP_CONFIG.XP_PER_ZONE],
        existingLevel: 1,
        updatedProfile: {
          xp: XP_CONFIG.XP_PER_PHASE + XP_CONFIG.XP_PER_MISSION + XP_CONFIG.XP_PER_ZONE,
          level: 1,
          total_xp_earned: XP_CONFIG.XP_PER_PHASE + XP_CONFIG.XP_PER_MISSION + XP_CONFIG.XP_PER_ZONE,
        },
      })
    )

    const result = await awardXpForPhaseCompletion({ studentId: 'u1', phaseId: 10 })
    expect(result.xpAwarded.total).toBe(
      XP_CONFIG.XP_PER_PHASE + XP_CONFIG.XP_PER_MISSION + XP_CONFIG.XP_PER_ZONE
    )
  })

  it('Repeating same completion is idempotent (no extra XP)', async () => {
    ;(createClient as any).mockResolvedValue(
      makeServerClientStub({
        phaseSingle: { id: 10, chapter_id: 1, chapter: { id: 1, zone_id: 1 } },
        chapterPhaseCount: 5,
        chapterCompletedCount: 1,
        zoneChapters: [{ id: 1 }],
        zonePhaseCount: 5,
        zoneCompletedCount: 1,
      })
    )

    ;(createAdminClient as any).mockReturnValue(
      makeAdminClientStub({
        upsertInsertedFlags: [false, false, false],
        sumXpAmounts: [XP_CONFIG.XP_PER_PHASE],
        existingLevel: 1,
        updatedProfile: { xp: XP_CONFIG.XP_PER_PHASE, level: 1, total_xp_earned: XP_CONFIG.XP_PER_PHASE },
      })
    )

    const result = await awardXpForPhaseCompletion({ studentId: 'u1', phaseId: 10 })
    expect(result.xpAwarded.total).toBe(0)
  })
})

