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

  const answersByChapter = promptAnswers.reduce((acc: Record<number, any[]>, answer) => {
    if (!acc[answer.chapter_id]) {
      acc[answer.chapter_id] = []
    }
    acc[answer.chapter_id].push(answer)
    return acc
  }, {})

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

        {/* Reports Grid */}
        <div className="space-y-6">
          {chapters.map((chapter) => (
            <div
              key={chapter.chapterId}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
                chapter.status === 'available'
                  ? 'border-slate-200 dark:border-slate-700 hover:shadow-xl'
                  : 'border-slate-100 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="p-6 sm:p-8">
                {/* Chapter Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                        {chapter.chapterId}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Chapter {chapter.chapterId}
                      </h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 ml-[52px]">
                      {chapter.title}
                    </p>
                  </div>
                  {chapter.status === 'available' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                  {chapter.status === 'locked' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                      🔒 Locked
                    </div>
                  )}
                </div>

                {/* Report Types */}
                {chapter.status === 'available' ? (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Self-Check Assessment Report */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                            Self-Check Assessment
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Your baseline assessment with scores and analysis
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            handleDownload(
                              `/api/reports/chapter/${chapter.chapterId}/assessment?answers=true`,
                              `chapter-${chapter.chapterId}-assessment-with-answers.pdf`
                            )
                          }
                          disabled={
                            !chapter.assessmentAvailable ||
                            downloading ===
                              `chapter-${chapter.chapterId}-assessment-with-answers.pdf`
                          }
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          {downloading ===
                          `chapter-${chapter.chapterId}-assessment-with-answers.pdf`
                            ? 'Downloading...'
                            : 'Download with Answers'}
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(
                              `/api/reports/chapter/${chapter.chapterId}/assessment?answers=false`,
                              `chapter-${chapter.chapterId}-assessment-blank.pdf`
                            )
                          }
                          disabled={
                            !chapter.assessmentAvailable ||
                            downloading ===
                              `chapter-${chapter.chapterId}-assessment-blank.pdf`
                          }
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:border-slate-300 disabled:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-600 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          {downloading ===
                          `chapter-${chapter.chapterId}-assessment-blank.pdf`
                            ? 'Downloading...'
                            : 'Download Blank (No Answers)'}
                        </button>
                      </div>
                    </div>

                    {/* Resolution Report */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                            Resolution Report
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Your identity statement and proof submissions
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDownload(
                            `/api/reports/chapter/${chapter.chapterId}/resolution`,
                            `chapter-${chapter.chapterId}-resolution.pdf`
                          )
                        }
                        disabled={
                          !chapter.resolutionAvailable ||
                          downloading ===
                            `chapter-${chapter.chapterId}-resolution.pdf`
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        {downloading ===
                        `chapter-${chapter.chapterId}-resolution.pdf`
                          ? 'Downloading...'
                          : 'Download Report'}
                      </button>
                    </div>
                  </div>

                  {/* Prompt Answers Section */}
                  {answersByChapter[chapter.chapterId] && answersByChapter[chapter.chapterId].length > 0 && (
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Your Answers</h3>
                      <div className="space-y-4">
                        {answersByChapter[chapter.chapterId].map((answer: any) => (
                          <div key={answer.id} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              {answer.prompt_key}
                            </p>
                            <p className="text-slate-900 dark:text-white">
                              {typeof answer.answer === 'string' ? answer.answer : JSON.stringify(answer.answer)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>
                      Complete this chapter to unlock reports and track your progress.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
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
                <strong>Assessment Reports</strong> include your responses, scores, and
                risk analysis for each self-check
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                <strong>Blank Assessment Forms</strong> can be printed for offline
                completion or comparison
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                <strong>Resolution Reports</strong> capture your identity statements and
                proof submissions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                All reports are generated in real-time with your latest data
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
