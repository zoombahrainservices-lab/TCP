/**
 * UNIFIED TIPTAP CONTENT RENDERER
 * 
 * This component renders Tiptap content consistently across the entire application.
 * It replaces the need for dangerouslySetInnerHTML and handles both JSON and HTML formats.
 * 
 * Features:
 * - Renders Tiptap JSON content
 * - Backward compatible with HTML strings
 * - Consistent styling via prose classes
 * - Safe HTML sanitization
 * - Support for custom styling
 */

'use client'

import { useMemo } from 'react'
import { extractRenderContent, normalizeContent } from '@/lib/tiptap/storage'
import { processHTMLContent } from '@/lib/utils/htmlDecode'
import type { JSONContent } from '@tiptap/core'

export interface TiptapRendererProps {
  /** Content to render (JSON, HTML, or StoredContent) */
  content: JSONContent | string | any
  /** Additional CSS classes */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
  /** Use prose classes (default: true) */
  prose?: boolean
  /** Custom prose size */
  proseSize?: 'sm' | 'base' | 'lg' | 'xl'
  /** Enable dark mode prose (default: true) */
  darkMode?: boolean
}

/**
 * Unified content renderer for Tiptap content
 * 
 * Usage:
 * ```tsx
 * // Render JSON content
 * <TiptapRenderer content={tiptapJSON} />
 * 
 * // Render HTML content (backward compatible)
 * <TiptapRenderer content="<p>Hello</p>" />
 * 
 * // Custom styling
 * <TiptapRenderer 
 *   content={content} 
 *   className="my-custom-class"
 *   style={{ color: 'red' }}
 * />
 * ```
 */
export default function TiptapRenderer({
  content,
  className = '',
  style,
  prose = true,
  proseSize = 'base',
  darkMode = true,
}: TiptapRendererProps) {
  // Convert content to HTML for rendering
  const htmlContent = useMemo(() => {
    if (!content) return ''

    try {
      // Try to extract HTML using storage utilities
      const html = extractRenderContent(content)
      
      // Process through sanitization pipeline
      const { content: sanitized } = processHTMLContent(html)
      
      return sanitized
    } catch (error) {
      console.error('TiptapRenderer: Failed to render content', error)
      // Fallback: try to render as string
      return String(content || '')
    }
  }, [content])

  // Build prose classes
  const proseClasses = prose
    ? [
        'prose',
        proseSize !== 'base' && `prose-${proseSize}`,
        darkMode && 'dark:prose-invert',
        'max-w-none',
        '[&_p:empty]:h-5 [&_p:empty]:my-0', // Empty paragraph handling
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  // Combine all classes
  const finalClassName = [proseClasses, className].filter(Boolean).join(' ')

  if (!htmlContent) {
    return null
  }

  return (
    <div
      className={finalClassName}
      style={style}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

/**
 * Specialized renderers for common use cases
 */

/** Story/narrative content renderer */
export function StoryRenderer(props: Omit<TiptapRendererProps, 'prose' | 'proseSize'>) {
  return <TiptapRenderer {...props} prose proseSize="lg" />
}

/** Paragraph content renderer */
export function ParagraphRenderer(props: Omit<TiptapRendererProps, 'prose' | 'proseSize'>) {
  return <TiptapRenderer {...props} prose proseSize="base" />
}

/** Quote content renderer */
export function QuoteRenderer(props: Omit<TiptapRendererProps, 'prose' | 'proseSize'>) {
  return <TiptapRenderer {...props} prose proseSize="lg" />
}

/** Callout content renderer */
export function CalloutRenderer(props: Omit<TiptapRendererProps, 'prose' | 'proseSize'>) {
  return <TiptapRenderer {...props} prose proseSize="base" />
}

/** Inline content renderer (no prose) */
export function InlineRenderer(props: Omit<TiptapRendererProps, 'prose'>) {
  return <TiptapRenderer {...props} prose={false} />
}
