'use client'

import { useCallback } from 'react'
import { playClickSound } from '@/lib/celebration/sounds'

/**
 * Hook that provides a click handler with sound effect
 * Usage:
 * 
 * const handleClick = useClickSound(() => {
 *   // Your button logic here
 * })
 * 
 * <button onClick={handleClick}>Click me</button>
 */
export function useClickSound<T extends (...args: any[]) => any>(
  callback?: T
): (...args: Parameters<T>) => ReturnType<T> {
  return useCallback(
    (...args: Parameters<T>) => {
      // Play click sound first
      playClickSound()
      
      // Then execute the callback if provided
      if (callback) {
        return callback(...args)
      }
    },
    [callback]
  ) as (...args: Parameters<T>) => ReturnType<T>
}

/**
 * Simple click sound player without callback
 * Usage: onClick={playClick}
 */
export function playClick() {
  playClickSound()
}
