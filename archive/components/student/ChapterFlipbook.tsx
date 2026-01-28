'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getChapterPageImage, getChapterMetadataClient, preloadChapterPages } from '@/lib/chapters/image-loader'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import Button from '@/components/ui/Button'

interface ChapterFlipbookProps {
  dayNumber: number
  chapterTitle: string
  totalPages: number
  onComplete: () => void
  onBack: () => void
}

export default function ChapterFlipbook({
  dayNumber,
  chapterTitle,
  totalPages: initialTotalPages,
  onComplete,
  onBack,
}: ChapterFlipbookProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { currentPage: savedPage, saveProgress, isLoading: progressLoading } = useChapterProgress(dayNumber)

  // Load metadata and set total pages (use initial totalPages if provided)
  useEffect(() => {
    // If totalPages was provided and is valid, use it
    if (initialTotalPages > 0) {
      setTotalPages(initialTotalPages)
      setIsLoading(false)
      return
    }

    // Otherwise try to load from client-side metadata
    async function loadMetadata() {
      const metadata = await getChapterMetadataClient(dayNumber)
      if (metadata) {
        setTotalPages(metadata.totalPages)
      }
      setIsLoading(false)
    }
    loadMetadata()
  }, [dayNumber, initialTotalPages])

  // Restore saved page position
  useEffect(() => {
    if (!progressLoading && savedPage > 0 && savedPage <= totalPages) {
      setCurrentPage(savedPage)
    }
  }, [progressLoading, savedPage, totalPages])

  // Preload adjacent pages for smooth navigation
  useEffect(() => {
    if (currentPage > 0 && totalPages > 0) {
      const startPage = Math.max(1, currentPage - 1)
      const endPage = Math.min(totalPages, currentPage + 1)
      preloadChapterPages(dayNumber, startPage, endPage)
    }
  }, [currentPage, dayNumber, totalPages])

  // Save progress when page changes
  useEffect(() => {
    if (currentPage > 0 && !progressLoading) {
      saveProgress(currentPage)
    }
  }, [currentPage, saveProgress, progressLoading])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
        setImageError(false)
      } else if (e.key === 'ArrowRight') {
        if (currentPage < totalPages) {
          setCurrentPage(prev => prev + 1)
          setImageError(false)
        } else {
          onComplete()
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, isFullscreen, onComplete])

  // Touch/swipe support
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    handleSwipe()
  }

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next page
        handleNext()
      } else {
        // Swipe right - previous page
        handlePrevious()
      }
    }
  }

  const handlePrevious = useCallback(() => {
    if (currentPage > 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setImageError(false)
        setIsTransitioning(false)
      }, 150)
    }
  }, [currentPage, isTransitioning])

  const handleNext = useCallback(() => {
    if (currentPage < totalPages && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setImageError(false)
        setIsTransitioning(false)
      }, 150)
    } else if (currentPage >= totalPages && !isTransitioning) {
      // Last page - trigger completion
      onComplete()
    }
  }, [currentPage, totalPages, onComplete, isTransitioning])

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  if (isLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900">
        <div className="text-white text-lg">Loading chapter...</div>
      </div>
    )
  }

  if (imageError) {
    return (
      <div className="bg-gray-900 min-h-[80vh] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Unable to load page image</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  const imagePath = getChapterPageImage(dayNumber, currentPage)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 min-h-[80vh] flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="bg-blue-800 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📖</div>
          <span className="font-semibold text-base md:text-lg">Reading: {chapterTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFullscreen}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Page Display Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <div
            className={`relative transition-all duration-300 ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <img
              ref={imageRef}
              src={imagePath}
              alt={`Page ${currentPage} of ${chapterTitle}`}
              className="max-w-full max-h-[calc(100vh-200px)] object-contain shadow-2xl rounded-sm"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-gray-800/90 px-4 py-4 flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={isFirstPage}
          variant="secondary"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>

        <div className="text-white text-center">
          <div className="text-lg font-semibold">
            Page {currentPage} of {totalPages}
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Use arrow keys or swipe to navigate
          </div>
        </div>

        {isLastPage ? (
          <Button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Complete Chapter
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Next
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>

      {/* Back Button (fixed position) */}
      <button
        onClick={onBack}
        className="absolute top-20 left-4 px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg transition-colors"
        title="Back to Overview"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
    </div>
  )
}
