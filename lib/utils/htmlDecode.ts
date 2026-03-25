/**
 * Utility to detect and decode HTML content from rich text editors.
 * Handles both raw HTML and HTML-entity-encoded strings.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Detects if a string contains HTML content (either raw or entity-encoded)
 */
export function isHTMLContent(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const hasRawHTML = 
    text.includes('<p') || 
    text.includes('<h1') ||
    text.includes('<h2') ||
    text.includes('<h3') ||
    text.includes('<div') ||
    text.includes('<span') || 
    text.includes('<strong') ||
    text.includes('<em') ||
    text.includes('</') || 
    text.includes('style=');
  
  const hasHTMLEntities = 
    text.includes('&lt;') || 
    text.includes('&gt;');
  
  return hasRawHTML || hasHTMLEntities;
}

/**
 * Decodes HTML entities if present, otherwise returns the original content
 */
export function decodeHTML(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  
  // Check if the content has HTML entities
  const hasHTMLEntities = text.includes('&lt;') || text.includes('&gt;');
  
  if (hasHTMLEntities && typeof document !== 'undefined') {
    // Use textarea trick to decode HTML entities safely
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
  
  return text;
}

/**
 * Combined function: detects HTML and decodes if needed.
 * Coerces non-string values so block content from API is always handled.
 * Sanitizes HTML to prevent XSS attacks.
 */
export function processHTMLContent(text: string | null | undefined): {
  isHTML: boolean;
  content: string;
} {
  const str = text != null && typeof text !== 'string' ? String(text) : (text ?? '');
  const isHTML = isHTMLContent(str);
  
  if (isHTML) {
    const decoded = decodeHTML(str);
    // Sanitize HTML to prevent XSS attacks while preserving safe formatting
    // SPACING FIX: Configure DOMPurify to preserve empty elements
    const sanitized = DOMPurify.sanitize(decoded, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'span', 'div', 'ul', 'ol', 'li', 'a', 'blockquote'],
      ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onmouseenter'],
      KEEP_CONTENT: true, // Preserve content even if tag is removed
    });

    // Some environments strip inline style declarations too aggressively.
    // If source had style attributes but sanitized output removed all of them,
    // keep a minimally scrubbed fallback so text colors from the editor survive.
    const sourceHasInlineStyle = /style\s*=/i.test(decoded);
    const sanitizedHasInlineStyle = /style\s*=/i.test(sanitized);

    // Also handle the case where `style="..."` survives, but the actual `color: ...`
    // CSS value is stripped by DOMPurify (seen in some Chapter 1 content).
    const sourceHasColor = /color\s*:/i.test(decoded);
    const sanitizedHasColor = /color\s*:/i.test(sanitized);

    const shouldUseStyleFallback =
      (sourceHasInlineStyle && !sanitizedHasInlineStyle) ||
      (sourceHasColor && !sanitizedHasColor);

    if (shouldUseStyleFallback) {
      const styleSafeFallback = decoded
        // Remove script tags completely
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        // Remove inline event handlers (onClick, onerror, etc.)
        .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
        // Restrict style attributes to only the properties we actually need for editor colors.
        // This keeps it safe while preserving inline `color:` (and optionally background-color / font-size).
        .replace(/style\s*=\s*(['"])([\s\S]*?)\1/gi, (full, quote, styleValue) => {
          const raw = String(styleValue ?? '');
          const parts: string[] = [];

          const colorMatch = raw.match(/color\s*:\s*([^;]+)/i);
          if (colorMatch?.[1]) parts.push(`color: ${colorMatch[1].trim()}`);

          const backgroundColorMatch = raw.match(/background-color\s*:\s*([^;]+)/i);
          if (backgroundColorMatch?.[1]) parts.push(`background-color: ${backgroundColorMatch[1].trim()}`);

          const fontSizeMatch = raw.match(/font-size\s*:\s*([^;]+)/i);
          if (fontSizeMatch?.[1]) parts.push(`font-size: ${fontSizeMatch[1].trim()}`);

          if (parts.length === 0) return '';
          return `style=${quote}${parts.join('; ')};${quote}`;
        });

      return { isHTML: true, content: styleSafeFallback };
    }
    return { isHTML: true, content: sanitized };
  }
  
  return { isHTML: false, content: str };
}
