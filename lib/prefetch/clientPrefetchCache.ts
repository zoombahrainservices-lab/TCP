/**
 * Global client-side prefetch deduplication cache.
 * Ensures URLs/images are only prefetched once across all component instances.
 * 
 * Enhanced with:
 * - Error recovery (allows retry on failure)
 * - Soft size limit (prevents unbounded growth)
 */

const prefetched = new Set<string>()

// Soft limit: clear cache when it grows too large
const MAX_CACHE_SIZE = 500

interface TryPrefetchOptions {
  /** Called if fn() throws; receives the error and can return true to allow retry */
  onError?: (error: unknown) => boolean
}

/**
 * Try to execute a prefetch operation.
 * If the key was already prefetched, skips the operation.
 * 
 * @param key - Unique identifier (URL or image src)
 * @param fn - Function to execute if not already prefetched
 * @param options - Optional error handling
 */
export function tryPrefetch(key: string, fn: () => void, options?: TryPrefetchOptions): void {
  // Check cache size and clear if too large (rare in practice)
  if (prefetched.size > MAX_CACHE_SIZE) {
    console.warn('[Prefetch Cache] Size limit reached, clearing cache')
    prefetched.clear()
  }

  if (prefetched.has(key)) return
  
  // Optimistically mark as prefetched before running
  prefetched.add(key)
  
  try {
    fn()
  } catch (error) {
    // Allow retry if error handler says so
    const shouldRetry = options?.onError?.(error) ?? false
    if (shouldRetry) {
      prefetched.delete(key)
    }
    
    // Don't throw - prefetch failures shouldn't break the app
    console.warn('[Prefetch] Failed for key:', key, error)
  }
}

/**
 * Check if a key has already been prefetched.
 * 
 * @param key - Unique identifier to check
 * @returns true if already prefetched
 */
export function hasPrefetched(key: string): boolean {
  return prefetched.has(key)
}

/**
 * Clear the prefetch cache (useful for testing or navigation resets).
 */
export function clearPrefetchCache(): void {
  prefetched.clear()
}
