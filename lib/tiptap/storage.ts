/**
 * TIPTAP JSON STORAGE UTILITIES
 * 
 * This module provides utilities for storing and retrieving Tiptap content
 * in JSON format while maintaining backward compatibility with HTML.
 * 
 * STORAGE FORMAT:
 * - Primary: Tiptap JSON (semantic, lossless, editable)
 * - Fallback: HTML (for backward compatibility)
 * 
 * MIGRATION STRATEGY:
 * - Read: Support both JSON and HTML
 * - Write: Always store JSON (with optional HTML fallback)
 * - Render: Convert JSON to HTML for display
 */

import { generateHTML, generateJSON } from '@tiptap/html'
import { JSONContent } from '@tiptap/core'
import { getTiptapExtensions } from './extensions'

/**
 * Content format types
 */
export type ContentFormat = 'json' | 'html' | 'unknown'

/**
 * Stored content structure
 */
export interface StoredContent {
  /** Tiptap JSON (source of truth) */
  json?: JSONContent
  /** HTML representation (for backward compatibility) */
  html?: string
  /** Format indicator */
  format: ContentFormat
  /** Last updated timestamp */
  updatedAt?: string
}

/**
 * Detect content format
 */
export function detectContentFormat(content: any): ContentFormat {
  if (!content) return 'unknown'

  // Check if it's Tiptap JSON
  if (
    typeof content === 'object' &&
    content.type &&
    (content.type === 'doc' || Array.isArray(content.content))
  ) {
    return 'json'
  }

  // Check if it's HTML string
  if (
    typeof content === 'string' &&
    (content.includes('<') || content.includes('&lt;'))
  ) {
    return 'html'
  }

  return 'unknown'
}

/**
 * Convert HTML to Tiptap JSON
 */
export function htmlToJSON(html: string): JSONContent {
  try {
    const extensions = getTiptapExtensions()
    return generateJSON(html, extensions)
  } catch (error) {
    console.error('Failed to convert HTML to JSON:', error)
    // Return minimal valid document
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: html,
            },
          ],
        },
      ],
    }
  }
}

/**
 * Convert Tiptap JSON to HTML
 */
export function jsonToHTML(json: JSONContent): string {
  try {
    const extensions = getTiptapExtensions()
    return generateHTML(json, extensions)
  } catch (error) {
    console.error('Failed to convert JSON to HTML:', error)
    return ''
  }
}

/**
 * Normalize content to stored format
 * Accepts either HTML or JSON and returns standardized StoredContent
 */
export function normalizeContent(content: any): StoredContent {
  const format = detectContentFormat(content)

  if (format === 'json') {
    return {
      json: content as JSONContent,
      html: jsonToHTML(content as JSONContent),
      format: 'json',
      updatedAt: new Date().toISOString(),
    }
  }

  if (format === 'html') {
    const json = htmlToJSON(content as string)
    return {
      json,
      html: content as string,
      format: 'json', // Upgraded to JSON
      updatedAt: new Date().toISOString(),
    }
  }

  // Plain text fallback
  const text = String(content || '')
  const json: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : [],
      },
    ],
  }

  return {
    json,
    html: jsonToHTML(json),
    format: 'json',
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Extract content for editor
 * Returns JSON for Tiptap editor
 */
export function extractEditorContent(stored: any): JSONContent {
  if (!stored) {
    return {
      type: 'doc',
      content: [],
    }
  }

  // If it's already a StoredContent object with JSON
  if (stored.json) {
    return stored.json
  }

  // If it's raw content, normalize it first
  const normalized = normalizeContent(stored)
  return normalized.json!
}

/**
 * Extract content for rendering
 * Returns HTML for display
 */
export function extractRenderContent(stored: any): string {
  if (!stored) {
    return ''
  }

  // If it's a StoredContent object with HTML
  if (stored.html) {
    return stored.html
  }

  // If it's a StoredContent object with JSON
  if (stored.json) {
    return jsonToHTML(stored.json)
  }

  // If it's raw content, normalize and extract HTML
  const normalized = normalizeContent(stored)
  return normalized.html || ''
}

/**
 * Prepare content for storage
 * Converts editor output to StoredContent
 */
export function prepareForStorage(editorContent: JSONContent | string): StoredContent {
  // If editor returns JSON (preferred)
  if (typeof editorContent === 'object') {
    return {
      json: editorContent,
      html: jsonToHTML(editorContent),
      format: 'json',
      updatedAt: new Date().toISOString(),
    }
  }

  // If editor returns HTML (legacy)
  return normalizeContent(editorContent)
}

/**
 * Migration helper: Upgrade HTML content to JSON
 * Use this for batch migrations of existing content
 */
export function upgradeToJSON(htmlContent: string): StoredContent {
  return normalizeContent(htmlContent)
}

/**
 * Backward compatibility: Extract plain HTML
 * For systems that only accept HTML strings
 */
export function toHTMLString(content: StoredContent | JSONContent | string): string {
  if (typeof content === 'string') {
    return content
  }

  if ('html' in content && content.html) {
    return content.html
  }

  if ('json' in content && content.json) {
    return jsonToHTML(content.json)
  }

  // Assume it's JSONContent
  return jsonToHTML(content as JSONContent)
}

/**
 * Type guard: Check if content is StoredContent
 */
export function isStoredContent(content: any): content is StoredContent {
  return (
    content &&
    typeof content === 'object' &&
    ('json' in content || 'html' in content) &&
    'format' in content
  )
}
