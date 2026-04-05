/**
 * Enhanced network-aware preload budget hook.
 * 
 * Determines how aggressive preloading should be based on:
 * - Network connection quality (navigator.connection)
 * - Save-Data preference
 * - Device memory (navigator.deviceMemory)
 * - Battery status (navigator.getBattery)
 * 
 * Returns a budget object that other preload hooks use to throttle their behavior.
 */

'use client'

import { useState, useEffect } from 'react'

export interface PreloadBudget {
  /** How many pages ahead to preload in active section (1, 2, or 3) */
  pageImageLookahead: 1 | 2 | 3
  /** Whether to prefetch next section routes */
  allowRoutePrefetch: boolean
  /** Whether to preload secondary images (e.g., second image in next section) */
  allowSecondaryImages: boolean
  /** Whether to defer non-critical preloads to idle time */
  deferNonCritical: boolean
  /** Whether to enable dashboard chapter warmup */
  enableDashboardWarmup: boolean
  /** Max concurrent dashboard warmup tasks */
  dashboardWarmupConcurrency: number
  /** Profile name for debugging */
  profile: 'minimal' | 'conservative' | 'moderate' | 'aggressive'
}

interface NetworkInfo {
  saveData?: boolean
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'
  downlink?: number
  rtt?: number
}

interface DeviceInfo {
  memory?: number // GB
  battery?: {
    charging: boolean
    level: number
  }
}

/**
 * Get network information from navigator.connection
 */
function getNetworkInfo(): NetworkInfo | null {
  if (typeof window === 'undefined' || !('navigator' in window)) return null

  const nav = window.navigator as Navigator & {
    connection?: NetworkInfo & EventTarget
    mozConnection?: NetworkInfo & EventTarget
    webkitConnection?: NetworkInfo & EventTarget
  }

  return nav.connection || nav.mozConnection || nav.webkitConnection || null
}

/**
 * Get device information
 */
async function getDeviceInfo(): Promise<DeviceInfo> {
  const info: DeviceInfo = {}

  if (typeof window === 'undefined') return info

  // Device memory (Chrome only)
  const nav = window.navigator as Navigator & { deviceMemory?: number; getBattery?: () => Promise<{ charging: boolean; level: number }> }
  if ('deviceMemory' in nav && typeof nav.deviceMemory === 'number') {
    info.memory = nav.deviceMemory
  }

  // Battery status (experimental API)
  if ('getBattery' in nav && typeof nav.getBattery === 'function') {
    try {
      const battery = await nav.getBattery()
      info.battery = {
        charging: battery.charging,
        level: battery.level,
      }
    } catch {
      // Ignore battery API errors
    }
  }

  return info
}

/**
 * Calculate preload budget from network and device conditions
 */
function calculateBudget(network: NetworkInfo | null, device: DeviceInfo): PreloadBudget {
  // MINIMAL PROFILE: Save-Data enabled or very slow network
  if (network?.saveData === true || network?.effectiveType === 'slow-2g') {
    return {
      pageImageLookahead: 1,
      allowRoutePrefetch: true, // Routes are lightweight
      allowSecondaryImages: false,
      deferNonCritical: true,
      enableDashboardWarmup: false,
      dashboardWarmupConcurrency: 1,
      profile: 'minimal',
    }
  }

  // CONSERVATIVE PROFILE: 2G network or low memory or low battery
  if (
    network?.effectiveType === '2g' ||
    (device.memory !== undefined && device.memory < 4) ||
    (device.battery && !device.battery.charging && device.battery.level < 0.2)
  ) {
    return {
      pageImageLookahead: 1,
      allowRoutePrefetch: true,
      allowSecondaryImages: false,
      deferNonCritical: true,
      enableDashboardWarmup: false,
      dashboardWarmupConcurrency: 1,
      profile: 'conservative',
    }
  }

  // MODERATE PROFILE: 3G network or normal memory
  if (network?.effectiveType === '3g' || (device.memory !== undefined && device.memory < 8)) {
    return {
      pageImageLookahead: 2,
      allowRoutePrefetch: true,
      allowSecondaryImages: false,
      deferNonCritical: true,
      enableDashboardWarmup: true,
      dashboardWarmupConcurrency: 2,
      profile: 'moderate',
    }
  }

  // AGGRESSIVE PROFILE: 4G+ network and good memory
  return {
    pageImageLookahead: 3,
    allowRoutePrefetch: true,
    allowSecondaryImages: true,
    deferNonCritical: false,
    enableDashboardWarmup: true,
    dashboardWarmupConcurrency: 3,
    profile: 'aggressive',
  }
}

/**
 * Hook to get current preload budget based on network and device conditions.
 * Updates when conditions change.
 */
export function usePreloadBudget(): PreloadBudget {
  const [budget, setBudget] = useState<PreloadBudget>(() => {
    // SSR-safe default: moderate profile
    if (typeof window === 'undefined') {
      return {
        pageImageLookahead: 2,
        allowRoutePrefetch: true,
        allowSecondaryImages: false,
        deferNonCritical: true,
        enableDashboardWarmup: true,
        dashboardWarmupConcurrency: 2,
        profile: 'moderate',
      }
    }

    // Client-side: calculate from current conditions
    const network = getNetworkInfo()
    return calculateBudget(network, {})
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true

    // Get initial device info (async)
    getDeviceInfo().then(device => {
      if (!mounted) return
      const network = getNetworkInfo()
      setBudget(calculateBudget(network, device))
    })

    // Listen for network changes
    const network = getNetworkInfo()
    if (!network) return

    const handleNetworkChange = async () => {
      if (!mounted) return
      const device = await getDeviceInfo()
      const updatedNetwork = getNetworkInfo()
      setBudget(calculateBudget(updatedNetwork, device))
    }

    // Cast to EventTarget to access addEventListener
    const networkTarget = network as unknown as EventTarget
    networkTarget.addEventListener('change', handleNetworkChange)

    return () => {
      mounted = false
      networkTarget.removeEventListener('change', handleNetworkChange)
    }
  }, [])

  return budget
}

/**
 * Get a static budget (for use outside React components)
 */
export function getStaticPreloadBudget(): PreloadBudget {
  if (typeof window === 'undefined') {
    return {
      pageImageLookahead: 2,
      allowRoutePrefetch: true,
      allowSecondaryImages: false,
      deferNonCritical: true,
      enableDashboardWarmup: true,
      dashboardWarmupConcurrency: 2,
      profile: 'moderate',
    }
  }

  const network = getNetworkInfo()
  return calculateBudget(network, {})
}
