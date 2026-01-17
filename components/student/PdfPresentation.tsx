'use client'

import { useEffect, useState } from 'react'

interface PdfPresentationProps {
  dayNumber: number
  title: string
  totalPages: number
  onComplete: () => void
  onBack: () => void
}

export default function PdfPresentation({ dayNumber, title, totalPages, onComplete, onBack }: PdfPresentationProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [pdfError, setPdfError] = useState(false)

  // Determine PDF path based on day number
  useEffect(() => {
    // For Day 1, use tcp-foundation-chapter1.pdf
    if (dayNumber === 1) {
      setPdfUrl('/tcp-foundation-chapter1.pdf')
    } else {
      // For other days, use pattern: tcp-day-{dayNumber}.pdf
      setPdfUrl(`/tcp-day-${dayNumber}.pdf`)
    }
    setPdfError(false)
  }, [dayNumber])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        handlePreviousPage()
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        handleNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages])

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(prev => Math.max(1, prev - 1))
        setIsTransitioning(false)
      }, 200)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1))
        setIsTransitioning(false)
      }, 200)
    }
  }

  const handlePdfError = () => {
    console.error(`Failed to load PDF: ${pdfUrl}`)
    setPdfError(true)
  }

  if (pdfError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-4">
            Failed to load PDF presentation
          </div>
          <div className="text-gray-600 text-sm mb-4">
            PDF file not found: {pdfUrl}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setPdfError(false)
                setPdfUrl(pdfUrl) // Retry
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <span className="font-semibold text-base md:text-lg">Presentation</span>
        </div>
        <div className="text-sm md:text-base">
          Page <span className="font-bold">{currentPage}</span> of {totalPages}
        </div>
      </div>

      {/* Main Presentation Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden bg-gray-900">
        <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
          {/* PDF Viewer */}
          {pdfUrl && (
            <iframe
              src={`${pdfUrl}#page=${currentPage}`}
              className={`w-full h-full max-w-full max-h-full rounded-lg shadow-2xl transition-opacity duration-200 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ 
                display: isTransitioning ? 'none' : 'block',
                minHeight: '600px',
                border: 'none'
              }}
              onError={handlePdfError}
              title={`${title} - Page ${currentPage}`}
            />
          )}

          {/* Loading indicator during transition */}
          {isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 md:p-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          {/* Left: Back/Previous */}
          <div className="flex gap-2">
            {currentPage === 1 ? (
              <button
                onClick={onBack}
                className="px-4 md:px-6 py-2 md:py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <button
                onClick={handlePreviousPage}
                disabled={isTransitioning}
                className="px-4 md:px-6 py-2 md:py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
          </div>

          {/* Center: Page dots/indicators */}
          <div className="hidden md:flex gap-1 items-center">
            {Array.from({ length: Math.min(totalPages, 12) }).map((_, idx) => {
              const pageNum = idx + 1
              const isActive = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    if (!isTransitioning && pageNum !== currentPage && pageNum >= 1 && pageNum <= totalPages) {
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setCurrentPage(pageNum)
                        setIsTransitioning(false)
                      }, 200)
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive ? 'bg-blue-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  title={`Go to page ${pageNum}`}
                />
              )
            })}
          </div>

          {/* Right: Next/Complete */}
          {currentPage >= totalPages ? (
            <button
              onClick={onComplete}
              className="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
            >
              Complete Presentation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleNextPage}
              disabled={isTransitioning}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="bg-gray-900 text-gray-400 text-xs text-center py-2">
        Use <kbd className="px-2 py-1 bg-gray-800 rounded">←</kbd> and{' '}
        <kbd className="px-2 py-1 bg-gray-800 rounded">→</kbd> arrow keys to navigate
      </div>
    </div>
  )
}
