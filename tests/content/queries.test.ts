/**
 * Tests for content queries
 * 
 * Critical for reading page loads and navigation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Content Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStepPages', () => {
    it('should return pages for a step', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockPages = [
        { id: 'page-1', step_id: 'step-1', title: 'Page 1', slug: 'page-1', order_index: 0 },
        { id: 'page-2', step_id: 'step-1', title: 'Page 2', slug: 'page-2', order_index: 1 },
      ]

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockPages,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const { getStepPages } = await import('@/lib/content/queries')

      const result = await getStepPages('step-1')

      expect(result).toEqual(mockPages)
    })

    it('should throw error on database error', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error'),
              }),
            }),
          }),
        }),
      } as any)

      vi.resetModules()
      const { getStepPages } = await import('@/lib/content/queries')

      await expect(getStepPages('step-1')).rejects.toThrow('Database error')
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getNextStepWithContent', () => {
    it('should return first step with pages', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockSteps = [
        { id: 'step-1', chapter_id: 'ch-1', step_type: 'reading', order_index: 1 },
        { id: 'step-2', chapter_id: 'ch-1', step_type: 'framework', order_index: 2 },
      ]

      const mockPages = [
        { id: 'page-1', step_id: 'step-1' },
      ]

      let callCount = 0
      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn((table: string) => {
          if (table === 'chapter_steps') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gt: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: mockSteps,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          } else if (table === 'step_pages') {
            callCount++
            // First step has pages
            if (callCount === 1) {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: mockPages,
                      error: null,
                    }),
                  }),
                }),
              }
            }
            // Second step has no pages
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
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
      const { getNextStepWithContent } = await import('@/lib/content/queries')

      const result = await getNextStepWithContent('ch-1', 0)

      expect(result).toEqual(mockSteps[0])
    })

    it('should return resolution step without checking pages', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockSteps = [
        { id: 'step-res', chapter_id: 'ch-1', step_type: 'resolution', order_index: 5 },
      ]

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gt: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockSteps,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      vi.resetModules()
      const { getNextStepWithContent } = await import('@/lib/content/queries')

      const result = await getNextStepWithContent('ch-1', 4)

      expect(result).toEqual(mockSteps[0])
    })
  })
})
