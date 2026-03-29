/**
 * ENHANCED RICH TEXT EDITOR
 * 
 * Full-featured Tiptap editor with comprehensive toolbar and JSON storage support.
 * This is the standard editor for all admin text editing.
 * 
 * Features:
 * - Complete text formatting (bold, italic, underline, strike)
 * - Headings (H1, H2, H3)
 * - Colors and highlights
 * - Font sizes
 * - Text alignment
 * - Lists (bullet, numbered)
 * - Links
 * - Blockquotes
 * - Code blocks
 * - Undo/Redo
 * - JSON output (with HTML backward compatibility)
 */

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { JSONContent } from '@tiptap/core'
import { getTiptapExtensions, TiptapPresets } from '@/lib/tiptap/extensions'
import { extractEditorContent, prepareForStorage } from '@/lib/tiptap/storage'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Type,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo,
  Redo,
  X,
} from 'lucide-react'

export interface EnhancedRichTextEditorProps {
  /** Initial content (JSON, HTML, or StoredContent) */
  content: JSONContent | string | any
  /** Change handler - receives JSON by default */
  onChange: (content: JSONContent | string) => void
  /** Output format: 'json' (default) or 'html' (legacy) */
  outputFormat?: 'json' | 'html'
  /** Editor preset: 'full', 'basic', or 'content' */
  preset?: 'full' | 'basic' | 'content'
  /** Placeholder text */
  placeholder?: string
  /** Minimum height */
  minHeight?: string
  /** Read-only mode */
  readOnly?: boolean
  /** Disable specific features */
  disableFeatures?: {
    headings?: boolean
    colors?: boolean
    fontSize?: boolean
    alignment?: boolean
    lists?: boolean
    links?: boolean
    blockquote?: boolean
    code?: boolean
  }
}

