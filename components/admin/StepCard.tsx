'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  FileEdit,
  Copy,
  ArrowUp,
  ArrowDown,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Page {
  id: string
  title: string
  slug: string
  order_index: number
  estimated_minutes?: number
  xp_award?: number
  content: any[]
}

interface StepCardProps {
  step: {
    id: string
    step_type: string
    title: string
    slug: string
    order_index: number
    is_required: boolean
  }
  pages: Page[]
  chapterId: string
  isExpanded: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onToggle: () => void
  onAddPage: () => void
  onAddFromTemplate: () => void
  onEditStep: () => void
  onDeleteStep: () => void
  onDeletePage: (pageId: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onPageMoveUp: (pageId: string) => void
  onPageMoveDown: (pageId: string) => void
}

const stepTypeIcons: Record<string, string> = {
  read: '📖',
  self_check: '✅',
  framework: '⚡',
  techniques: '💡',
  resolution: '🎯',
  follow_through: '📅'
}

const stepTypeNames: Record<string, string> = {
  read: 'Reading',
  self_check: 'Self-Check',
  framework: 'Framework',
  techniques: 'Techniques',
  resolution: 'Resolution',
  follow_through: 'Follow-Through'
}

export default function StepCard({
  step,
  pages,
  chapterId,
  isExpanded,
  canMoveUp,
  canMoveDown,
  onToggle,
  onAddPage,
  onAddFromTemplate,
  onEditStep,
  onDeleteStep,
  onDeletePage,
  onMoveUp,
  onMoveDown,
  onPageMoveUp,
  onPageMoveDown
}: StepCardProps) {
  const icon = stepTypeIcons[step.step_type] || '📄'
  const typeName = stepTypeNames[step.step_type] || step.step_type

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Step Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onToggle}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            <span className="text-2xl">{icon}</span>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium">
                  {typeName}
                </span>
                {step.is_required ? (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 rounded text-xs font-medium">
                    Required
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                {isExpanded ? ' (expanded)' : ' (click to expand)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onEditStep}
            >
              <Edit className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteStep}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        {isExpanded && (
          <div className="flex gap-2 mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={onAddPage}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Page
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddFromTemplate}
            >
              <FileText className="w-4 h-4 mr-1" />
              Add from Template
            </Button>
          </div>
        )}
      </div>

      {/* Pages List */}
      {isExpanded && (
        <div className="p-4">
          {pages.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <p className="mb-3">No pages yet in this step</p>
              <div className="flex gap-2 justify-center">
                <Button variant="primary" size="sm" onClick={onAddPage}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create First Page
                </Button>
                <Button variant="secondary" size="sm" onClick={onAddFromTemplate}>
                  <FileText className="w-4 h-4 mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[var(--color-amber)] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => onPageMoveUp(page.id)}
                        disabled={index === 0}
                        className="p-0.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onPageMoveDown(page.id)}
                        disabled={index === pages.length - 1}
                        className="p-0.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {page.title || 'Untitled Page'}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        <span>{page.estimated_minutes || 0} min</span>
                        <span>{page.xp_award || 0} XP</span>
                        <span>{(page.content || []).length} blocks</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/chapters/${chapterId}/pages/${page.id}/edit`}>
                      <Button variant="primary" size="sm">
                        <FileEdit className="w-4 h-4 mr-1" />
                        Edit Content
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePage(page.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
