'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY_PREFIX = 'tcp_chapter_progress_'

/**
 * Hook to track and persist chapter reading progress
 */
export function useChapterProgress(dayNumber: number) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved progress from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${dayNumber}`)
      if (saved) {
        const page = parseInt(saved, 10)
        if (!isNaN(page) && page > 0) {
          setCurrentPage(page)
        }
      }
    } catch (error) {
      console.error('Failed to load chapter progress:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dayNumber])

  // Save progress to localStorage
  const saveProgress = (page: number) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${dayNumber}`, page.toString())
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to save chapter progress:', error)
    }
  }

  // Clear progress for this chapter
  const clearProgress = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${dayNumber}`)
      setCurrentPage(1)
    } catch (error) {
      console.error('Failed to clear chapter progress:', error)
    }
  }

  return {
    currentPage,
    saveProgress,
    clearProgress,
    isLoading,
  }
}
