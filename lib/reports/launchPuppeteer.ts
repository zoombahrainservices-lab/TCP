/**
 * Launch Puppeteer browser for PDF generation.
 * On Vercel: puppeteer-core + @sparticuz/chromium (no Chrome cache; serverless-friendly).
 * Locally: full puppeteer with bundled Chromium.
 */

import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export type Browser = Awaited<ReturnType<typeof launchBrowser>>

export async function launchBrowser() {
  const isVercel = !!process.env.VERCEL

  if (isVercel) {
    // Serverless: use @sparticuz/chromium (no .cache/puppeteer; binary included)
    if (typeof (chromium as { setGraphicsMode?: boolean }).setGraphicsMode !== 'undefined') {
      (chromium as { setGraphicsMode: boolean }).setGraphicsMode = false
    }
    const executablePath = await chromium.executablePath()
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath,
      headless: true,
    })
  }

  // Local: full puppeteer (Chrome on your machine or in local cache)
  const puppeteerFull = await import('puppeteer')
  return puppeteerFull.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
}
