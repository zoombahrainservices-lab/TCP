# Testing Report API Endpoint

## Quick Test

Open your browser dev tools and run this in the console while logged in:

```javascript
// Test Chapter 1 report with answers
fetch('/api/reports/chapter/1?answers=true')
  .then(r => r.blob())
  .then(blob => {
    console.log('PDF size:', blob.size, 'bytes')
    // Check if it's actually a PDF
    if (blob.size < 5000) {
      console.warn('⚠️ PDF is suspiciously small - likely missing data')
    }
  })

// Or test with JSON to see the actual data being fetched
fetch('/api/admin/pages/test-chapter-1-data')
```

## Test the server actions directly

Let me create a test endpoint to debug.
