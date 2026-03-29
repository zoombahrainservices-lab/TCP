'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { Bold, Italic, Underline as UnderlineIcon, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getTiptapExtensions, FontSize } from '@/lib/tiptap/extensions'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
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
  { value: '#6b7280', label: 'Gray' },
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

// NOTE: FontSize extension is now imported from shared config
// This ensures consistency across all editors

export default function RichTextEditor({ 
  content, 
  onChange, 
  minHeight = '200px'
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSizePicker, setShowSizePicker] = useState(false)
  const [customColor, setCustomColor] = useState('#000000')
  const [customFontSize, setCustomFontSize] = useState('16px')
  const [hasSelection, setHasSelection] = useState(false)
  const [savedColors, setSavedColors] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tiptap-saved-colors')
      if (saved) {
        try {
          setSavedColors(JSON.parse(saved))
        } catch {
          // ignore invalid JSON
        }
      }
    }
  }, [])

  const saveColorToHistory = (color: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return
    const updated = [color, ...savedColors.filter(c => c !== color)].slice(0, 8)
    setSavedColors(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tiptap-saved-colors', JSON.stringify(updated))
    }
  }

  // Use shared Tiptap configuration for consistency
  const extensions = getTiptapExtensions({
    enableLinks: false,
    enableFontFamily: false,
    enableCodeBlocks: false,
    headingLevels: [2, 3],
  })

  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      setHasSelection(from !== to)
    },
  editorProps: {
    attributes: {
      class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[' + minHeight + '] p-4',
    },
  },
  // Avoid SSR/hydration mismatch warnings in Next.js
  immediatelyRender: false,
  // SPACING FIX: Preserve empty paragraph blocks
  onCreate: ({ editor }) => {
    // Log editor state for debugging
    console.log('[RichTextEditor] Editor created with content:', editor.getHTML().substring(0, 200))
  },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const setColor = (color: string) => {
    if (!editor.state.selection.empty) {
      editor.chain().focus().setColor(color).run()
      setCustomColor(color)
      saveColorToHistory(color)
    }
  }

  const applyColorAndClose = (color: string) => {
    if (!editor.state.selection.empty) {
      editor.chain().focus().setColor(color).run()
      setCustomColor(color)
      saveColorToHistory(color)
      setShowColorPicker(false)
    }
  }

  const setFontSize = (size: string) => {
    if (!editor.state.selection.empty) {
      editor.chain().focus().setFontSize(size).run()
      setCustomFontSize(size)
      // Don't close picker automatically
    }
  }

  const applyFontSizeAndClose = (size: string) => {
    if (!editor.state.selection.empty) {
      editor.chain().focus().setFontSize(size).run()
      setCustomFontSize(size)
      setShowSizePicker(false)
    }
  }

  const currentTextColor = (editor.getAttributes('textStyle').color as string) || ''
  const currentFontSize = (editor.getAttributes('textStyle').fontSize as string) || ''

  const colorSwatch = currentTextColor || customColor || '#000000'
  const selectedSizeLabel =
    fontSizes.find((size) => size.value === currentFontSize)?.label ||
    currentFontSize ||
    customFontSize ||
    'Default'

  return (
    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
      {/* Sticky formatting bar: stays visible while scrolling the admin content column */}
      <div className="sticky top-0 z-20 rounded-t-lg bg-white dark:bg-gray-800">
        {/* Selection Warning */}
        {!hasSelection && (showColorPicker || showSizePicker) && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
              ⚠️ Select text first to apply color or size
            </p>
          </div>
        )}
        {/* Toolbar */}
        <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 flex flex-wrap items-center gap-1 shadow-sm">
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={() => {
            editor.chain().focus().toggleBold().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={() => {
            editor.chain().focus().toggleItalic().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={() => {
            editor.chain().focus().toggleUnderline().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('underline') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Font Size Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSizePicker(!showSizePicker)
              setShowColorPicker(false)
            }}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            title="Font Size"
          >
            <Type className="w-4 h-4" />
            <span className="text-xs">{selectedSizeLabel}</span>
          </button>
          
          {showSizePicker && (
            <div 
              className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-10 min-w-[180px]"
            >
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setFontSize(size.value)}
                  disabled={!hasSelection}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentFontSize === size.value ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200' : ''
                  }`}
                  style={{ fontSize: size.value }}
                >
                  {size.label} ({size.value})
                </button>
              ))}
              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom size
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customFontSize}
                    onChange={(e) => setCustomFontSize(e.target.value)}
                    onPaste={(e) => {
                      e.stopPropagation()
                      const pastedText = e.clipboardData.getData('text')
                      setCustomFontSize(pastedText.trim())
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter' && hasSelection) {
                        applyFontSizeAndClose(customFontSize)
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="e.g. 22px"
                    className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFontSizeAndClose(customFontSize)}
                    disabled={!hasSelection}
                    className="px-2 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus().unsetFontSize().run()
                      setShowSizePicker(false)
                    }}
                    className="flex-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Remove Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSizePicker(false)}
                    className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker)
              setShowSizePicker(false)
            }}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            title="Text Color"
          >
            <span
              className="inline-block h-4 w-4 rounded border border-gray-400 dark:border-gray-500"
              style={{ backgroundColor: colorSwatch }}
            />
            <span className="text-xs">Color</span>
          </button>
          
          {showColorPicker && (
            <div 
              className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-10 min-w-[200px]"
            >
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pick a color
              </label>
              <input
                type="color"
                value={colorSwatch}
                onInput={(e) => setColor(e.currentTarget.value)}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 mb-2"
                title="Pick text color"
              />
              <div className="flex items-center gap-2 mb-2">
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
                    if (e.key === 'Enter' && hasSelection) {
                      applyColorAndClose(customColor)
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyColorAndClose(customColor)}
                  disabled={!hasSelection}
                  className="px-2 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setColor(color.value)}
                    disabled={!hasSelection}
                    className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentTextColor?.toLowerCase() === color.value.toLowerCase()
                        ? 'border-blue-500 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  >
                    {color.value === '#ffffff' && (
                      <div className="w-full h-full border border-gray-300"></div>
                    )}
                  </button>
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
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setColor(color)}
                        disabled={!hasSelection}
                        className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor.chain().focus().unsetColor().run()
                    setShowColorPicker(false)
                  }}
                  className="flex-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Remove Color
                </button>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Heading Levels */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }}
          className={`px-3 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }}
          className={`px-3 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={() => {
            editor.chain().focus().setParagraph().run()
          }}
          className={`px-3 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('paragraph') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
          }`}
        >
          P
        </button>
        </div>
      </div>

      {/* Editor */}
      <div 
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white overflow-y-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Helper text */}
      <div className="border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: <strong>Select text first</strong>, then apply color, size, or style. Changes appear instantly in the editor.
        </p>
      </div>
    </div>
  )
}
