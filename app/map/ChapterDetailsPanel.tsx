'use client'

import { X, ChevronDown, BookOpen, CheckSquare, Zap, Lightbulb, MapPin, Circle as CircleIcon, List, RotateCcw } from 'lucide-react'

interface Page {
  id: string
  title: string
  isCompleted: boolean
  order_index: number
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

interface ChapterDetailsPanelProps {
  chapters: Chapter[]
  selectedChapterNumber: number
  onChapterChange: (chapterNumber: number) => void
  onClose: () => void
}

const stepIcons: Record<string, any> = {
  read: BookOpen,
  self_check: CheckSquare,
  quiz: Zap,
  framework: Layers,
  techniques: Lightbulb,
  tip: MapPin,
  resolution: CircleIcon,
  follow_through: RotateCcw,
}

const stepLabels: Record<string, string> = {
  read: 'Introduction',
  self_check: 'Reading',
  quiz: 'Quiz',
  framework: 'Exercise',
  techniques: 'Tip',
  tip: 'Tip',
  resolution: 'Insight',
  follow_through: 'Summary',
}

function Layers(props: any) {
  return <List {...props} />
}

function getPageShapeType(index: number, total: number): 'square' | 'circle' | 'triangle' {
  // All pages are circles now - consistent visual design
  return 'circle'
}

function PageShape({ shape, isCompleted }: { shape: 'square' | 'circle' | 'triangle'; isCompleted: boolean }) {
  const baseClasses = 'inline-block transition-all'
  const colorClasses = isCompleted 
    ? 'bg-gray-800 dark:bg-gray-200' 
    : 'bg-gray-300 dark:bg-gray-600'
  
  if (shape === 'square') {
    return <div className={`${baseClasses} ${colorClasses} w-3 h-3`} />
  }
  
  if (shape === 'circle') {
    return <div className={`${baseClasses} ${colorClasses} w-3 h-3 rounded-full`} />
  }
  
  // Triangle
  return (
    <div className="inline-block w-3 h-3 relative">
      <div 
        className={`absolute inset-0 ${colorClasses}`}
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        }}
      />
    </div>
  )
}

export default function ChapterDetailsPanel({ 
  chapters, 
  selectedChapterNumber, 
  onChapterChange,
  onClose 
}: ChapterDetailsPanelProps) {
  const selectedChapter = chapters.find(c => c.chapter_number === selectedChapterNumber) || chapters[0]
  
  // Sort steps by order_index
  const sortedSteps = [...(selectedChapter?.steps || [])].sort((a, b) => a.order_index - b.order_index)
  
  return (
    <div className="w-80 h-screen flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            CH {selectedChapter?.chapter_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Chapter Selector */}
        <div className="relative">
          <select
            value={selectedChapterNumber}
            onChange={(e) => onChapterChange(Number(e.target.value))}
            className="appearance-none w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:border-[var(--color-amber)] transition-colors"
          >
            {chapters.map(c => (
              <option key={c.id} value={c.chapter_number}>
                Chapter {c.chapter_number}: {c.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>
      
      {/* Steps List */}
      <div className="flex-1 p-4 space-y-3">
        {sortedSteps.map((step, index) => {
          const Icon = stepIcons[step.step_type] || BookOpen
          const label = stepLabels[step.step_type] || step.title
          const totalPages = step.pages.length
          const completedPages = step.pages.filter(p => p.isCompleted).length
          const isStepCompleted = completedPages === totalPages && totalPages > 0
          
          return (
            <div
              key={step.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isStepCompleted 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {isStepCompleted ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              
              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {index + 1}. {label}
                  </span>
                </div>
                
                {/* Page Shapes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {step.pages.map((page, pageIndex) => {
                    const shape = getPageShapeType(pageIndex, totalPages)
                    return (
                      <PageShape
                        key={page.id}
                        shape={shape}
                        isCompleted={page.isCompleted}
                      />
                    )
                  })}
                  {totalPages === 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">No pages</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span>Not Started</span>
          </div>
        </div>
      </div>
    </div>
  )
}
