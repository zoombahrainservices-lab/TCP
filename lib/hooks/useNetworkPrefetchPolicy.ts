/**
 * Network-aware prefetch policy for production-safe preloading.
 * 
 * Adapts preload aggressiveness based on:
 * - navigator.connection.saveData
 * - navigator.connection.effectiveType
 * 
 * Returns a policy object controlling:
 * - How many pages ahead to preload (1, 2, or 3)
 * - Whether to prefetch next routes
 * - Whether to load secondary section images
 */

'use client'

import { useState, useEffect } from 'react'

export interface PrefetchPolicy {
  /** How many pages ahead to preload images (1, 2, or 3) */
  pageImageLookahead: 1 | 2 | 3
  /** Whether to prefetch next section routes */
  allowRoutePrefetch: boolean
  /** Whether to preload secondary images (e.g., second image in next section) */
  allowSecondSectionImage: boolean
  /** Whether to defer non-critical preloads to idle time */
  deferNonCritical: boolean
}

interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'
}

/**
 * Get prefetch policy from connection info.
 * Pure function for testability.
 */
export function getPrefetchPolicyFromConnection(conn?: NetworkInformationLike | null): PrefetchPolicy {
  // Conservative fallback (no connection API or disabled)
  if (!conn) {
    return {
      pageImageLookahead: 2,
      allowRoutePrefetch: true,
      allowSecondSectionImage: false,
      deferNonCritical: true,
    }
  }

  // Respect Save-Data preference (explicit user opt-in to reduce data)
  if (conn.saveData === true) {
    return {
      pageImageLookahead: 1,
      allowRoutePrefetch: true, // Keep route prefetch (lightweight)
      allowSecondSectionImage: false,
      deferNonCritical: true,
    }
  }

  // Slow connections: only immediate next
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
    return {
      pageImageLookahead: 1,
      allowRoutePrefetch: true,
      allowSecondSectionImage: false,
      deferNonCritical: true,
    }
  }

  // 3G: moderate lookahead
  if (conn.effectiveType === '3g') {
    return {
      pageImageLookahead: 2,
      allowRoutePrefetch: true,
      allowSecondSectionImage: false,
      deferNonCritical: true,
    }
  }

  // 4G or better: full lookahead
  return {
    pageImageLookahead: 3,
    allowRoutePrefetch: true,
    allowSecondSectionImage: true,
    deferNonCritical: false, // On fast networks, preload eagerly
  }
}

/**
 * Hook to get current network-aware prefetch policy.
 * Updates when connection changes.
 */
export function useNetworkPrefetchPolicy(): PrefetchPolicy {
  const [policy, setPolicy] = useState<PrefetchPolicy>(() => {
    // SSR safe: use conservative default during server render
    if (typeof window === 'undefined' || !('navigator' in window)) {
      return {
        pageImageLookahead: 2,
        allowRoutePrefetch: true,
        allowSecondSectionImage: false,
        deferNonCritical: true,
      }
    }

    // Client-side: read from navigator.connection
    const nav = window.navigator as Navigator & {
      connection?: NetworkInformationLike
      mozConnection?: NetworkInformationLike
      webkitConnection?: NetworkInformationLike
    }
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection
    return getPrefetchPolicyFromConnection(conn)
  })

  useEffect(() => {
    // Skip if not supported
    if (typeof window === 'undefined' || !('navigator' in window)) return

    const nav = window.navigator as Navigator & {
      connection?: NetworkInformationLike & { addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void }
      mozConnection?: NetworkInformationLike & { addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void }
      webkitConnection?: NetworkInformationLike & { addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void }
    }
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection
    
    if (!conn) return

    // Update policy when connection changes
    const handleChange = () => {
      setPolicy(getPrefetchPolicyFromConnection(conn))
    }

    // Listen for connection changes
    conn.addEventListener('change', handleChange)
    
    return () => {
      conn.removeEventListener('change', handleChange)
    }
  }, [])

  return policy
}
