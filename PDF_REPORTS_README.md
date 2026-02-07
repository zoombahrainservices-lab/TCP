# PDF Reports System - Documentation

## Overview

The PDF Reports system allows users to download comprehensive, professionally formatted PDF reports for each chapter. The system includes:

1. **Self-Check Assessment Reports** (with or without answers)
2. **Resolution Reports** (identity statements + proof submissions)

---

## Features

### ✅ What's Included

- **Assessment Reports**:
  - User's responses with visual progress bars
  - Score calculation and risk band analysis (Low/Moderate/High Risk)
  - Blank version for offline completion
  - Question scales (low → high labels)

- **Resolution Reports**:
  - Identity statement (from "Personal Identity Resolution")
  - All proof submissions (text, image, audio, video)
  - Timestamps and metadata

- **Professional PDF Design**:
  - Header with logo on every page
  - Footer with page numbers
  - Modern, clean typography
  - Color-coded sections
  - Responsive layouts

---

## File Structure

```
tcp-platform/
├── app/
│   ├── actions/
│   │   └── reports.ts                    # Server actions for fetching report data
│   ├── api/
│   │   └── reports/
│   │       └── chapter/
│   │           └── [chapterId]/
│   │               ├── assessment/
│   │               │   └── route.ts      # Assessment PDF generation
│   │               └── resolution/
│   │                   └── route.ts      # Resolution PDF generation
│   └── reports/
│       └── page.tsx                      # Reports listing page
├── components/
│   └── dashboard/
│       └── cards/
│           ├── ChapterReportsCard.tsx    # Updated with "View All" button
│           └── ReportsCard.tsx           # Updated with PDF download button
└── public/
    └── TCP-logo.png                      # Logo embedded in PDFs
```

---

## API Routes

### 1. Assessment Report

**Endpoint**: `/api/reports/chapter/[chapterId]/assessment`

**Query Parameters**:
- `answers` (optional, default: `true`)
  - `true`: Include user responses and scores
  - `false`: Generate blank form for printing

**Example**:
```
/api/reports/chapter/1/assessment?answers=true  → Full report with answers
/api/reports/chapter/1/assessment?answers=false → Blank assessment form
```

**Response**: PDF file download

---

### 2. Resolution Report

**Endpoint**: `/api/reports/chapter/[chapterId]/resolution`

**Example**:
```
/api/reports/chapter/1/resolution
```

**Response**: PDF file download with identity statement and proofs

---

## Server Actions

Located in: `app/actions/reports.ts`

### `getAssessmentReportData(chapterId: number)`

Fetches assessment data from the database:
- Latest assessment for the chapter
- User responses mapped to questions
- Score and completion date

**Returns**:
```typescript
{
  success: true,
  data: {
    chapterId: number
    chapterTitle: string
    assessmentType: string
    score: number
    maxScore: number
    completedAt: string
    questions: Array<{
      id: number
      question: string
      low: string
      high: string
      userResponse: number
    }>
  }
}
```

---

### `getResolutionReportData(chapterId: number)`

Fetches resolution data:
- Identity resolution artifact (latest)
- All proof artifacts

**Returns**:
```typescript
{
  success: true,
  data: {
    chapterId: number
    chapterTitle: string
    completedAt: string
    identityResolution?: string
    proofs: Array<{
      type: 'text' | 'image' | 'audio' | 'video'
      title: string
      notes: string
      storagePath?: string
      createdAt: string
    }>
  }
}
```

---

### `getUserInfo()`

Fetches current user information:

**Returns**:
```typescript
{
  success: true,
  data: {
    id: string
    name: string
    email: string
  }
}
```

---

## Reports Page

**Route**: `/reports`

**Features**:
- Lists all chapters with their report availability
- Download buttons for each report type
- Loading states during PDF generation
- Locked state for incomplete chapters
- Dark mode support

**User Flow**:
1. User navigates to `/reports`
2. Sees list of completed chapters
3. Clicks download button for desired report
4. PDF is generated server-side and downloaded

---

## Dashboard Integration

### ChapterReportsCard
- Added "View All" button (top-right)
- Added "Download PDF Reports →" link (bottom)
- Both link to `/reports` page

### ReportsCard
- Added "Download PDF Reports" button (bottom)
- Purple-to-blue gradient styling
- Links to `/reports` page

---

## Database Schema

The system reads from these tables:

### `assessments`
```sql
- id (bigserial)
- user_id (uuid)
- chapter_id (integer)
- kind (text) -- 'baseline', etc.
- responses (jsonb) -- { "1": 3, "2": 4, ... }
- score (integer)
- created_at (timestamptz)
```

### `artifacts`
```sql
- id (bigserial)
- user_id (uuid)
- chapter_id (integer)
- type (text) -- 'identity_resolution', 'proof', etc.
- data (jsonb) -- Flexible data storage
- created_at (timestamptz)
```

**Identity Resolution artifact example**:
```json
{
  "identity": "My focus is becoming a better developer..."
}
```

**Proof artifact example**:
```json
{
  "type": "text",
  "title": "Morning Routine Success",
  "notes": "Today I successfully completed...",
  "storage_path": "optional/path/to/file"
}
```

---

## PDF Generation (Puppeteer)

### How It Works

1. **HTML Template Generation**
   - Server actions fetch data from database
   - HTML is built using template literals
   - Styled with embedded CSS

2. **Puppeteer Rendering**
   - Launches headless Chrome
   - Loads HTML content
   - Generates PDF with custom headers/footers

