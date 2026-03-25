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

          {/* Font Size (continued in next message due to length) */}
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
