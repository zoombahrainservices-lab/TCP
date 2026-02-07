'use client'

import Card from '../ui/Card'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export type ChapterReport = {
  title: string
  completed: string
  xp: number
}

function ChapterRow({ title, completed, xp }: ChapterReport) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50/80 dark:bg-slate-900/50 px-4 py-3 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔥</span>
        <div>
          <div className="font-black text-slate-800 dark:text-slate-100">{title}</div>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{completed} Completed</div>
        </div>
      </div>
      <div className="text-sm font-black text-slate-700 dark:text-slate-300">{xp} XP</div>
    </div>
  )
}

export default function ChapterReportsCard({
  chapters = [],
}: {
  chapters?: ChapterReport[]
}) {
  return (
    <Card className="overflow-hidden h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Chapter Reports</h2>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            View All
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {chapters.length > 0 ? (
            chapters.map((ch) => (
              <ChapterRow key={ch.title} title={ch.title} completed={ch.completed} xp={ch.xp} />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No chapter progress yet.</p>
          )}
        </div>

        <Link
          href="/reports"
          className="mt-4 block text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Download PDF Reports →
        </Link>
      </div>
    </Card>
  )
}
