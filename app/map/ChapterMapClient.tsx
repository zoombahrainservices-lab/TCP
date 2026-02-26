'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MapSidebar from './MapSidebar'
import ChapterDetailsPanel from './ChapterDetailsPanel'

interface Page {
  id: string
  title: string
  slug: string
  order_index: number
  isCompleted: boolean
}

interface Step {
  id: string
  step_type: string
  title: string
  slug: string
  order_index: number
  pages: Page[]
}

interface Chapter {
  id: string
  chapter_number: number
  title: string
  slug: string
  steps: Step[]
}

interface Props {
  chapters: Chapter[]
  isAdmin: boolean
  currentChapterSlug: string
  initialChapterNumber: number
}

export function ChapterMapClient({ chapters, isAdmin, currentChapterSlug, initialChapterNumber }: Props) {
  const router = useRouter()
  const [selectedChapterNumber, setSelectedChapterNumber] = useState(initialChapterNumber)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  
  const selectedChapter = chapters.find(c => c.chapter_number === selectedChapterNumber) || chapters[0]
  
  // Flatten all pages for the selected chapter
  const allPages: (Page & { stepSlug: string })[] = []
  selectedChapter?.steps.forEach(step => {
    step.pages.forEach(page => {
      allPages.push({ ...page, stepSlug: step.slug })
    })
  })
  
  const handlePageClick = (page: Page & { stepSlug: string }) => {
    if (selectedChapter) {
      router.push(`/read/${selectedChapter.slug}/${page.stepSlug}`)
    }
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Left Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <MapSidebar currentChapterSlug={currentChapterSlug} isAdmin={isAdmin} />
      </div>
      
      {/* Center Map Area */}
      <div className="flex-1 overflow-y-auto relative">
        <div 
          className="min-h-full relative"
          style={{
            backgroundImage: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff, #fae8ff, #fce7f3)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/50" />
          
          {/* Content */}
          <div className="relative z-10 p-8 lg:p-12">
            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                Chapter {selectedChapter?.chapter_number} Progress
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Your learning journey through Chapter {selectedChapter?.chapter_number} — Scroll to see each step
              </p>
            </div>
            
            {/* Visual Map */}
            <div className="max-w-5xl mx-auto">
              {allPages.length > 0 ? (
                <ChapterVisualization pages={allPages} onPageClick={handlePageClick} />
              ) : (
                <div className="flex items-center justify-center h-64 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-gray-500 dark:text-gray-400">No pages found for this chapter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Always-visible toggle button for chapter details */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg text-sm font-bold hover:bg-blue-700 transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="hidden sm:inline">
            {isPanelOpen ? 'Hide Details' : 'Show Details'}
          </span>
        </button>
      </div>
      
      {/* Right Panel - Overlay on mobile, fixed sidebar on desktop */}
      {isPanelOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsPanelOpen(false)}
          />
          
          {/* Panel - slides in from right on mobile, static on desktop */}
          <div className="fixed md:relative right-0 top-0 h-screen z-50 md:z-auto">
            <ChapterDetailsPanel
              chapters={chapters}
              selectedChapterNumber={selectedChapterNumber}
              onChapterChange={setSelectedChapterNumber}
              onClose={() => setIsPanelOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  )
}

function ChapterVisualization({ 
  pages, 
  onPageClick 
}: { 
  pages: (Page & { stepSlug: string })[]
  onPageClick: (page: Page & { stepSlug: string }) => void 
}) {
  // Calculate positions for pages in a winding path
  const positions = calculatePathPositions(pages.length)
  
  return (
    <div className="relative w-full" style={{ minHeight: '600px' }}>
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {/* Draw connecting path */}
        {positions.map((pos, i) => {
          if (i === positions.length - 1) return null
          const next = positions[i + 1]
          const isCompleted = pages[i].isCompleted && pages[i + 1].isCompleted
          
          return (
            <line
              key={`line-${i}`}
              x1={`${pos.x}%`}
              y1={`${pos.y}%`}
              x2={`${next.x}%`}
              y2={`${next.y}%`}
              stroke={isCompleted ? '#EAB308' : '#D1D5DB'}
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )
        })}
      </svg>
      
      {/* Page circles */}
      {pages.map((page, i) => {
        const pos = positions[i]
        const isCompleted = page.isCompleted
        
        return (
          <button
            key={page.id}
            onClick={() => onPageClick(page)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 active:scale-95 group"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              zIndex: 10
            }}
            title={page.title}
          >
            {/* Glow effect */}
            {isCompleted && (
              <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
            )}
            
            <div className={`
              relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center font-bold text-base
              transition-all duration-300 group-hover:shadow-amber-500/50
              ${isCompleted 
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-300/50' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }
            `}>
              {i + 1}
            </div>
            
            {/* Label */}
            <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-900/90 dark:bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg">
                {page.title.length > 30 ? page.title.slice(0, 30) + '...' : page.title}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function calculatePathPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  const padding = 10 // percentage
  const usableWidth = 100 - padding * 2
  const usableHeight = 100 - padding * 2
  
  // Create a more natural winding path
  const itemsPerRow = Math.min(5, Math.ceil(Math.sqrt(count * 1.2)))
  const rows = Math.ceil(count / itemsPerRow)
  const verticalSpacing = rows > 1 ? usableHeight / (rows - 1) : 0
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / itemsPerRow)
    const col = i % itemsPerRow
    const itemsInThisRow = Math.min(itemsPerRow, count - row * itemsPerRow)
    const horizontalSpacing = itemsInThisRow > 1 ? usableWidth / (itemsInThisRow - 1) : usableWidth / 2
    
    // Alternate direction for each row (snake pattern)
    const actualCol = row % 2 === 0 ? col : (itemsInThisRow - 1 - col)
    
    // Add slight curve to make path more natural
    const curveOffset = row % 2 === 0 ? Math.sin(col / itemsInThisRow * Math.PI) * 3 : -Math.sin(col / itemsInThisRow * Math.PI) * 3
    
    const x = padding + actualCol * horizontalSpacing
    const y = padding + row * verticalSpacing + curveOffset
    
    positions.push({ x, y })
  }
  
  return positions
}
