'use client'

import { useState } from 'react'
import { 
  Type, 
  Image as ImageIcon, 
  List, 
  Quote, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Plus,
  Palette,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import Button from '@/components/ui/Button'
import BlockRenderer from '@/components/content/BlockRenderer'
import ImageUploadField from '@/components/admin/ImageUploadField'

interface ContentEditorProps {
  content: any[]
  onChange: (content: any[]) => void
  chapterSlug?: string
  stepSlug?: string
  pageOrder?: number
}

export default function ContentEditor({ 
  content, 
  onChange, 
  chapterSlug = 'general',
  stepSlug = 'content',
  pageOrder = 0 
}: ContentEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<any>(null)
  const [showBlockPalette, setShowBlockPalette] = useState(false)

  const blockTypes = [
    { type: 'heading', icon: Type, label: 'Heading' },
    { type: 'paragraph', icon: Edit2, label: 'Paragraph' },
    { type: 'story', icon: Edit2, label: 'Story Text' },
    { type: 'image', icon: ImageIcon, label: 'Image' },
    { type: 'list', icon: List, label: 'List' },
    { type: 'quote', icon: Quote, label: 'Quote' },
    { type: 'callout', icon: AlertCircle, label: 'Callout' },
  ]

  const textColors = [
    { value: '', label: 'Default' },
    { value: '#000000', label: 'Black' },
    { value: '#ffffff', label: 'White' },
    { value: '#ef4444', label: 'Red' },
    { value: '#f97316', label: 'Orange' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#22c55e', label: 'Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#6b7280', label: 'Gray' },
  ]

  const bgColors = [
    { value: '', label: 'None' },
    { value: '#f3f4f6', label: 'Light Gray' },
    { value: '#dbeafe', label: 'Light Blue' },
    { value: '#fef3c7', label: 'Light Yellow' },
    { value: '#dcfce7', label: 'Light Green' },
    { value: '#fee2e2', label: 'Light Red' },
    { value: '#f3e8ff', label: 'Light Purple' },
  ]

  const fontSizes = [
    { value: 'text-xs', label: 'Extra Small' },
    { value: 'text-sm', label: 'Small' },
    { value: 'text-base', label: 'Base' },
    { value: 'text-lg', label: 'Large' },
    { value: 'text-xl', label: 'Extra Large' },
    { value: 'text-2xl', label: '2XL' },
    { value: 'text-3xl', label: '3XL' },
    { value: 'text-4xl', label: '4XL' },
  ]

  const handleAddBlock = (type: string) => {
    let newBlock: any = { type }
    
    switch (type) {
      case 'heading':
        newBlock = { type: 'heading', level: 2, text: 'New Heading' }
        break
      case 'paragraph':
        newBlock = { type: 'paragraph', text: 'New paragraph text...' }
        break
      case 'story':
        newBlock = { type: 'story', text: 'Story content...\nAdd dialogue with quotes for indentation.' }
        break
      case 'image':
        newBlock = { type: 'image', src: '', alt: '', caption: '' }
        break
      case 'list':
        newBlock = { type: 'list', style: 'bullets', items: ['Item 1', 'Item 2'] }
        break
      case 'quote':
        newBlock = { type: 'quote', text: 'Quote text...', author: '' }
        break
      case 'callout':
        newBlock = { type: 'callout', variant: 'tip', title: 'Tip', text: 'Callout text...' }
        break
    }
    
    onChange([...content, newBlock])
    setShowBlockPalette(false)
  }

  const handleEditBlock = (index: number) => {
    setEditingIndex(index)
    setEditingData({ ...content[index] })
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingData) {
      const newContent = [...content]
      newContent[editingIndex] = editingData
      onChange(newContent)
      setEditingIndex(null)
      setEditingData(null)
    }
  }

  const handleDeleteBlock = (index: number) => {
    if (confirm('Delete this block?')) {
      onChange(content.filter((_, i) => i !== index))
    }
  }

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= content.length) return
    
    const newContent = [...content]
    const temp = newContent[index]
    newContent[index] = newContent[newIndex]
    newContent[newIndex] = temp
    onChange(newContent)
  }

  return (
    <div className="h-full flex">
      {/* Left: Block Palette */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Add Block</h3>
        <div className="space-y-2">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.type}
              onClick={() => handleAddBlock(blockType.type)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <blockType.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{blockType.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Content List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No content blocks yet. Add a block from the left panel.
              </p>
            </div>
          ) : (
            content.map((block, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium">
                    {block.type}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveBlock(index, 'down')}
                      disabled={index === content.length - 1}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditBlock(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(index)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                {editingIndex === index ? (
                  <div className="space-y-4">
                    {/* Common Formatting Controls */}
                    <div className="grid grid-cols-2 gap-3">
                      {(block.type === 'heading' || block.type === 'paragraph' || block.type === 'story' || block.type === 'quote') && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Text Color
                            </label>
                            <select
                              value={editingData?.color || ''}
                              onChange={(e) => setEditingData({ ...editingData, color: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            >
                              {textColors.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Background
                            </label>
                            <select
                              value={editingData?.bgColor || ''}
                              onChange={(e) => setEditingData({ ...editingData, bgColor: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            >
                              {bgColors.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Font Size
                            </label>
                            <select
                              value={editingData?.fontSize || 'text-base'}
                              onChange={(e) => setEditingData({ ...editingData, fontSize: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            >
                              {fontSizes.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Text Align
                            </label>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingData({ ...editingData, align: 'left' })}
                                className={`flex-1 px-2 py-2 border rounded ${editingData?.align === 'left' || !editingData?.align ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                              >
                                <AlignLeft className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingData({ ...editingData, align: 'center' })}
                                className={`flex-1 px-2 py-2 border rounded ${editingData?.align === 'center' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                              >
                                <AlignCenter className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingData({ ...editingData, align: 'right' })}
                                className={`flex-1 px-2 py-2 border rounded ${editingData?.align === 'right' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                              >
                                <AlignRight className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Style Toggles */}
                    {(block.type === 'heading' || block.type === 'paragraph' || block.type === 'story') && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingData({ ...editingData, bold: !editingData?.bold })}
                          className={`px-3 py-2 border rounded ${editingData?.bold ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingData({ ...editingData, italic: !editingData?.italic })}
                          className={`px-3 py-2 border rounded ${editingData?.italic ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingData({ ...editingData, underline: !editingData?.underline })}
                          className={`px-3 py-2 border rounded ${editingData?.underline ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                        >
                          <Underline className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Block-specific fields */}
                    {block.type === 'heading' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Heading Level
                          </label>
                          <select
                            value={editingData?.level || 2}
                            onChange={(e) => setEditingData({ ...editingData, level: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value={1}>H1 - Main Title</option>
                            <option value={2}>H2 - Section</option>
                            <option value={3}>H3 - Subsection</option>
                            <option value={4}>H4 - Minor Heading</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Heading Text
                          </label>
                          <input
                            type="text"
                            value={editingData?.text || ''}
                            onChange={(e) => setEditingData({ ...editingData, text: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Enter heading text"
                          />
                        </div>
                      </>
                    )}
                    
                    {block.type === 'paragraph' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Paragraph Text
                        </label>
                        <textarea
                          value={editingData?.text || ''}
                          onChange={(e) => setEditingData({ ...editingData, text: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                          placeholder="Enter paragraph text"
                        />
                      </div>
                    )}

                    {block.type === 'story' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Story Text
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Tip: Lines starting with " will be indented (dialogue)
                        </p>
                        <textarea
                          value={editingData?.text || ''}
                          onChange={(e) => setEditingData({ ...editingData, text: e.target.value })}
                          rows={10}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                          placeholder="Enter story text... &#10;&#10;&quot;Dialogue lines&quot; will be indented"
                        />
                      </div>
                    )}
                    
                    {block.type === 'image' && (
                      <>
                        {/* Current Image Preview */}
                        {editingData?.src && editingData.src.trim() !== '' && (
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Current Image
                            </label>
                            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                              <img
                                src={editingData.src}
                                alt={editingData.alt || 'Preview'}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {editingData.src}
                            </p>
                          </div>
                        )}

                        <ImageUploadField
                          label={editingData?.src && editingData.src.trim() !== '' ? "Replace Image" : "Add Image"}
                          value={editingData?.src || ''}
                          onChange={(url) => setEditingData({ ...editingData, src: url as string })}
                          helperText="Upload an image or select from gallery"
                          chapterSlug={chapterSlug}
                          stepSlug={stepSlug}
                          pageOrder={pageOrder}
                        />
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Alt Text (for accessibility)
                          </label>
                          <input
                            type="text"
                            value={editingData?.alt || ''}
                            onChange={(e) => setEditingData({ ...editingData, alt: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Describe the image"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Caption (optional)
                          </label>
                          <input
                            type="text"
                            value={editingData?.caption || ''}
                            onChange={(e) => setEditingData({ ...editingData, caption: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Image caption"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'quote' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quote Text
                          </label>
                          <textarea
                            value={editingData?.text || ''}
                            onChange={(e) => setEditingData({ ...editingData, text: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Quote text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Author (optional)
                          </label>
                          <input
                            type="text"
                            value={editingData?.author || ''}
                            onChange={(e) => setEditingData({ ...editingData, author: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Author name"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'list' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            List Style
                          </label>
                          <select
                            value={editingData?.style || 'bullets'}
                            onChange={(e) => setEditingData({ ...editingData, style: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="bullets">Bullets</option>
                            <option value="numbers">Numbers</option>
                            <option value="checks">Checkmarks</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            List Items (one per line)
                          </label>
                          <textarea
                            value={(editingData?.items || []).join('\n')}
                            onChange={(e) => setEditingData({ ...editingData, items: e.target.value.split('\n').filter(i => i.trim()) })}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                            placeholder="Item 1&#10;Item 2&#10;Item 3"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'callout' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Callout Type
                          </label>
                          <select
                            value={editingData?.variant || 'tip'}
                            onChange={(e) => setEditingData({ ...editingData, variant: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="tip">Tip (Blue)</option>
                            <option value="warning">Warning (Yellow)</option>
                            <option value="danger">Danger (Red)</option>
                            <option value="success">Success (Green)</option>
                            <option value="info">Info (Gray)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Callout title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Text
                          </label>
                          <textarea
                            value={editingData?.text || ''}
                            onChange={(e) => setEditingData({ ...editingData, text: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Callout text"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                        Save Changes
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => { setEditingIndex(null); setEditingData(null); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="prose dark:prose-invert max-w-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 p-2 rounded transition-colors"
                    onClick={() => handleEditBlock(index)}
                  >
                    <BlockRenderer block={block} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
