/**
 * Fast continue navigation hook using React 18 useTransition.
 * 
 * Wraps navigation actions in useTransition to keep the UI responsive
 * during route transitions. This makes "Continue" buttons feel instant
 * even when the next page hasn't fully loaded yet.
 * 
 * Benefits:
 * - UI responds immediately to clicks (no perceived lag)
 * - Loading states are deferred (keeps current page interactive)
 * - Progress saving happens in background
 * - Works seamlessly with React Server Components
 * 
 * Usage:
 * const { navigateWithTransition, isPending } = useFastNavigation()
 * 
 * <button onClick={() => navigateWithTransition('/next-page')} disabled={isPending}>
 *   Continue
 * </button>
 */

'use client'

import { useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface FastNavigationOptions {
  /** Called before navigation starts (e.g., to save progress) */
  onBeforeNavigate?: () => Promise<void> | void
  /** Called after navigation completes */
  onAfterNavigate?: () => Promise<void> | void
  /** Called if navigation fails */
  onError?: (error: unknown) => void
}

interface FastNavigationResult {
  /** Navigate to a route with useTransition (instant UI response) */
  navigateWithTransition: (href: string, options?: FastNavigationOptions) => void
  /** Whether a navigation is currently pending */
  isPending: boolean
  /** Navigate and replace current route */
  replaceWithTransition: (href: string, options?: FastNavigationOptions) => void
}

/**
 * Hook for fast, instant-feeling navigation with useTransition.
 * 
 * Keeps the UI responsive during navigation by deferring
 * loading states and rendering updates.
 */
export function useFastNavigation(): FastNavigationResult {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigateWithTransition = useCallback(
    (href: string, options?: FastNavigationOptions) => {
      startTransition(async () => {
        try {
          // Run pre-navigation logic (e.g., save progress)
          if (options?.onBeforeNavigate) {
            await options.onBeforeNavigate()
          }

          // Navigate (this happens in a transition, keeping UI responsive)
          router.push(href)

          // Post-navigation logic
          if (options?.onAfterNavigate) {
            await options.onAfterNavigate()
          }
        } catch (error) {
          if (options?.onError) {
            options.onError(error)
          } else {
            console.error('[FastNavigation] Navigation failed:', error)
          }
        }
      })
    },
    [router]
  )

  const replaceWithTransition = useCallback(
    (href: string, options?: FastNavigationOptions) => {
      startTransition(async () => {
        try {
          if (options?.onBeforeNavigate) {
            await options.onBeforeNavigate()
          }

          router.replace(href)

          if (options?.onAfterNavigate) {
            await options.onAfterNavigate()
          }
        } catch (error) {
          if (options?.onError) {
            options.onError(error)
          } else {
            console.error('[FastNavigation] Replace failed:', error)
          }
        }
      })
    },
    [router]
  )

  return {
    navigateWithTransition,
    replaceWithTransition,
    isPending,
  }
}

/**
 * Simpler variant for just wrapping a navigation action in useTransition.
 * Use this when you just want instant UI response without callbacks.
 */
export function useInstantNavigate() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const instantPush = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href)
      })
    },
    [router]
  )

  const instantReplace = useCallback(
    (href: string) => {
      startTransition(() => {
        router.replace(href)
      })
    },
    [router]
  )

  return {
    instantPush,
    instantReplace,
    isPending,
  }
}
