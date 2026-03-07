/**
 * Puppeteer/Chromium launcher for PDF generation
 * 
 * Uses chrome-aws-lambda for serverless compatibility (Vercel)
 * Falls back to system Chrome/Edge in development
 */

import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'
import { existsSync } from 'fs'

const isLocal = process.env.NODE_ENV === 'development' || process.env.IS_LOCAL === 'true'

/**
 * Find Chrome/Edge executable on the system
 */
function getSystemChromePath(): string {
  const { platform } = process
  
  // Allow override via environment variable
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH
  }
  
  let possiblePaths: string[] = []
  
  if (platform === 'win32') {
    // Windows: Check common Chrome and Edge locations
    possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ]
  } else if (platform === 'darwin') {
    // macOS
    possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ]
  } else {
    // Linux
    possiblePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ]
  }
  
  // Find first existing path
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      console.log(`[PDF] Using Chrome at: ${path}`)
      return path
    }
  }
  
  throw new Error(
    `No Chrome/Chromium found. Tried: ${possiblePaths.join(', ')}\n` +
    `Set CHROME_PATH environment variable to specify custom location.`
  )
}

export async function launchBrowser() {
  if (isLocal) {
    // Local development: use system Chrome/Edge with puppeteer-core
    const executablePath = getSystemChromePath()
    
    return puppeteerCore.launch({
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      headless: true,
    })
  } else {
    // Production (Vercel): use chrome-aws-lambda with puppeteer-core
    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }
}
