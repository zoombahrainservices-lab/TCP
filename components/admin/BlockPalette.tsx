'use client'

import { memo, useMemo } from 'react'
import { 
  Type, 
  AlignLeft, 
  MessageSquare, 
  Quote, 
  Minus,
  Image as ImageIcon,
  AlertCircle,
  List,
  MessageCircle,
  BarChart3,
  CheckSquare,
  ListChecks,
  Calendar,
  FileText,
  Zap,
  MousePointerClick
} from 'lucide-react'

export interface BlockType {
  type: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'text' | 'visual' | 'interactive' | 'planning' | 'action'
}

export const blockTypes: BlockType[] = [
  // Text blocks
  { type: 'heading', name: 'Heading', description: 'Section title', icon: Type, category: 'text' },
  { type: 'paragraph', name: 'Paragraph', description: 'Plain text', icon: AlignLeft, category: 'text' },
  { type: 'story', name: 'Story', description: 'Narrative dialogue', icon: MessageSquare, category: 'text' },
  { type: 'quote', name: 'Quote', description: 'Quotation block', icon: Quote, category: 'text' },
  { type: 'divider', name: 'Divider', description: 'Visual separator', icon: Minus, category: 'text' },
  
  // Visual blocks
  { type: 'image', name: 'Image', description: 'Upload or link image', icon: ImageIcon, category: 'visual' },
  { type: 'callout', name: 'Callout', description: 'Highlighted box', icon: AlertCircle, category: 'visual' },
  { type: 'list', name: 'List', description: 'Bullet or numbered list', icon: List, category: 'visual' },
  { type: 'framework_intro', name: 'Framework Intro', description: 'Framework overview + letters', icon: Zap, category: 'visual' },
  { type: 'framework_letter', name: 'Framework Letter', description: 'Single framework letter card', icon: Type, category: 'visual' },
  
  // Interactive blocks
  { type: 'prompt', name: 'Prompt', description: 'User input field', icon: MessageCircle, category: 'interactive' },
  { type: 'scale_questions', name: 'Scale Questions', description: 'Rating questions', icon: BarChart3, category: 'interactive' },
  { type: 'yes_no_check', name: 'Yes/No Check', description: 'Yes/no statements', icon: CheckSquare, category: 'interactive' },
  { type: 'checklist', name: 'Checklist', description: 'Checkable items', icon: ListChecks, category: 'interactive' },
  
  // Planning blocks
  { type: 'task_plan', name: 'Task Plan', description: 'Weekly task planner', icon: Calendar, category: 'planning' },
  { type: 'scripts', name: 'Scripts', description: 'Communication scripts', icon: FileText, category: 'planning' },
  
  // Action blocks
  { type: 'cta', name: 'Call to Action', description: 'Prominent CTA', icon: Zap, category: 'action' },
  { type: 'button', name: 'Button', description: 'Action button', icon: MousePointerClick, category: 'action' },
]

interface BlockPaletteProps {
  onSelectBlock: (blockType: string) => void
  isOpen?: boolean
}

// OPTIMIZED: Memoized to prevent unnecessary re-renders
export default memo(function BlockPalette({ onSelectBlock, isOpen = true }: BlockPaletteProps) {
  if (!isOpen) return null

  // OPTIMIZED: Memoize category filtering
  const categories = useMemo(() => ({
    text: blockTypes.filter(b => b.category === 'text'),
    visual: blockTypes.filter(b => b.category === 'visual'),
    interactive: blockTypes.filter(b => b.category === 'interactive'),
    planning: blockTypes.filter(b => b.category === 'planning'),
    action: blockTypes.filter(b => b.category === 'action'),
  }), [])

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
          Add Block
        </h3>

        {Object.entries(categories).map(([categoryName, blocks]) => (
          <div key={categoryName} className="mb-6">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
              {categoryName}
            </h4>
            <div className="space-y-1">
              {blocks.map((block) => {
                const Icon = block.icon
                return (
                  <button
                    key={block.type}
                    onClick={() => onSelectBlock(block.type)}
                    className="w-full flex items-start gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {block.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {block.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
