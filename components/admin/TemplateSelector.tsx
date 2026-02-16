'use client'

import { useState } from 'react'
import { contentTemplates, ContentTemplate, applyTemplate } from '@/lib/content/templates'
import Button from '@/components/ui/Button'
import { X, FileText } from 'lucide-react'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (blocks: any[]) => void
  category?: ContentTemplate['category']
}

export default function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  category,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  if (!isOpen) return null

  const templates = category
    ? contentTemplates.filter(t => t.category === category)
    : contentTemplates

  const handleApply = () => {
    if (!selectedTemplate) return
    
    const blocks = applyTemplate(selectedTemplate)
    onSelectTemplate(blocks)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Choose a Template
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Start with a pre-built template and customize it
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template.key}
                onClick={() => setSelectedTemplate(template.key)}
                className={`text-left p-4 border-2 rounded-lg transition-colors ${
                  selectedTemplate === template.key
                    ? 'border-[var(--color-amber)] bg-amber-50 dark:bg-amber-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <FileText className="w-5 h-5 text-[var(--color-amber)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-500 capitalize">
                      {template.category.replace('-', ' ')}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      {template.blocks.length} blocks
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No templates available for this category
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedTemplate
              ? `Selected: ${templates.find(t => t.key === selectedTemplate)?.name}`
              : 'Select a template to continue'}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
              disabled={!selectedTemplate}
            >
              Apply Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
