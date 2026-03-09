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
    const sanitized = DOMPurify.sanitize(decoded, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'span', 'div', 'ul', 'ol', 'li', 'a', 'blockquote'],
      ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel'],
    });
    return { isHTML: true, content: sanitized };
  }
  
  return { isHTML: false, content: str };
}
