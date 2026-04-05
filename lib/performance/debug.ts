/**
 * Performance debug utilities.
 * Centralized flag system for performance logging without polluting production.
 * 
 * Usage:
 *   Set DEBUG_PERFORMANCE=true in .env.local to enable all performance logs
 *   Or check specific flags in code
 */

// Global performance debug flag
export const DEBUG_PERFORMANCE = process.env.DEBUG_PERFORMANCE === 'true' || process.env.NODE_ENV === 'development'

// Specific debug flags (can be toggled independently)
export const DEBUG_FLAGS = {
  // Server-side logging
  cacheHits: DEBUG_PERFORMANCE,
  serverTiming: DEBUG_PERFORMANCE,
  queryCount: DEBUG_PERFORMANCE,
  authCalls: DEBUG_PERFORMANCE,
  
  // Client-side logging
  prefetch: DEBUG_PERFORMANCE,
  transitions: DEBUG_PERFORMANCE,
  imageLoading: DEBUG_PERFORMANCE,
  hydration: DEBUG_PERFORMANCE,
}

// Performance logging helpers
export const perfLog = {
  server: (...args: any[]) => {
    if (DEBUG_FLAGS.cacheHits && typeof console !== 'undefined') {
      console.log('[Perf Server]', ...args)
    }
  },
  
  client: (...args: any[]) => {
    if (DEBUG_PERFORMANCE && typeof window !== 'undefined') {
      console.log('[Perf Client]', ...args)
    }
  },
  
  cache: (...args: any[]) => {
    if (DEBUG_FLAGS.cacheHits) {
      console.log('[Cache]', ...args)
    }
  },
  
  timing: (label: string, startTime: number) => {
    if (DEBUG_FLAGS.serverTiming) {
      const duration = Date.now() - startTime
      console.log(`[Timing] ${label}: ${duration}ms`)
    }
  },
  
  prefetch: (...args: any[]) => {
    if (DEBUG_FLAGS.prefetch && typeof window !== 'undefined') {
      console.log('[Prefetch]', ...args)
    }
  },
  
  transition: (...args: any[]) => {
    if (DEBUG_FLAGS.transitions && typeof window !== 'undefined') {
      console.log('[Transition]', ...args)
    }
  },
}

// Performance measurement utilities
export function measureSync<T>(label: string, fn: () => T): T {
  if (!DEBUG_FLAGS.serverTiming) {
    return fn()
  }
  
  const start = Date.now()
  try {
    const result = fn()
    perfLog.timing(label, start)
    return result
  } catch (error) {
    perfLog.timing(`${label} (error)`, start)
    throw error
  }
}

export async function measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!DEBUG_FLAGS.serverTiming) {
    return fn()
  }
  
  const start = Date.now()
  try {
    const result = await fn()
    perfLog.timing(label, start)
    return result
  } catch (error) {
    perfLog.timing(`${label} (error)`, start)
    throw error
  }
}

// Client-side performance observer (for Web Vitals)
export function observeWebVitals() {
  if (typeof window === 'undefined' || !DEBUG_PERFORMANCE) return
  
  try {
    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      perfLog.client('LCP:', lastEntry.renderTime || lastEntry.loadTime, 'ms')
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    
    // FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as any
      perfLog.client('FCP:', entry.startTime, 'ms')
    })
    fcpObserver.observe({ type: 'paint', buffered: true })
    
    // INP (if supported)
    if ('PerformanceEventTiming' in window) {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        entries.forEach(entry => {
          if (entry.duration > 100) {
            perfLog.client('Slow interaction:', entry.name, entry.duration, 'ms')
          }
        })
      })
      inpObserver.observe({ type: 'event', buffered: true })
    }
  } catch (error) {
    console.warn('Performance observer setup failed:', error)
  }
}
