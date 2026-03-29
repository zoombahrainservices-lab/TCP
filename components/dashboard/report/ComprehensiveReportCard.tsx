'use client'

import { useState } from 'react'
import Card from '../ui/Card'
import { Download } from 'lucide-react'
import Link from 'next/link'

export type ChapterScoreRow = {
  chapterId: number
  bestScore: number | null
  improvement: number
  xpEarned: number
}

export default function ComprehensiveReportCard({
  chapters,
  totalXPEarned,
}: {
  chapters: ChapterScoreRow[]
  totalXPEarned: number
}) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const maxChapterId = chapters.length > 0
    ? Math.max(...chapters.map((c) => c.chapterId))
    : 1
  const targetChapterIds = [maxChapterId - 1, maxChapterId - 2].filter((id) => id > 0)
  const latestChapters = targetChapterIds
    .map((id) => chapters.find((c) => c.chapterId === id))
    .filter((chapter): chapter is ChapterScoreRow => Boolean(chapter))

  const handleDownload = async (chapterId: number, type: 'full' | 'blank') => {
    const downloadKey = `${chapterId}-${type}`
    setDownloading(downloadKey)
    
    try {
      const url = type === 'full'
        ? `/api/reports/chapter/${chapterId}?answers=true`
        : `/api/reports/chapter/${chapterId}?answers=false`
      
      const filename = type === 'full'
        ? `chapter-${chapterId}-complete-report.pdf`
        : `chapter-${chapterId}-blank-form.pdf`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to download ${filename}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Card className="overflow-hidden h-full">
      <div className="p-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
          Comprehensive Report
        </h2>

        <div className="mt-4 space-y-3">
          {latestChapters.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No chapter scores yet. Complete assessments to see your report.
            </p>
          ) : (
            latestChapters.map((ch) => (
              <div
                key={ch.chapterId}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 ring-1 ring-slate-200/60 dark:ring-slate-600/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏆</span>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        Chapter {ch.chapterId}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Score: {ch.bestScore ?? '—'}
                        </span>
                        {ch.improvement > 0 && (
                          <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                            <span>↑</span>
                            <span>+{ch.improvement}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-black text-orange-500">
                    +{ch.xpEarned} XP
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleDownload(ch.chapterId, 'full')}
                    disabled={downloading === `${ch.chapterId}-full`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-xs font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloading === `${ch.chapterId}-full`
                      ? 'Downloading...'
                      : 'Full Report'}
                  </button>
                  <button
                    onClick={() => handleDownload(ch.chapterId, 'blank')}
                    disabled={downloading === `${ch.chapterId}-blank`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white text-xs font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloading === `${ch.chapterId}-blank`
                      ? 'Downloading...'
                      : 'Blank Report'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <Link
            href="/reports"
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50"
          >
            View More Chapters
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 ring-1 ring-amber-200/60 dark:ring-amber-700/40">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <span>🏆</span>
            Total XP Earned
          </span>
          <span className="text-lg font-black text-orange-600 dark:text-orange-400">
            +{totalXPEarned.toLocaleString()} XP
          </span>
        </div>
      </div>
    </Card>
  )
}
