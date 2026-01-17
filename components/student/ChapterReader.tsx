'use client'

import { useEffect, useState, useMemo } from 'react'
import MilestoneToast from './MilestoneToast'

interface ChapterChunk {
  id: number
  title?: string
  body: string[]
  imageUrl?: string | null  // NEW: Optional image URL
}

interface ChapterReaderProps {
  content: string
  chunks?: ChapterChunk[]
  onNext: () => void
  onBack: () => void
  dayNumber: number
  title: string
}

export default function ChapterReader({ content, chunks, onNext, onBack, dayNumber, title }: ChapterReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shownMilestones, setShownMilestones] = useState<number[]>([])
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null)

  // Memoize chunks check to prevent unnecessary re-renders
  const chunksArray = useMemo(() => {
    if (!chunks || !Array.isArray(chunks)) return null
    return chunks.length > 0 ? chunks : null
  }, [chunks])

  const isChunkedMode = chunksArray !== null
  const storageKey = `chapter-${dayNumber}-progress`
  const chunksLength = chunksArray?.length ?? 0

  // Load progress from localStorage on mount (only once)
  useEffect(() => {
    if (!isChunkedMode || !chunksArray) return
    
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const savedIndex = parseInt(saved, 10)
        if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < chunksLength) {
          setCurrentIndex(savedIndex)
        }
      }
    } catch (err) {
      console.error('Failed to load progress:', err)
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save progress to localStorage when index changes
  useEffect(() => {
    if (!isChunkedMode) return
    
    try {
      localStorage.setItem(storageKey, currentIndex.toString())
    } catch (err) {
      console.error('Failed to save progress:', err)
    }
  }, [currentIndex, isChunkedMode, storageKey])

  // Check for milestone achievements
  useEffect(() => {
    if (!isChunkedMode || !chunksArray || chunksLength === 0) return
    
    const progress = (currentIndex + 1) / chunksLength
    const percentage = Math.round(progress * 100)
    
    // Check milestones: 25%, 50%, 75%, 100%
    const milestones = [25, 50, 75, 100]
    
    // Use functional update to avoid dependency on shownMilestones
    setShownMilestones(prev => {
      for (const milestone of milestones) {
        if (percentage >= milestone && !prev.includes(milestone)) {
          setActiveMilestone(milestone)
          // Don't auto-dismiss - user closes manually
          return [...prev, milestone]
        }
      }
      return prev
    })
  }, [currentIndex, isChunkedMode, chunksLength])

  // Keyboard navigation
  useEffect(() => {
    if (!isChunkedMode) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      } else if (e.key === 'ArrowRight' && currentIndex < chunksLength - 1) {
        setCurrentIndex(prev => prev + 1)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isChunkedMode, currentIndex, chunksLength])

  const handleDownloadPDF = () => {
    window.open(`/api/chapters/${dayNumber}/pdf`, '_blank')
  }

  const handleNext = () => {
    if (isChunkedMode && chunksArray) {
      if (currentIndex < chunksLength - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        // Last chunk - clear localStorage and proceed to next step
        try {
          localStorage.removeItem(storageKey)
        } catch (err) {
          console.error('Failed to clear progress:', err)
        }
        onNext()
      }
    } else {
      onNext()
    }
  }

  const handlePrevious = () => {
    if (isChunkedMode && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      onBack()
    }
  }

  // Chunked mode rendering
  if (isChunkedMode && chunksArray) {
    const currentChunk = chunksArray[currentIndex]
    const progress = (currentIndex + 1) / chunksLength
    const progressPercentage = Math.round(progress * 100)

    return (
      <div className="max-w-4xl mx-auto">
        {/* Reading Header Bar */}
        <div className="bg-[var(--color-blue)] text-white px-4 py-3 md:px-6 md:py-4 mb-0 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📖</div>
            <span className="headline-md">Reading</span>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 bg-[var(--color-amber)] text-white rounded-full hover:bg-[#d49f01] font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
        </div>

        {/* Chunk Content - 2 Column Layout */}
        <div className="bg-white shadow-lg flex flex-col md:flex-row">
          {/* Left Column: Image (40% on desktop, full-width on mobile) */}
          <div className="md:w-2/5 bg-gray-50 overflow-hidden">
            {currentChunk.imageUrl ? (
              <img
                src={currentChunk.imageUrl}
                alt={currentChunk.title || title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Right Column: Text Content (60% on desktop, full-width on mobile) */}
          <div className="md:w-3/5 p-6 md:p-8 flex flex-col">
            <div className="prose prose-lg max-w-none flex-1" style={{ fontFamily: 'var(--font-body)' }}>
              {currentChunk.title && (
                <h2 className="headline-lg mb-6 text-[var(--color-charcoal)]">{currentChunk.title}</h2>
              )}
              {currentChunk.body.map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-[var(--color-blue)] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Completed {progressPercentage}% of this chapter
                <span className="ml-2 text-gray-500">
                  (Chunk {currentIndex + 1} of {chunksLength})
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Footer */}
        <div className="bg-white border-t border-gray-200 p-4 md:p-6 flex justify-between shadow-lg">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-[var(--color-charcoal)] hover:bg-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {currentIndex === 0 ? 'Back' : 'Previous'}
          </button>
          <button
            onClick={handleNext}
            className="px-4 md:px-6 py-2 md:py-3 bg-[var(--color-amber)] text-white rounded-lg hover:bg-[#d49f01] font-medium transition-colors flex items-center gap-2"
          >
            {currentIndex === chunksLength - 1 ? 'Complete Reading' : 'Next'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Milestone Toast Notification */}
        <MilestoneToast
          open={activeMilestone !== null}
          milestone={activeMilestone ?? 0}
          chapterTitle={title}
          onClose={() => setActiveMilestone(null)}
        />
      </div>
    )
  }

  // Fallback mode - original full-scroll behavior for chapters without chunks
  return (
    <div className="max-w-4xl mx-auto">
      {/* Reading Header Bar */}
      <div className="bg-[var(--color-blue)] text-white px-4 py-3 md:px-6 md:py-4 mb-0 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📖</div>
          <span className="headline-md">Reading</span>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="px-3 py-1.5 bg-[var(--color-amber)] text-white rounded-full hover:bg-[#d49f01] font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </button>
      </div>

      {/* Chapter Content */}
      <div className="bg-white p-6 md:p-8 min-h-[400px] shadow-lg">
        <div className="prose prose-lg max-w-none" style={{ fontFamily: 'var(--font-body)' }}>
          {content.split('\n').map((paragraph, idx) => {
            // Skip the first H1 heading if it matches the title (to avoid duplicate)
            if (paragraph.startsWith('# ')) {
              const h1Content = paragraph.substring(2).trim()
              // If this is the first non-empty line and it matches the title, skip it
              const isFirstHeading = idx === 0 || content.split('\n').slice(0, idx).every(p => !p.trim())
              if (isFirstHeading && h1Content.toLowerCase() === title.toLowerCase()) {
                // Skip this heading since it duplicates the title
                return null
              }
              return <h1 key={idx} className="text-3xl font-bold mb-4">{h1Content}</h1>
            }
            if (paragraph.startsWith('## ')) {
              return <h2 key={idx} className="text-2xl font-semibold mt-6 mb-3">{paragraph.substring(3)}</h2>
            }
            if (paragraph.startsWith('### ')) {
              return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">{paragraph.substring(4)}</h3>
            }
            if (paragraph.trim() === '') {
              return <div key={idx} className="h-4" />
            }
            return <p key={idx} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>
          }).filter(Boolean)}
        </div>
      </div>
      
      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 p-4 md:p-6 flex justify-between shadow-lg">
        <button
          onClick={onBack}
          className="px-4 md:px-6 py-2 md:py-3 bg-gray-300 text-[var(--color-charcoal)] rounded-lg hover:bg-gray-400 font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          className="px-4 md:px-6 py-2 md:py-3 bg-[var(--color-amber)] text-white rounded-lg hover:bg-[#d49f01] font-medium transition-colors flex items-center gap-2"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
