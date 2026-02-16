'use client'

import { useState, useEffect } from 'react'
import BlockPalette from './BlockPalette'
import TemplateSelector from './TemplateSelector'
import Button from '@/components/ui/Button'
import { Save, Eye, RotateCcw, Settings, ChevronLeft, ChevronRight, Plus, Trash2, Copy, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Block {
  type: string
  [key: string]: any
}

interface PageContentEditorProps {
  initialContent: Block[]
  pageId: string
  onSave: (content: Block[]) => Promise<void>
  onClose?: () => void
}

export default function PageContentEditor({
  initialContent,
  pageId,
  onSave,
  onClose,
}: PageContentEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialContent)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPalette, setShowPalette] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null)

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    if (!isDirty) return

    const timer = setTimeout(async () => {
      await handleSave()
    }, 30000)

    return () => clearTimeout(timer)
  }, [blocks, isDirty])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(blocks)
      setIsDirty(false)
      toast.success('Content saved successfully')
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const addBlock = (blockType: string) => {
    const newBlock = createDefaultBlock(blockType)
    setBlocks([...blocks, newBlock])
    setIsDirty(true)
    setSelectedBlockIndex(blocks.length)
  }

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], ...updates }
    setBlocks(newBlocks)
    setIsDirty(true)
  }

  const deleteBlock = (index: number) => {
    if (confirm('Are you sure you want to delete this block?')) {
      const newBlocks = blocks.filter((_, i) => i !== index)
      setBlocks(newBlocks)
      setIsDirty(true)
      setSelectedBlockIndex(null)
    }
  }

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = { ...blocks[index] }
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, blockToDuplicate)
    setBlocks(newBlocks)
    setIsDirty(true)
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return
    }

    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    setBlocks(newBlocks)
    setIsDirty(true)
    setSelectedBlockIndex(targetIndex)
  }

  const revertChanges = () => {
    if (confirm('Revert all unsaved changes?')) {
      setBlocks(initialContent)
      setIsDirty(false)
      toast.success('Changes reverted')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ← Back
              </Button>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Content Editor
              </h2>
              {isDirty && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPalette(!showPalette)}
            >
              <ChevronLeft className="w-4 h-4" />
              {showPalette ? 'Hide' : 'Show'} Palette
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTemplates(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={revertChanges}
              disabled={!isDirty}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Revert
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Block Palette */}
        {showPalette && (
          <BlockPalette onSelectBlock={addBlock} isOpen={showPalette} />
        )}

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {blocks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No blocks yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Click a block type from the palette to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedBlockIndex === index
                        ? 'border-[var(--color-amber)] bg-amber-50 dark:bg-amber-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => setSelectedBlockIndex(index)}
                  >
                    {/* Block header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        {block.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(index, 'up')
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(index, 'down')
                          }}
                          disabled={index === blocks.length - 1}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateBlock(index)
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBlock(index)
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Block content editor */}
                    <BlockEditor
                      block={block}
                      onChange={(updates) => updateBlock(index, updates)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Preview
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preview will show how content appears to users
              </p>
              {/* TODO: Render blocks using BlockRenderer */}
            </div>
          </div>
        )}
      </div>

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(templateBlocks) => {
          setBlocks([...blocks, ...templateBlocks])
          setIsDirty(true)
          toast.success('Template applied')
        }}
      />
    </div>
  )
}

// Simple block editor component (will be enhanced with specific editors)
function BlockEditor({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="space-y-2">
          <select
            value={block.level || 2}
            onChange={(e) => onChange({ level: parseInt(e.target.value) })}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
          </select>
          <input
            type="text"
            value={block.text || ''}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Heading text..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )

    case 'paragraph':
      return (
        <textarea
          value={block.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Paragraph text..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      )

    case 'prompt':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.id || ''}
            onChange={(e) => onChange({ id: e.target.value })}
            placeholder="Prompt ID (e.g., ch1_q1)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <input
            type="text"
            value={block.label || ''}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Question or label..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={block.input || 'text'}
            onChange={(e) => onChange({ input: e.target.value })}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
          </select>
        </div>
      )

    default:
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {block.type} block - Editor coming soon
        </div>
      )
  }
}

// Helper function to create default blocks
function createDefaultBlock(type: string): Block {
  const defaults: Record<string, Block> = {
    heading: { type: 'heading', level: 2, text: '' },
    paragraph: { type: 'paragraph', text: '' },
    story: { type: 'story', text: '', character: '' },
    quote: { type: 'quote', text: '', author: '' },
    divider: { type: 'divider' },
    image: { type: 'image', src: '', alt: '' },
    callout: { type: 'callout', variant: 'tip', text: '' },
    list: { type: 'list', style: 'bullets', items: [] },
    prompt: { type: 'prompt', id: '', label: '', input: 'text' },
    scale_questions: { type: 'scale_questions', questions: [] },
    yes_no_check: { type: 'yes_no_check', statements: [] },
    checklist: { type: 'checklist', items: [] },
    task_plan: { type: 'task_plan', tasks: [] },
    scripts: { type: 'scripts', scripts: [] },
    cta: { type: 'cta', variant: 'primary', text: '', action: '' },
    button: { type: 'button', variant: 'primary', text: '', href: '' },
  }

  return defaults[type] || { type }
}
