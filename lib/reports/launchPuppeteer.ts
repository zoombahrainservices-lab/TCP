/**
 * Launch Puppeteer browser for PDF generation.
 * On Vercel (serverless): uses @sparticuz/chromium + puppeteer-core.
 * Locally: uses full puppeteer with bundled Chromium.
 */

export type Browser = Awaited<ReturnType<typeof launchBrowser>>

export async function launchBrowser() {
  const isVercel = !!process.env.VERCEL

  if (isVercel) {
    // Serverless: use @sparticuz/chromium (works on Vercel/Lambda)
    const chromiumMod = await import('@sparticuz/chromium')
    const chromium = chromiumMod.default ?? chromiumMod
    const puppeteerCore = await import('puppeteer-core')
    // Disable WebGL for faster cold start (optional)
    if ('setGraphicsMode' in chromium && typeof (chromium as { setGraphicsMode?: boolean }).setGraphicsMode !== 'undefined') {
      (chromium as { setGraphicsMode: boolean }).setGraphicsMode = false
    }
    const executablePath = await chromium.executablePath()
    return puppeteerCore.default.launch({
      args: [...(chromium.args ?? []), '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: null,
      executablePath,
      headless: (chromium as { headless?: boolean }).headless ?? true,
    })
  }

  // Local: use full puppeteer with bundled Chromium
  const puppeteer = await import('puppeteer')
  return puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
}
