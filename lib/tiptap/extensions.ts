/**
 * SHARED TIPTAP CONFIGURATION
 * 
 * This file defines the standard Tiptap editor configuration used across
 * the entire admin panel. All rich text editing must use this configuration
 * to ensure consistency.
 * 
 * Extensions included:
 * - Full text formatting (bold, italic, underline, strike)
 * - Headings (H1, H2, H3)
 * - Colors and highlights
 * - Font sizes
 * - Font families (optional)
 * - Text alignment
 * - Lists (bullet, numbered)
 * - Links
 * - Blockquotes
 * - Horizontal rules
 * - Code blocks and inline code
 * - History (undo/redo)
 */

import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import type { Level } from '@tiptap/extension-heading'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import FontFamily from '@tiptap/extension-font-family'

/**
 * Custom Font Size Extension
 * Adds font-size support via textStyle marks
 */
export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

/**
 * Standard Tiptap extensions configuration
 * Use this for ALL rich text editors in the admin panel
 */
export const getTiptapExtensions = (options?: {
  /** Enable link support (default: true) */
  enableLinks?: boolean
  /** Enable font family picker (default: false) */
  enableFontFamily?: boolean
  /** Enable code blocks (default: true) */
  enableCodeBlocks?: boolean
  /** Custom heading levels (default: [1, 2, 3]) */
  headingLevels?: Level[]
  /** Types that support text alignment (default: ['heading', 'paragraph']) */
  alignTypes?: string[]
}) => {
  const {
    enableLinks = true,
    enableFontFamily = false,
    enableCodeBlocks = true,
    headingLevels = [1, 2, 3] as Level[],
    alignTypes = ['heading', 'paragraph'],
  } = options || {}

  const extensions: any[] = [
    // StarterKit includes: Document, Paragraph, Text, Bold, Italic, Strike,
    // Code, History, Dropcursor, Gapcursor, HardBreak, etc.
    StarterKit.configure({
      heading: {
        levels: headingLevels,
      },
      codeBlock: enableCodeBlocks ? {} : false,
      // SPACING FIX: Configure paragraph to preserve empty nodes
      paragraph: {
        HTMLAttributes: {
          class: 'min-h-[1em]', // Ensure empty paragraphs have height
        },
      },
      // Configure marks to allow nesting
      bold: {
        HTMLAttributes: {
          class: 'font-bold',
        },
      },
      italic: {
        HTMLAttributes: {
          class: 'italic',
        },
      },
      strike: {
        HTMLAttributes: {
          class: 'line-through',
        },
      },
      code: {
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono',
        },
      },
    }),

    // Text styling
    TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),
    Highlight.configure({
      multicolor: true,
    }),
    Underline,
    FontSize,

    // Alignment
    TextAlign.configure({
      types: alignTypes,
      alignments: ['left', 'center', 'right', 'justify'],
    }),
  ]

  // Optional: Links
  if (enableLinks) {
    extensions.push(
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      })
    )
  }

  // Optional: Font Family
  if (enableFontFamily) {
    extensions.push(
      FontFamily.configure({
        types: ['textStyle'],
      })
    )
  }

  return extensions
}

/**
 * Preset configurations for common use cases
 */
export const TiptapPresets = {
  /** Full-featured editor with all capabilities */
  full: () => getTiptapExtensions({
    enableLinks: true,
    enableFontFamily: true,
    enableCodeBlocks: true,
    headingLevels: [1, 2, 3],
  }),

  /** Basic editor for simple text with formatting */
  basic: () => getTiptapExtensions({
    enableLinks: false,
    enableFontFamily: false,
    enableCodeBlocks: false,
    headingLevels: [2, 3],
  }),

  /** Story/content editor (headings, colors, no code) */
  content: () => getTiptapExtensions({
    enableLinks: true,
    enableFontFamily: false,
    enableCodeBlocks: false,
    headingLevels: [2, 3],
  }),
}

/**
 * Editor props configuration
 * Standard attributes for consistent editor styling
 */
export const getEditorProps = (minHeight: string = '200px') => ({
  attributes: {
    class: 'prose dark:prose-invert max-w-none focus:outline-none p-4',
    style: `min-height: ${minHeight}`,
  },
})

/**
 * Type declarations for TypeScript
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (fontSize: string) => ReturnType
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType
    }
  }
}
