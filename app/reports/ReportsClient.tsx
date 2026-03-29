'use client'

import { useState } from 'react'
import { Download, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { ChapterReportMeta } from '@/app/actions/reports'

interface ReportsClientProps {
  chapters: ChapterReportMeta[]
  promptAnswers: any[]
}

export default function ReportsClient({ chapters, promptAnswers }: ReportsClientProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [showAllChapters, setShowAllChapters] = useState(false)

  const chapterScores = promptAnswers.reduce((acc: Record<number, number>, answer) => {
    const chapterId = Number(answer.chapter_id)
    const totalScore = answer?.answer?.totalScore
    if (Number.isFinite(chapterId) && typeof totalScore === 'number') {
      acc[chapterId] = totalScore
    }
    return acc
  }, {})

  const availableChapters = chapters
    .filter((chapter) => chapter.status === 'available')
    .sort((a, b) => b.chapterId - a.chapterId)

  const previewCount = 2
  const hasMoreChapters = availableChapters.length > previewCount
  const visibleChapters = showAllChapters
    ? availableChapters
    : availableChapters.slice(0, previewCount)

  const handleDownload = async (url: string, filename: string) => {
    setDownloading(filename)
    try {
      const response = await fetch(url, { credentials: 'include' })
      if (!response.ok) {
        const isAuth = response.status === 401
        let message = isAuth ? 'Please log in again to download.' : 'Download failed.'
        try {
          const err = await response.json()
          if (err?.error && typeof err.error === 'string') message = err.error
        } catch {
          // ignore
        }
        throw new Error(message)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Your Reports
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Download comprehensive PDF reports of your self-check assessments and
            resolutions for each chapter.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800/95">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300/40">
              <FileText className="h-5 w-5 text-amber-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Comprehensive Report</h2>
          </div>

          <div className="space-y-3">
            {visibleChapters.map((chapter) => (
              <div
                key={chapter.chapterId}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Chapter {chapter.chapterId}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{chapter.title}</p>
                    {typeof chapterScores[chapter.chapterId] === 'number' && (
                      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Score: {chapterScores[chapter.chapterId]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    onClick={() =>
                      handleDownload(
                        `/api/reports/chapter/${chapter.chapterId}?answers=true`,
                        `chapter-${chapter.chapterId}-complete-report.pdf`
                      )
                    }
                    disabled={downloading === `chapter-${chapter.chapterId}-complete-report.pdf`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                  >
                    <Download className="h-4 w-4" />
                    {downloading === `chapter-${chapter.chapterId}-complete-report.pdf`
                      ? 'Downloading...'
                      : 'Download Full Report'}
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        `/api/reports/chapter/${chapter.chapterId}?answers=false`,
                        `chapter-${chapter.chapterId}-blank-form.pdf`
                      )
                    }
                    disabled={downloading === `chapter-${chapter.chapterId}-blank-form.pdf`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-fuchsia-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                  >
                    <Download className="h-4 w-4" />
                    {downloading === `chapter-${chapter.chapterId}-blank-form.pdf`
                      ? 'Downloading...'
                      : 'Download Blank Report'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {availableChapters.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
              No chapter reports available yet. Complete a chapter to unlock downloads.
            </div>
          )}

          {hasMoreChapters && (
            <div className="mt-4">
              <button
                onClick={() => setShowAllChapters((prev) => !prev)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                {showAllChapters ? 'Show Less Chapters' : `View More Chapters (${availableChapters.length - previewCount})`}
              </button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
            📊 About Your Reports
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                <strong>Complete Report</strong> includes your self-check assessment, resolution statement, and all proof submissions in one comprehensive PDF
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                <strong>Blank Form</strong> can be printed for offline completion or comparison
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                All reports are generated in real-time with your latest data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Reports become available after completing the chapter sections
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
