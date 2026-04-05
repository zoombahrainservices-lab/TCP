/**
 * Global client-side prefetch deduplication cache.
 * Ensures URLs/images are only prefetched once across all component instances.
 */

const prefetched = new Set<string>()

/**
 * Try to execute a prefetch operation.
 * If the key was already prefetched, skips the operation.
 * 
 * @param key - Unique identifier (URL or image src)
 * @param fn - Function to execute if not already prefetched
 */
export function tryPrefetch(key: string, fn: () => void): void {
  if (prefetched.has(key)) return
  prefetched.add(key)
  fn()
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
