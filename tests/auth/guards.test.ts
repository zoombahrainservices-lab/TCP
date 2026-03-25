/**
 * Tests for auth guards
 * 
 * Critical for protecting dashboard, reading, and map routes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client before importing guards
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

describe('Auth Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireAuth', () => {
    it('should redirect to login when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const { requireAuth } = await import('@/lib/auth/guards')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
        from: vi.fn(),
      } as any)

      await expect(requireAuth()).rejects.toThrow('REDIRECT:/auth/login')
    })

    it('should return user data when authenticated with profile', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockProfile = {
        full_name: 'Test User',
        role: 'student',
      }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      // Clear module cache to get fresh import with new mocks
      vi.resetModules()
      const { requireAuth } = await import('@/lib/auth/guards')

      const result = await requireAuth()

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'student',
      })
    })

    it('should redirect when role check fails', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockProfile = {
        full_name: 'Test User',
        role: 'student',
      }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      vi.resetModules()
      const { requireAuth } = await import('@/lib/auth/guards')

      // User is 'student' but we require 'admin'
      await expect(requireAuth('admin')).rejects.toThrow('REDIRECT:/dashboard')
    })
  })

  describe('getSession', () => {
    it('should return null when not authenticated without redirecting', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
        from: vi.fn(),
      } as any)

      vi.resetModules()
      const { getSession } = await import('@/lib/auth/guards')

      const result = await getSession()
      expect(result).toBeNull()
    })
  })
})
