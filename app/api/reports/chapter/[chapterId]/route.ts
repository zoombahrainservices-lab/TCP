import { NextRequest, NextResponse } from 'next/server'
import { launchBrowser } from '@/lib/reports/launchPuppeteer'
import { getAssessmentReportData, getResolutionReportData, getUserInfo } from '@/app/actions/reports'
import { getAssessmentConfig, type AssessmentConfig } from '@/lib/reports/assessmentConfig'
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

function buildCombinedReportHtml(
  assessmentData: any,
  resolutionData: any,
  user: { name: string; email: string; id: string },
  logoDataUri: string,
  includeAnswers: boolean,
  assessmentConfig?: AssessmentConfig
) {
  const generatedDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const hasAssessment = !!assessmentData
  const showAnswerBars = includeAnswers && hasAssessment

  const scoreBand = hasAssessment
    ? (() => {
        const max = Math.max(assessmentData.maxScore || 1, 1)
        const pct = ((assessmentData.score || 0) / max) * 100
        if (pct <= 33) return { level: 'Low Risk', color: '#10b981', desc: 'Minimal signs of digital overload' }
        if (pct <= 66) return { level: 'Moderate Risk', color: '#f59e0b', desc: 'Some digital habits need attention' }
        return { level: 'High Risk', color: '#ef4444', desc: 'Significant digital dependency detected' }
      })()
    : null

  // Self-Check Questions HTML
  const questionsSource =
    (hasAssessment && assessmentData?.questions) ||
    assessmentConfig?.questions ||
    []

  const questionsHtml = questionsSource.length
    ? questionsSource
        .map(
          (q: any) => `
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
            showAnswerBars
              ? `
          <div class="a-bar">
            <div class="a-bar-bg">
              <div class="a-bar-fill" style="width: ${(q.userResponse / Math.max(q.maxValue || 1, 1)) * 100}%"></div>
            </div>
            <span class="a-val">${q.responseLabel ? escapeHtml(String(q.responseLabel)) : `${q.userResponse}/${q.maxValue || 7}`}</span>
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
    : '<p class="text-muted">No self-check questions configured for this chapter.</p>'

  // Resolution Proofs HTML
  const proofsHtml = resolutionData?.proofs?.length
    ? resolutionData.proofs
        .map(
          (proof: any, idx: number) => `
        <div class="proof-item">
          <div class="proof-header">
            <span class="proof-num">${idx + 1}</span>
            <div>
              <div class="proof-title">${escapeHtml(proof.title || 'Untitled Proof')}</div>
              <div class="proof-meta">${escapeHtml(proof.type)} • ${new Date(proof.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          ${proof.notes ? `<div class="proof-notes">${escapeHtml(proof.notes)}</div>` : ''}
        </div>
      `
        )
        .join('')
    : '<p class="text-muted">No proof submissions yet.</p>'

  // Your Turn HTML (Framework, Techniques, Follow-Through)
  // ALWAYS show sections - if no answers, show questions or empty state
  function buildYourTurnHtml(
    category: string, 
    items: any[], 
    categoryKey: string,
    availableQuestions?: Array<{ id: string; label: string }>
  ): string {
    const categoryEmojis: Record<string, string> = {
      framework: '🎯',
      techniques: '⚡',
      followthrough: '🚀'
    }
    
    const emoji = categoryEmojis[categoryKey] || '📝'
    
    // If has answers, show them
    if (items?.length > 0) {
      return `
    <div class="your-turn-section">
      <h3>${emoji} ${escapeHtml(category)}</h3>
      ${items
        .map(
          (item: any, idx: number) => `
        <div class="your-turn-item">
          ${item.promptText ? `
          <div class="your-turn-prompt">
            <span style="font-weight: 700; color: #10b981; margin-right: 8px;">${idx + 1}.</span>
            ${escapeHtml(item.promptText)}
          </div>
          ` : `
          <div class="your-turn-prompt" style="color: #64748b; font-style: italic;">
            <span style="font-weight: 700; color: #10b981; margin-right: 8px;">${idx + 1}.</span>
            Your Response:
          </div>
          `}
          <div class="your-turn-response">${escapeHtml(item.responseText)}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
    }
    
    // If no answers BUT has questions, show questions without answers
    if (availableQuestions && availableQuestions.length > 0) {
      return `
    <div class="your-turn-section">
      <h3>${emoji} ${escapeHtml(category)}</h3>
      <p style="color: #64748b; font-style: italic; margin: 8px 0 16px 0; font-size: 11px;">
        Questions available but not yet answered. Complete this section to see your responses here.
      </p>
      ${availableQuestions
        .map(
          (q, idx) => `
        <div class="your-turn-item" style="background: #fafafa; border-left-color: #cbd5e1;">
          <div class="your-turn-prompt" style="color: #475569;">
            <span style="font-weight: 700; color: #94a3b8; margin-right: 8px;">${idx + 1}.</span>
            ${escapeHtml(q.label)}
          </div>
          <div class="your-turn-response" style="background: #f8f8f8; color: #94a3b8; font-style: italic; min-height: 40px; display: flex; align-items: center;">
            Not answered yet
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    `
    }
    
    // For Techniques/Follow-Through, hide the section entirely when empty.
    if (categoryKey === 'techniques' || categoryKey === 'followthrough') {
      return ''
    }

    // If no answers AND no questions, show empty state (Framework only)
    return `
    <div class="your-turn-section">
      <h3>${emoji} ${escapeHtml(category)}</h3>
      <div class="your-turn-item" style="background: #f8fafc; border-left-color: #cbd5e1;">
        <p style="color: #64748b; font-style: italic; margin: 0;">
          No questions or responses recorded for this section yet.
        </p>
      </div>
    </div>
    `
  }

  // Always generate all three sections
  const frameworkHtml = buildYourTurnHtml(
    'Framework Reflections', 
    resolutionData?.yourTurnByCategory?.framework ?? [], 
    'framework',
    resolutionData?.availableQuestions?.framework
  )
  const techniquesHtml = buildYourTurnHtml(
    'Technique Applications', 
    resolutionData?.yourTurnByCategory?.techniques ?? [], 
    'techniques',
    resolutionData?.availableQuestions?.techniques
  )
  const followThroughHtml = buildYourTurnHtml(
    'Follow-Through Commitments', 
    resolutionData?.yourTurnByCategory?.followThrough ?? [], 
    'followthrough',
    resolutionData?.availableQuestions?.followThrough
  )
  
  // Always include all three sections (no longer check if empty)
  const yourTurnHtml = `${frameworkHtml}${techniquesHtml}${followThroughHtml}`

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Chapter ${assessmentData?.chapterId || resolutionData?.chapterId} - Complete Report</title>
  <style>
    @page { margin: 110px 40px 80px 40px; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      color: #1e293b; 
      line-height: 1.6; 
      font-size: 11px;
    }
    .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0f172a; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; color: #0f172a; }
    h2 { font-size: 16px; font-weight: 700; margin: 32px 0 16px 0; color: #0f172a; page-break-after: avoid; }
    h3 { font-size: 14px; font-weight: 600; margin: 24px 0 12px 0; color: #334155; }
    .muted { color: #64748b; font-size: 10px; }
    .text-muted { color: #94a3b8; font-style: italic; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
    .kv { display: flex; flex-direction: column; gap: 4px; }
    .k { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .v { font-size: 12px; font-weight: 600; color: #0f172a; }
    .score-badge { 
      display: inline-flex; gap: 8px; align-items: center; padding: 12px 16px; 
      border-radius: 8px; font-weight: 700; font-size: 14px; margin: 16px 0;
    }
    
    /* Self-Check Styles */
    .qa { margin-bottom: 20px; padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #3b82f6; page-break-inside: avoid; }
    .q { display: flex; gap: 8px; margin-bottom: 6px; }
    .q-num { font-weight: 700; color: #3b82f6; min-width: 24px; }
    .q-text { font-weight: 600; color: #1e293b; }
    .q-range { display: flex; align-items: center; gap: 6px; margin: 6px 0 6px 32px; font-size: 10px; color: #64748b; }
    .range-low, .range-high { font-style: italic; }
    .range-sep { color: #cbd5e1; }
    .a-bar { display: flex; align-items: center; gap: 12px; margin: 8px 0 0 32px; }
    .a-bar-bg { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .a-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); }
    .a-val { font-weight: 700; color: #3b82f6; min-width: 32px; text-align: right; }
    .a-placeholder { margin: 8px 0 0 32px; }
    .a-placeholder-line { height: 8px; background: #f1f5f9; border-radius: 4px; margin-bottom: 4px; }
    
    /* Resolution Styles */
    .proof-item { margin-bottom: 16px; padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #9333ea; page-break-inside: avoid; }
    .proof-header { display: flex; gap: 12px; align-items: start; margin-bottom: 8px; }
    .proof-num { 
      min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      background: #9333ea; color: white; border-radius: 6px; font-weight: 700; font-size: 14px;
    }
    .proof-title { font-weight: 600; color: #0f172a; margin-bottom: 4px; }
    .proof-meta { font-size: 10px; color: #64748b; }
    .proof-notes { margin-top: 8px; padding: 8px; background: #faf5ff; border-radius: 4px; color: #1e293b; }
    .identity-statement { 
      background: linear-gradient(135deg, #faf5ff, #f3e8ff); 
      border: 2px solid #9333ea; 
      border-radius: 8px; 
      padding: 16px; 
      margin: 16px 0; 
      font-style: italic;
      color: #1e293b;
      font-size: 12px;
    }
    
    /* Your Turn Styles */
    .your-turn-section { margin: 24px 0; page-break-inside: avoid; }
    .your-turn-item { margin-bottom: 16px; padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #10b981; page-break-inside: avoid; }
    .your-turn-prompt { font-weight: 600; color: #0f172a; margin-bottom: 8px; font-size: 11px; }
    .your-turn-response { padding: 8px; background: #f0fdf4; border-radius: 4px; color: #1e293b; font-size: 11px; line-height: 1.6; }
    
    .section-divider { margin: 40px 0; border-top: 2px solid #e2e8f0; page-break-after: avoid; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(
      assessmentData?.chapterTitle ||
        resolutionData?.chapterTitle ||
        assessmentConfig?.chapterTitle ||
        'Chapter Report'
    )}</h1>
    <div class="muted">Generated: ${escapeHtml(generatedDate)} • For: ${escapeHtml(user?.name ?? 'User')}</div>
  </div>

  ${
    hasAssessment
      ? `
  <!-- SELF-CHECK ASSESSMENT SECTION -->
  <h2>✅ Self-Check Assessment</h2>
  <p class="text-muted" style="margin: -8px 0 16px 0;">Your baseline assessment at the start of this chapter.</p>
  <div class="card">
    <div class="grid">
      <div class="kv">
        <div class="k">Assessment Type</div>
        <div class="v">${escapeHtml(assessmentData.assessmentType)}</div>
      </div>
      <div class="kv">
        <div class="k">Completed</div>
        <div class="v">${new Date(assessmentData.completedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</div>
      </div>
    </div>
    ${
      showAnswerBars && scoreBand
        ? `
    <div class="score-badge" style="background-color: ${scoreBand.color}20; color: ${scoreBand.color}; border: 2px solid ${scoreBand.color};">
      <span>Score: ${assessmentData.score}/${assessmentData.maxScore}</span>
      <span style="opacity: 0.5;">•</span>
      <span>${scoreBand.level}</span>
    </div>
    <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">${scoreBand.desc}</p>
    `
        : ''
    }
  </div>

  <h3>${includeAnswers ? 'Your Self-Check Responses' : 'Self-Check Questions'}</h3>
  ${questionsHtml}
  `
      : questionsSource.length
      ? `
  <!-- SELF-CHECK QUESTIONS ONLY (NO RESPONSES YET) -->
  <h2>✅ Self-Check Assessment</h2>
  <div class="card" style="background: #fffbeb; border-color: #fde047;">
    <p style="margin: 0 0 16px 0; color: #92400e;">
      💡 <strong>Self-check assessment not completed yet.</strong> Use these questions to reflect or print the blank form.
    </p>
    ${questionsHtml}
  </div>
  `
      : `
  <div class="card" style="background: #fffbeb; border-color: #fde047;">
    <p style="margin: 0; color: #92400e;">
      💡 <strong>Self-check assessment not completed yet.</strong> Complete the self-check to see your baseline assessment here.
    </p>
  </div>
  `
  }

  <div class="section-divider"></div>

  <!-- YOUR TURN RESPONSES - ALWAYS SHOW -->
  <h2>📝 Your Turn Responses</h2>
  <p class="text-muted" style="margin: -8px 0 16px 0;">Reflections and applications from Framework, Techniques, and Follow-Through sections.</p>
  ${yourTurnHtml}
  
  <div class="section-divider"></div>

  <!-- RESOLUTION SECTION -->
  ${
    resolutionData
      ? `
  <h3>Proof Submissions</h3>
  ${proofsHtml}
  `
      : `
  <div class="card" style="background: #fffbeb; border-color: #fde047;">
    <p style="margin: 0; color: #92400e;">
      💡 <strong>Resolution not completed yet.</strong> Complete the Resolution section to see your identity statement and proof submissions here.
    </p>
  </div>
  `
  }

  ${
    !includeAnswers
      ? `
  <div style="margin-top: 32px; padding: 16px; background: #f1f5f9; border-radius: 8px; text-align: center;">
    <p style="margin: 0; color: #475569; font-size: 11px;">
      This is a blank form. Complete it at your convenience and compare with your digital report.
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
    const requestedUserId = searchParams.get('userId') || undefined

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 })
    }

    // Fetch all data in parallel
    const [assessmentResult, resolutionResult, userResult] = await Promise.all([
      getAssessmentReportData(chapterId, requestedUserId),
      getResolutionReportData(chapterId, requestedUserId),
      getUserInfo(requestedUserId),
    ])

    if (!userResult.success) {
      return NextResponse.json({ error: userResult.error }, { status: 401 })
    }

    const user = userResult.data
    const assessmentData = assessmentResult.success ? assessmentResult.data : null
    const resolutionData = resolutionResult.success ? resolutionResult.data : null

    console.log(`[Report API] Chapter ${chapterId} - Building report:`)
    console.log(`  - Assessment: ${assessmentData ? 'YES' : 'NO'}`)
    console.log(`  - Resolution: ${resolutionData ? 'YES' : 'NO'}`)
    if (resolutionData) {
      console.log(`  - Your Turn total: ${(resolutionData.yourTurnByCategory?.framework?.length ?? 0) + (resolutionData.yourTurnByCategory?.techniques?.length ?? 0) + (resolutionData.yourTurnByCategory?.followThrough?.length ?? 0)}`)
      console.log(`  - Identity: ${resolutionData.identityResolution ? 'YES' : 'NO'}`)
      console.log(`  - Proofs: ${resolutionData.proofs?.length ?? 0}`)
    }

    // Always load assessment config so we can render questions even if no assessment has been completed yet
    const assessmentConfig = getAssessmentConfig(
      chapterId,
      assessmentData?.chapterTitle || resolutionData?.chapterTitle || `Chapter ${chapterId}`
    )

    // If neither assessment nor resolution exists, return error
    if (!assessmentData && !resolutionData) {
      return NextResponse.json(
        { error: 'No assessment or resolution data found for this chapter' },
        { status: 404 }
      )
    }

    // Get logo
    const logoDataUri = await getLogoDataUri()

    // Build combined HTML
    const html = buildCombinedReportHtml(
      assessmentData,
      resolutionData,
      user,
      logoDataUri,
      includeAnswers,
      assessmentConfig
    )

    // Generate PDF
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
              <div style="color:#64748b;">Complete Chapter Report</div>
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
        ? `chapter-${chapterId}-complete-report.pdf`
        : `chapter-${chapterId}-blank-form.pdf`

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
    console.error('Error generating combined PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}
