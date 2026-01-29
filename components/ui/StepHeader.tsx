import React from 'react'
import BlockChip from './BlockChip'
import Button from './Button'

interface Block {
  type: 'reading' | 'assessment' | 'framework' | 'techniques' | 'proof' | 'follow-through'
  label: string
  completed: boolean
}

interface StepHeaderProps {
  chapterTitle: string
  currentStep: number
  totalSteps: number
  currentBlock: string
  blocks: Block[]
  onResumeLater?: () => void
}

export default function StepHeader({
  chapterTitle,
  currentStep,
  totalSteps,
  currentBlock,
  blocks,
  onResumeLater,
}: StepHeaderProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className="bg-white dark:bg-[#142A4A] border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top row: Title and Resume button */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-charcoal)] dark:text-white">
              {chapterTitle}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-1">
              Step {currentStep} / {totalSteps}
            </p>
          </div>
          {onResumeLater && (
            <Button variant="ghost" size="sm" onClick={onResumeLater}>
              Resume Later
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-amber)] transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Block chips */}
        <div className="flex flex-wrap gap-2">
          {blocks.map((block) => (
            <BlockChip
              key={block.type}
              type={block.type}
              active={block.type === currentBlock}
              completed={block.completed}
            >
              {block.label}
            </BlockChip>
          ))}
        </div>
      </div>
    </div>
  )
}