3. **Logo Embedding**
   - Logo is read from `public/TCP-logo.png`
   - Converted to Base64 data URI
   - Embedded directly in HTML (no external requests)

4. **Response**
   - PDF buffer sent as download
   - Proper Content-Disposition headers
   - Automatic filename

### Puppeteer Configuration

```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
})
```

**Important**: These args are required for deployment (especially serverless).

---

## Deployment Considerations

### Puppeteer on Vercel/Serverless

If deploying to **Vercel** or other serverless platforms, Puppeteer can be problematic due to:
- Large Chrome binary size
- Cold start times
- Memory limits

**Alternative Solutions**:

1. **Use `@sparticuz/chromium`** (recommended for Vercel):
   ```bash
   npm install @sparticuz/chromium puppeteer-core
   ```
   
   Then update your imports:
   ```typescript
   import chromium from '@sparticuz/chromium'
   import puppeteer from 'puppeteer-core'
   
   const browser = await puppeteer.launch({
     args: chromium.args,
     executablePath: await chromium.executablePath(),
     headless: chromium.headless,
   })
   ```

2. **Use Playwright** (also serverless-friendly):
   ```bash
   npm install playwright-core playwright-aws-lambda
   ```

3. **Use a PDF generation service** (API-based):
   - [PDFShift](https://pdfshift.io/)
   - [DocRaptor](https://docraptor.com/)
   - [HTML2PDF.app](https://html2pdf.app/)

---

## Adding New Chapters

To add PDF reports for additional chapters:

1. **Update `app/reports/page.tsx`**:
   ```typescript
   const chapters: ChapterReport[] = [
     {
       chapterId: 1,
       title: 'From Stage Star to Silent Struggles',
       status: 'available',
       assessmentAvailable: true,
       resolutionAvailable: true,
     },
     {
       chapterId: 2,
       title: 'Your Chapter 2 Title',
       status: 'available', // or 'locked'
       assessmentAvailable: true,
       resolutionAvailable: true,
     },
   ]
   ```

2. **Update `app/actions/reports.ts`**:
   - Add chapter title mapping in `getAssessmentReportData()`:
     ```typescript
     const chapterTitles = {
       1: 'Chapter 1: From Stage Star to Silent Struggles',
       2: 'Chapter 2: Your Title Here',
     }
     ```
   - Same for `getResolutionReportData()`

3. **Define questions** (if assessment structure differs):
   - Update the `questions` array in `getAssessmentReportData()`

---

## Customization

### Styling PDFs

Edit the `<style>` blocks in:
- `app/api/reports/chapter/[chapterId]/assessment/route.ts`
- `app/api/reports/chapter/[chapterId]/resolution/route.ts`

**Key classes**:
- `.card` - Rounded card containers
- `.qa` - Question-answer blocks
- `.a-bar` - Progress bar for responses
- `.proof-card` - Individual proof containers
- `.identity-statement` - Purple gradient box for identity

### Headers & Footers

Modify the `headerTemplate` and `footerTemplate` strings:
```typescript
const headerTemplate = `
  <div style="...">
    <!-- Your custom header -->
  </div>
`
```

---

## Testing

### Local Testing

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to reports**:
   - Go to `http://localhost:3000/reports`
   - Click download buttons
   - PDFs should download automatically

3. **Test different scenarios**:
   - With/without answers (assessment)
   - Chapters with no data (should show error or placeholder)
   - Dark mode (Reports page UI)

### API Testing

Use browser or curl:
```bash
# Assessment with answers
curl -OJ "http://localhost:3000/api/reports/chapter/1/assessment?answers=true"

# Assessment blank
curl -OJ "http://localhost:3000/api/reports/chapter/1/assessment?answers=false"

# Resolution
curl -OJ "http://localhost:3000/api/reports/chapter/1/resolution"
```

---

## Troubleshooting

### "No assessment found"
- User hasn't completed the self-check yet
- Check `assessments` table in Supabase

### "Failed to generate PDF"
- Check server logs for Puppeteer errors
- Ensure logo file exists at `public/TCP-logo.png`
- Check memory limits (especially on serverless)

### Blank PDF or missing content
- Verify HTML template is rendering correctly
- Check `waitUntil: 'networkidle0'` option
- Ensure all data URIs are valid

### Puppeteer launch errors
- Add more args: `'--disable-gpu'`, `'--single-process'`
- Increase timeout: `await page.goto(url, { timeout: 60000 })`
- Check Chrome binary installation

---

## Performance Optimization

1. **Caching**:
   - Consider caching generated PDFs (by user + chapter + timestamp)
   - Store in Supabase Storage or CDN

2. **Background generation**:
   - Generate PDFs asynchronously
   - Email download link to user

3. **Reduce PDF size**:
   - Compress images before embedding
   - Use web fonts instead of embedding font files

---

## Security

- ✅ **Authentication required**: Server actions check `auth.uid()`
- ✅ **RLS policies**: Users can only access their own data
- ✅ **No direct file access**: PDFs generated on-demand
- ✅ **Input validation**: Chapter IDs validated as integers
- ✅ **HTML escaping**: All user input escaped in templates

---

## Future Enhancements

- [ ] Email PDF reports directly
- [ ] Batch download (all chapters as ZIP)
- [ ] Print-optimized layouts
- [ ] Comparison reports (show progress over time)
- [ ] Export to Word/CSV formats
- [ ] Schedule automated weekly reports

---

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify database migrations are up to date
3. Ensure `puppeteer` is installed correctly
4. Review Supabase RLS policies

---

## License

This PDF Reports system is part of The Communication Protocol platform.