const textColors = [
  { value: '#000000', label: 'Black' },
  { value: '#ffffff', label: 'White' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6b7280', label: 'Gray' },
]

const highlightColors = [
  { value: '#fef3c7', label: 'Yellow' },
  { value: '#fed7aa', label: 'Orange' },
  { value: '#fecaca', label: 'Red' },
  { value: '#bbf7d0', label: 'Green' },
  { value: '#bfdbfe', label: 'Blue' },
  { value: '#ddd6fe', label: 'Purple' },
  { value: '#fbcfe8', label: 'Pink' },
]

const fontSizes = [
  { value: '12px', label: 'XS' },
  { value: '14px', label: 'SM' },
  { value: '16px', label: 'Base' },
  { value: '18px', label: 'LG' },
  { value: '20px', label: 'XL' },
  { value: '24px', label: '2XL' },
  { value: '30px', label: '3XL' },
  { value: '36px', label: '4XL' },
]

export default function EnhancedRichTextEditor({
  content,
  onChange,
  outputFormat = 'json',
  preset = 'content',
  placeholder,
  minHeight = '200px',
  readOnly = false,
  disableFeatures = {},
}: EnhancedRichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showSizePicker, setShowSizePicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [hasSelection, setHasSelection] = useState(false)
  const [customColor, setCustomColor] = useState('#3b82f6')
  const [customHighlight, setCustomHighlight] = useState('#fef3c7')
  const [savedColors, setSavedColors] = useState<string[]>([])
  const [savedHighlights, setSavedHighlights] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tiptap-saved-colors')
      const savedHL = localStorage.getItem('tiptap-saved-highlights')
      if (saved) setSavedColors(JSON.parse(saved))
      if (savedHL) setSavedHighlights(JSON.parse(savedHL))
    }
  }, [])

  const saveColorToHistory = (color: string) => {
    const updated = [color, ...savedColors.filter(c => c !== color)].slice(0, 8)
    setSavedColors(updated)
    localStorage.setItem('tiptap-saved-colors', JSON.stringify(updated))
  }

  const saveHighlightToHistory = (color: string) => {
    const updated = [color, ...savedHighlights.filter(c => c !== color)].slice(0, 8)
    setSavedHighlights(updated)
    localStorage.setItem('tiptap-saved-highlights', JSON.stringify(updated))
  }

  // Get extensions based on preset
  const extensions = preset === 'full'
    ? TiptapPresets.full()
    : preset === 'basic'
    ? TiptapPresets.basic()
    : TiptapPresets.content()

  const editor = useEditor({
    extensions,
    content: extractEditorContent(content),
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (outputFormat === 'html') {
        onChange(editor.getHTML())
      } else {
        onChange(editor.getJSON())
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      setHasSelection(from !== to)
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4',
        style: `min-height: ${minHeight}`,
        placeholder: placeholder || 'Start typing...',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const editorContent = extractEditorContent(content)
      const currentContent = editor.getJSON()
      
      // Only update if content actually changed
      if (JSON.stringify(editorContent) !== JSON.stringify(currentContent)) {
        editor.commands.setContent(editorContent)
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    title, 
    children 
  }: { 
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
      }`}
      title={title}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

  return (
    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Selection Warning */}
      {!hasSelection && (showColorPicker || showHighlightPicker || showSizePicker || showLinkDialog) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
          <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
            ⚠️ Select text first to apply formatting
          </p>
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          {/* Headings */}
          {!disableFeatures.headings && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <span className="text-xs font-bold">H1</span>
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <span className="text-xs font-bold">H2</span>
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <span className="text-xs font-bold">H3</span>
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().setParagraph().run()}
                isActive={editor.isActive('paragraph')}
                title="Paragraph"
              >
                <span className="text-xs font-bold">P</span>
              </ToolbarButton>

              <Divider />
            </>
          )}

          {/* Font Size */}
          {!disableFeatures.fontSize && (
            <>
              <div className="relative">
                <ToolbarButton
                  onClick={() => setShowSizePicker(!showSizePicker)}
                  isActive={showSizePicker}
                  title="Font Size"
                >
                  <Type className="w-4 h-4" />
                </ToolbarButton>
                {showSizePicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-50 min-w-[120px]">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Font Size</span>
                      <button
                        onClick={() => setShowSizePicker(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {fontSizes.map((size) => (
                        <button
                          key={size.value}
                          onClick={() => {
                            editor.chain().focus().setFontSize(size.value).run()
                            setShowSizePicker(false)
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                        >
                          {size.label} ({size.value})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Divider />
            </>
          )}

          {/* Text Color */}
          {!disableFeatures.colors && (
            <>
              <div className="relative">
                <ToolbarButton
                  onClick={() => {
                    setShowColorPicker(!showColorPicker)
                    setShowHighlightPicker(false)
                  }}
                  isActive={showColorPicker}
                  title="Text Color"
                >
                  <Palette className="w-4 h-4" />
                </ToolbarButton>
                {showColorPicker && (
                  <div 
                    className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-50 min-w-[240px]"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pick a color</span>
                      <button
                        onClick={() => setShowColorPicker(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Custom Color Input */}
                    <div className="mb-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          onPaste={(e) => {
                            e.stopPropagation()
                            const pastedText = e.clipboardData.getData('text')
                            setCustomColor(pastedText.trim())
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === 'Enter' && /^#[0-9A-Fa-f]{6}$/.test(customColor)) {
                              editor.chain().focus().setColor(customColor).run()
                              saveColorToHistory(customColor)
                              setShowColorPicker(false)
                            }
                          }}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="#3b82f6"
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          autoComplete="off"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
                              editor.chain().focus().setColor(customColor).run()
                              saveColorToHistory(customColor)
                              setShowColorPicker(false)
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Preset Colors */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {textColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            editor.chain().focus().setColor(color.value).run()
                            saveColorToHistory(color.value)
                            setShowColorPicker(false)
                          }}
                          className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>

                    {/* Saved Colors */}
                    {savedColors.length > 0 && (
                      <>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Recently Used</div>
                        <div className="grid grid-cols-5 gap-2 mb-2">
                          {savedColors.map((color, idx) => (
                            <button
                              key={`${color}-${idx}`}
                              onClick={() => {
                                editor.chain().focus().setColor(color).run()
                                setShowColorPicker(false)
                              }}
                              className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Remove Color */}
                    <button
                      onClick={() => {
                        editor.chain().focus().unsetColor().run()
                        setShowColorPicker(false)
                      }}
                      className="w-full mt-2 px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Remove Color
                    </button>
                  </div>
                )}
              </div>

              {/* Highlight Color */}
              <div className="relative">
                <ToolbarButton
                  onClick={() => {
                    setShowHighlightPicker(!showHighlightPicker)
                    setShowColorPicker(false)
                  }}
                  isActive={showHighlightPicker}
                  title="Highlight"
                >
                  <Highlighter className="w-4 h-4" />
                </ToolbarButton>
                {showHighlightPicker && (
                  <div 
                    className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-50 min-w-[240px]"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pick a color</span>
                      <button
                        onClick={() => setShowHighlightPicker(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Custom Highlight Input */}
                    <div className="mb-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={customHighlight}
                          onChange={(e) => setCustomHighlight(e.target.value)}
                          onPaste={(e) => {
                            e.stopPropagation()
                            const pastedText = e.clipboardData.getData('text')
                            setCustomHighlight(pastedText.trim())
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === 'Enter' && /^#[0-9A-Fa-f]{6}$/.test(customHighlight)) {
                              editor.chain().focus().setHighlight({ color: customHighlight }).run()
                              saveHighlightToHistory(customHighlight)
                              setShowHighlightPicker(false)
                            }
                          }}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="#fef3c7"
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          autoComplete="off"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (/^#[0-9A-Fa-f]{6}$/.test(customHighlight)) {
                              editor.chain().focus().setHighlight({ color: customHighlight }).run()
                              saveHighlightToHistory(customHighlight)
                              setShowHighlightPicker(false)
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Preset Highlights */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {highlightColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            editor.chain().focus().setHighlight({ color: color.value }).run()
                            saveHighlightToHistory(color.value)
                            setShowHighlightPicker(false)
                          }}
                          className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>

                    {/* Saved Highlights */}
                    {savedHighlights.length > 0 && (
                      <>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Recently Used</div>
                        <div className="grid grid-cols-5 gap-2 mb-2">
                          {savedHighlights.map((color, idx) => (
                            <button
                              key={`${color}-${idx}`}
                              onClick={() => {
                                editor.chain().focus().setHighlight({ color }).run()
                                setShowHighlightPicker(false)
                              }}
                              className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Remove Highlight */}
                    <button
                      onClick={() => {
                        editor.chain().focus().unsetHighlight().run()
                        setShowHighlightPicker(false)
                      }}
                      className="w-full mt-2 px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Remove Color
                    </button>
                  </div>
                )}
              </div>

              <Divider />
            </>
          )}

          {/* Alignment */}
          {!disableFeatures.alignment && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </ToolbarButton>

              <Divider />
            </>
          )}

          {/* Lists */}
          {!disableFeatures.lists && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>

              <Divider />
            </>
          )}

          {/* Link */}
          {!disableFeatures.links && (
            <>
              <div className="relative">
                <ToolbarButton
                  onClick={() => {
                    setShowLinkDialog(!showLinkDialog)
                    if (!showLinkDialog) {
                      const previousUrl = editor.getAttributes('link').href
                      setLinkUrl(previousUrl || '')
                    }
                  }}
                  isActive={editor.isActive('link') || showLinkDialog}
                  title="Add Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </ToolbarButton>
                {showLinkDialog && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-50 min-w-[280px]">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Insert Link</span>
                      <button
                        onClick={() => setShowLinkDialog(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (linkUrl) {
                            editor.chain().focus().setLink({ href: linkUrl }).run()
                          }
                          setShowLinkDialog(false)
                        }}
                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          editor.chain().focus().unsetLink().run()
                          setLinkUrl('')
                          setShowLinkDialog(false)
                        }}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Divider />
            </>
          )}

          {/* Blockquote & Code */}
          {!disableFeatures.blockquote && (
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
          )}

          {!disableFeatures.code && (
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          )}

          <Divider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor Content */}
      <div
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white overflow-y-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Select text to apply formatting | {editor.storage.characterCount?.characters() || 0} characters
        </p>
      </div>
    </div>
  )
}
