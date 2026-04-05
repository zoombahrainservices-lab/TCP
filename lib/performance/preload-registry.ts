/**
 * Central preload registry for advanced deduplication and queue management.
 * 
 * This is the single source of truth for:
 * - What has been preloaded (images, routes, data)
 * - What is currently being preloaded (in-flight tracking)
 * - Staggered queue management for dashboard warmup
 * 
 * Architecture:
 * - Singleton registry accessible from any component
 * - Type-safe keys with prefixes (img:, route:, data:, page:)
 * - In-flight tracking to prevent duplicate simultaneous requests
 * - Queue management for staggered preloading
 */

type PreloadType = 'img' | 'route' | 'data' | 'page'
type PreloadKey = `${PreloadType}:${string}`
type PreloadStatus = 'pending' | 'in-flight' | 'complete' | 'error'

interface PreloadEntry {
  key: PreloadKey
  status: PreloadStatus
  timestamp: number
  priority: 'critical' | 'high' | 'normal' | 'low'
}

interface QueuedTask {
  key: PreloadKey
  fn: () => Promise<void> | void
  priority: 'critical' | 'high' | 'normal' | 'low'
}

class PreloadRegistry {
  private entries = new Map<PreloadKey, PreloadEntry>()
  private inFlight = new Set<PreloadKey>()
  private queue: QueuedTask[] = []
  private isProcessingQueue = false
  private maxConcurrent = 3
  private currentConcurrent = 0

  // Soft limits to prevent unbounded growth
  private readonly MAX_ENTRIES = 1000
  private readonly MAX_AGE_MS = 10 * 60 * 1000 // 10 minutes

  /**
   * Check if a key has been preloaded or is in-flight
   */
  has(key: PreloadKey): boolean {
    return this.entries.has(key) || this.inFlight.has(key)
  }

  /**
   * Check if a key is currently being preloaded
   */
  isInFlight(key: PreloadKey): boolean {
    return this.inFlight.has(key)
  }

  /**
   * Get the status of a preload
   */
  getStatus(key: PreloadKey): PreloadStatus | null {
    return this.entries.get(key)?.status ?? null
  }

  /**
   * Try to execute a preload operation.
   * If already preloaded or in-flight, skips.
   */
  async tryPreload(
    key: PreloadKey,
    fn: () => Promise<void> | void,
    options?: {
      priority?: 'critical' | 'high' | 'normal' | 'low'
      forceRefresh?: boolean
    }
  ): Promise<boolean> {
    const priority = options?.priority ?? 'normal'
    
    // Skip if already complete (unless force refresh)
    if (!options?.forceRefresh && this.entries.get(key)?.status === 'complete') {
      return false
    }

    // Skip if already in-flight
    if (this.inFlight.has(key)) {
      return false
    }

    // Clean up old entries periodically
    this.maybeCleanup()

    // Mark as in-flight
    this.inFlight.add(key)
    this.entries.set(key, {
      key,
      status: 'in-flight',
      timestamp: Date.now(),
      priority,
    })

    try {
      await fn()
      this.entries.set(key, {
        key,
        status: 'complete',
        timestamp: Date.now(),
        priority,
      })
      return true
    } catch (error) {
      this.entries.set(key, {
        key,
        status: 'error',
        timestamp: Date.now(),
        priority,
      })
      console.warn('[PreloadRegistry] Failed:', key, error)
      return false
    } finally {
      this.inFlight.delete(key)
    }
  }

  /**
   * Add a task to the staggered queue.
   * Tasks are processed with rate limiting to avoid overwhelming the network.
   */
  enqueue(
    key: PreloadKey,
    fn: () => Promise<void> | void,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): void {
    // Skip if already queued, in-flight, or complete
    if (this.has(key) || this.queue.some(t => t.key === key)) {
      return
    }

    this.queue.push({ key, fn, priority })
    
    // Sort by priority (critical > high > normal > low)
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 }
    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    // Start processing if not already running
    if (!this.isProcessingQueue) {
      this.processQueue()
    }
  }

  /**
   * Process the queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return
    this.isProcessingQueue = true

    while (this.queue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
      const task = this.queue.shift()
      if (!task) break

      this.currentConcurrent++
      
      // Process task without awaiting (parallel execution)
      this.tryPreload(task.key, task.fn, { priority: task.priority })
        .finally(() => {
          this.currentConcurrent--
          // Continue processing queue
          if (this.queue.length > 0) {
            this.processQueue()
          }
        })

      // Small delay between starting tasks (stagger initiation)
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    this.isProcessingQueue = false
  }

  /**
   * Clear all entries (useful for testing or navigation resets)
   */
  clear(): void {
    this.entries.clear()
    this.inFlight.clear()
    this.queue = []
  }

  /**
   * Clear entries older than MAX_AGE_MS when we exceed MAX_ENTRIES
   */
  private maybeCleanup(): void {
    if (this.entries.size < this.MAX_ENTRIES) return

    const now = Date.now()
    const toDelete: PreloadKey[] = []

    for (const [key, entry] of this.entries) {
      if (now - entry.timestamp > this.MAX_AGE_MS) {
        toDelete.push(key)
      }
    }

    // If age-based cleanup isn't enough, remove oldest entries
    if (this.entries.size - toDelete.length > this.MAX_ENTRIES) {
      const sorted = Array.from(this.entries.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      )
      const excess = this.entries.size - toDelete.length - this.MAX_ENTRIES
      toDelete.push(...sorted.slice(0, excess).map(e => e.key))
    }

    for (const key of toDelete) {
      this.entries.delete(key)
    }

    if (toDelete.length > 0) {
      console.log(`[PreloadRegistry] Cleaned up ${toDelete.length} old entries`)
    }
  }

  /**
   * Get debug stats (for development/testing)
   */
  getStats() {
    const byStatus: Record<PreloadStatus, number> = {
      pending: 0,
      'in-flight': 0,
      complete: 0,
      error: 0,
    }
    
    for (const entry of this.entries.values()) {
      byStatus[entry.status]++
    }

    return {
      total: this.entries.size,
      inFlight: this.inFlight.size,
      queued: this.queue.length,
      byStatus,
    }
  }
}

// Singleton instance
export const preloadRegistry = new PreloadRegistry()

// Convenience helpers with type-safe keys
export function makeImageKey(url: string): PreloadKey {
  return `img:${url}`
}

export function makeRouteKey(path: string): PreloadKey {
  return `route:${path}`
}

export function makeDataKey(identifier: string): PreloadKey {
  return `data:${identifier}`
}

export function makePageKey(chapterSlug: string, sectionSlug: string, pageIndex: number): PreloadKey {
  return `page:${chapterSlug}/${sectionSlug}/${pageIndex}`
}
