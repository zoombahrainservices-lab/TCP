import { NextRequest, NextResponse } from 'next/server'
import { launchBrowser } from '@/lib/reports/launchPuppeteer'
import {
  getResolutionReportData,
  getUserInfo,
  type ResolutionReportData,
} from '@/app/actions/reports'
import fs from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function getLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'TCP-logo.png')
    const logoBuffer = await fs.readFile(logoPath)
    const base64 = logoBuffer.toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('Error loading logo:', error)
    return ''
  }
}

function buildResolutionReportHtml(
  data: ResolutionReportData,
  user: { name: string; email: string; id: string },
  logoDataUri: string
) {

  const generatedDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const proofsHtml = data.proofs
    .map(
      (proof, idx) => `
        <div class="proof-card">
          <div class="proof-header">
            <div class="proof-badge">${escapeHtml(proof.type.toUpperCase())}</div>
            <div class="proof-date">${new Date(proof.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}</div>
          </div>
          ${proof.title ? `<h3 class="proof-title">${escapeHtml(proof.title)}</h3>` : ''}
          ${
            proof.notes
              ? `<div class="proof-content">${escapeHtml(proof.notes)
                  .split('\n')
                  .map((line) => `<p>${line || '&nbsp;'}</p>`)
                  .join('')}</div>`
              : '<div class="proof-placeholder">No text content provided</div>'
          }
          ${
            proof.storagePath
              ? `<div class="proof-meta">📎 File: ${escapeHtml(proof.storagePath.split('/').pop() || 'attachment')}</div>`
              : ''
          }
        </div>
      `
    )
    .join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Chapter ${data.chapterId} Resolution Report</title>
  <style>
    @page { margin: 110px 40px 80px 40px; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      color: #1e293b; 
      font-size: 12px; 
      line-height: 1.6;
    }
    h1 { 
      font-size: 24px; 
      margin: 0 0 8px 0; 
      font-weight: 700;
      color: #0f172a;
    }
    h2 { 
      font-size: 16px; 
      margin: 24px 0 12px 0; 
      font-weight: 600;
      color: #334155;
    }
    h3 {
      font-size: 14px;
      margin: 8px 0;
      font-weight: 600;
      color: #0f172a;
    }
    .muted { 
      color: #64748b; 
      font-size: 11px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      background: #f8fafc;
    }
    .grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 12px 20px; 
    }
    .kv { 
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .k { 
      color: #64748b; 
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .v { 
      font-weight: 600;
      color: #0f172a;
    }
    .identity-statement {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      font-size: 14px;
      line-height: 1.8;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .proof-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin: 12px 0;
      background: white;
      page-break-inside: avoid;
    }
    .proof-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .proof-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #3b82f6;
      color: white;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .proof-date {
      font-size: 10px;
      color: #64748b;
    }
    .proof-title {
      margin: 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    .proof-content {
      margin: 12px 0;
      color: #334155;
      white-space: pre-wrap;
    }
    .proof-content p {
      margin: 4px 0;
    }
    .proof-placeholder {
      color: #94a3b8;
      font-style: italic;
      font-size: 11px;
    }
    .proof-meta {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(data.chapterTitle)} - Resolution Report</h1>
  <div class="muted">Generated: ${escapeHtml(generatedDate)} • For: ${escapeHtml(user?.name ?? 'User')}</div>

  <div class="card">
    <h2>Summary</h2>
    <div class="grid">
      <div class="kv">
        <div class="k">Chapter</div>
        <div class="v">${escapeHtml(data.chapterTitle)}</div>
      </div>
      <div class="kv">
        <div class="k">User</div>
        <div class="v">${escapeHtml(user?.name ?? 'User')}</div>
      </div>
      <div class="kv">
        <div class="k">Email</div>
        <div class="v">${escapeHtml(user?.email ?? '')}</div>
      </div>
      <div class="kv">
        <div class="k">Completed</div>
        <div class="v">${new Date(data.completedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</div>
      </div>
    </div>
  </div>

  ${
    data.identityResolution
      ? `
  <h2>Identity Resolution</h2>
  <div class="identity-statement">
    ${escapeHtml(data.identityResolution)}
  </div>
  `
      : ''
  }

  <h2>Proofs (${data.proofs.length})</h2>
  ${
    data.proofs.length > 0
      ? proofsHtml
      : '<div class="card"><p class="muted">No proofs submitted yet.</p></div>'
  }

  <div style="margin-top: 32px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
    <p style="margin: 0; color: #475569; font-size: 11px; text-align: center;">
      This report captures your identity statement and proof submissions for ${escapeHtml(data.chapterTitle)}.
    </p>
  </div>
</body>
</html>`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId: chapterIdParam } = await params
    const chapterId = parseInt(chapterIdParam, 10)

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 })
    }

    // Fetch data
    const [resolutionResult, userResult] = await Promise.all([
      getResolutionReportData(chapterId),
      getUserInfo(),
    ])

    if (!resolutionResult.success) {
      const status = resolutionResult.error === 'Not authenticated' ? 401 : 404
      return NextResponse.json({ error: resolutionResult.error }, { status })
    }

    if (!userResult.success) {
      return NextResponse.json({ error: userResult.error }, { status: 401 })
    }

    const data = resolutionResult.data
    const user = userResult.data

    // Get logo
    const logoDataUri = await getLogoDataUri()

    // Build HTML
    const html = buildResolutionReportHtml(data, user, logoDataUri)

    // Generate PDF (uses serverless Chromium on Vercel)
    const browser = await launchBrowser()

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const headerTemplate = `
        <div style="width:100%; padding: 10px 40px; font-family: Arial; font-size: 10px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            ${logoDataUri ? `<img src="${logoDataUri}" style="height:24px;" />` : ''}
            <div>
              <div style="font-weight:700; color: #0f172a;">The Communication Protocol</div>
              <div style="color:#64748b;">Resolution Report</div>
            </div>
          </div>
          <div style="color:#64748b;">${new Date().toLocaleDateString()}</div>
        </div>
      `

      const footerTemplate = `
        <div style="width:100%; padding: 10px 40px; font-family: Arial; font-size: 10px; color:#64748b; display:flex; justify-content:space-between;">
          <div>The Communication Protocol</div>
          <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
      `

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: { top: '110px', right: '40px', bottom: '80px', left: '40px' },
      })

      const filename = `chapter-${chapterId}-resolution-report.pdf`

      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      })
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Error generating resolution PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}
