/**
 * Decodes HTML entities in text content
 * Handles content from TipTap editor that may be HTML-entity-encoded
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  
  // Check if text contains HTML entities
  if (!text.includes('&lt;') && !text.includes('&gt;') && !text.includes('&quot;') && !text.includes('&#')) {
    return text;
  }
  
  // Decode common HTML entities
  // Must decode &amp; last to avoid double-decoding
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}
