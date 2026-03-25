/**
 * Tests for gamification actions
 * 
 * Critical for XP/streak functionality and dashboard data.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Gamification Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getChapterReportsData', () => {
    it('should merge progress and XP data correctly', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockProgress = [
        {
          chapter_id: 1,
          reading_complete: true,
          assessment_complete: true,
          framework_complete: false,
          techniques_complete: false,
          proof_complete: false,
          follow_through_complete: false,
        },
      ]

      const mockXpLogs = [
        { amount: 50, chapter_id: 1 },
        { amount: 30, chapter_id: 1 },
      ]

      let callCount = 0
      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn((table: string) => {
          callCount++
          if (table === 'chapter_progress') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: mockProgress,
                    error: null,
                  }),
                }),
              }),
            }
          } else if (table === 'xp_logs') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  not: vi.fn().mockResolvedValue({
                    data: mockXpLogs,
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {} as any
        }),
      } as any)

      const { getChapterReportsData } = await import('@/app/actions/gamification')

      const result = await getChapterReportsData('user-123')

      expect(result).toEqual([
        {
          chapter_id: 1,
          title: 'Chapter 1',
          completed: '2/6',
          completedCount: 2,
          totalSections: 6,
          xp: 80,
        },
      ])
    })

    it('should handle missing XP logs', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockProgress = [
        {
          chapter_id: 1,
          reading_complete: true,
          assessment_complete: false,
          framework_complete: false,
          techniques_complete: false,
          proof_complete: false,
          follow_through_complete: false,
        },
      ]

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn((table: string) => {
          if (table === 'chapter_progress') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: mockProgress,
                    error: null,
                  }),
                }),
              }),
            }
          } else if (table === 'xp_logs') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  not: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {} as any
        }),
      } as any)

      vi.resetModules()
      const { getChapterReportsData } = await import('@/app/actions/gamification')

      const result = await getChapterReportsData('user-123')

      expect(result[0].xp).toBe(0)
      expect(result[0].completedCount).toBe(1)
    })
  })
})
