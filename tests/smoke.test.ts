/**
 * Smoke tests for critical server components
 * 
 * These tests verify that key components can be imported and
 * have the expected shape, catching major breaking changes.
 */

import { describe, it, expect } from 'vitest'

describe('Critical Component Smoke Tests', () => {
  it('should be able to import auth guards', async () => {
    const guards = await import('@/lib/auth/guards')
    
    expect(guards.requireAuth).toBeDefined()
    expect(guards.getSession).toBeDefined()
    expect(typeof guards.requireAuth).toBe('function')
    expect(typeof guards.getSession).toBe('function')
  })

  it('should be able to import content queries', async () => {
    const queries = await import('@/lib/content/queries')
    
    expect(queries.getStepPages).toBeDefined()
    expect(queries.getNextStepWithContent).toBeDefined()
    expect(queries.getAllChapters).toBeDefined()
    expect(typeof queries.getStepPages).toBe('function')
  })

  it('should be able to import cache server helpers', async () => {
    const cache = await import('@/lib/content/cache.server')
    
    expect(cache.getCachedChapterBundle).toBeDefined()
    expect(cache.getCachedAllChapters).toBeDefined()
    expect(typeof cache.getCachedChapterBundle).toBe('function')
  })

  it('should be able to import gamification actions', async () => {
    const gamification = await import('@/app/actions/gamification')
    
    expect(gamification.getChapterReportsData).toBeDefined()
    expect(gamification.getGamificationData).toBeDefined()
    expect(typeof gamification.getChapterReportsData).toBe('function')
  })
})

describe('WriteQueue Behavior', () => {
  it('should have expected queue interface', async () => {
    const { writeQueue } = await import('@/lib/queue/WriteQueue')
    
    expect(writeQueue).toBeDefined()
    expect(writeQueue.enqueue).toBeDefined()
    expect(writeQueue.clear).toBeDefined()
    expect(writeQueue.getQueueLength).toBeDefined()
    expect(typeof writeQueue.enqueue).toBe('function')
  })
})
