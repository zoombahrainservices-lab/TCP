import { NextRequest, NextResponse } from 'next/server'
import { launchBrowser } from '@/lib/reports/launchPuppeteer'
import {
  getAssessmentReportData,
  getUserInfo,
  type AssessmentReportData,
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

function buildAssessmentReportHtml(
  data: AssessmentReportData,
  user: { name: string; email: string; id: string },
  logoDataUri: string,
  includeAnswers: boolean
) {

  const generatedDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const scoreBand =
    data.score <= 14
      ? { level: 'Low Risk', color: '#10b981', desc: 'Minimal signs of digital overload' }
      : data.score <= 24
      ? { level: 'Moderate Risk', color: '#f59e0b', desc: 'Some digital habits need attention' }
      : { level: 'High Risk', color: '#ef4444', desc: 'Significant digital dependency detected' }

  const questionsHtml = data.questions
    .map(
      (q) => `
        <div class="qa">
          <div class="q">
            <span class="q-num">${q.id}.</span>
            <span class="q-text">${escapeHtml(q.question)}</span>
          </div>
          <div class="q-range">
            <span class="range-low">${escapeHtml(q.low)}</span>
            <span class="range-sep">←</span>
            <span class="range-high">${escapeHtml(q.high)}</span>
          </div>
          ${
            includeAnswers
              ? `
          <div class="a-bar">
            <div class="a-bar-bg">
              <div class="a-bar-fill" style="width: ${(q.userResponse / 7) * 100}%"></div>
            </div>
            <span class="a-val">${q.userResponse}/7</span>
          </div>
          `
              : `
          <div class="a-placeholder">
            <div class="a-placeholder-line"></div>
            <div class="a-placeholder-line"></div>
          </div>
          `
          }
        </div>
      `
    )
    .join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Chapter ${data.chapterId} Self-Check Report</title>
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
    .score-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      margin: 16px 0;
    }
    .qa { 
      padding: 16px 0; 
      border-bottom: 1px solid #e2e8f0; 
    }
    .qa:last-child {
      border-bottom: none;
    }
    .q { 
      font-weight: 600; 
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .q-num { 
      color: #64748b;
      flex-shrink: 0;
    }
    .q-text {
      flex: 1;
    }
    .q-range {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      font-size: 10px;
      color: #64748b;
    }
    .range-low, .range-high {
      font-weight: 600;
    }
    .range-sep {
      color: #cbd5e1;
    }
    .a-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }
    .a-bar-bg {
      flex: 1;
      height: 20px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .a-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
      transition: width 0.3s;
    }
    .a-val {
      font-weight: 700;
      color: #0f172a;
      min-width: 30px;
      text-align: right;
    }
    .a-placeholder {
      margin-top: 8px;
    }
    .a-placeholder-line {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      margin: 4px 0;
    }
    .a-placeholder-line:first-child {
      width: 100%;
    }
    .a-placeholder-line:last-child {
      width: 60%;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(data.chapterTitle)} - Self-Check Report</h1>
  <div class="muted">Generated: ${escapeHtml(generatedDate)} • For: ${escapeHtml(user?.name ?? 'User')}</div>

  <div class="card">
    <h2>Assessment Summary</h2>
    <div class="grid">
      <div class="kv">
        <div class="k">Chapter</div>
        <div class="v">${escapeHtml(data.chapterTitle)}</div>
      </div>
      <div class="kv">
        <div class="k">Assessment Type</div>
        <div class="v">${escapeHtml(data.assessmentType)}</div>
      </div>
      <div class="kv">
        <div class="k">User</div>
        <div class="v">${escapeHtml(user?.name ?? 'User')}</div>
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
    ${
      includeAnswers
        ? `
    <div class="score-badge" style="background-color: ${scoreBand.color}20; color: ${scoreBand.color}; border: 2px solid ${scoreBand.color};">
      <span>Score: ${data.score}/${data.maxScore}</span>
      <span style="opacity: 0.5;">•</span>
      <span>${scoreBand.level}</span>
    </div>
    <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">${scoreBand.desc}</p>
    `
        : ''
    }
  </div>

  <h2>${includeAnswers ? 'Your Responses' : 'Questions'}</h2>
  ${questionsHtml}

  ${
    !includeAnswers
      ? `
  <div style="margin-top: 32px; padding: 16px; background: #f1f5f9; border-radius: 8px; text-align: center;">
    <p style="margin: 0; color: #475569; font-size: 11px;">
      This is a blank assessment form. Complete it at your convenience and compare with your digital report.
    </p>
  </div>
  `
      : ''
  }
</body>
</html>`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId: chapterIdParam } = await params
    const chapterId = parseInt(chapterIdParam, 10)
    const searchParams = req.nextUrl.searchParams
    const includeAnswers = searchParams.get('answers') !== 'false'

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 })
    }

    // Fetch data
    const [assessmentResult, userResult] = await Promise.all([
      getAssessmentReportData(chapterId),
      getUserInfo(),
    ])

    if (!assessmentResult.success) {
      const status = assessmentResult.error === 'Not authenticated' ? 401 : 404
      return NextResponse.json({ error: assessmentResult.error }, { status })
    }

    if (!userResult.success) {
      return NextResponse.json({ error: userResult.error }, { status: 401 })
    }

    const data = assessmentResult.data
    const user = userResult.data

    // Get logo
    const logoDataUri = await getLogoDataUri()

    // Build HTML
    const html = buildAssessmentReportHtml(data, user, logoDataUri, includeAnswers)

    // Generate PDF (uses serverless Chromium on Vercel)
    const browser = await launchBrowser()

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'load' })

      const headerTemplate = `
        <div style="width:100%; padding: 10px 40px; font-family: Arial; font-size: 10px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            ${logoDataUri ? `<img src="${logoDataUri}" style="height:24px;" />` : ''}
            <div>
              <div style="font-weight:700; color: #0f172a;">The Communication Protocol</div>
              <div style="color:#64748b;">Self-Check Report</div>
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

      const filename = includeAnswers
        ? `chapter-${chapterId}-assessment-report.pdf`
        : `chapter-${chapterId}-assessment-blank.pdf`

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
    console.error('Error generating assessment PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}
