'use client'

import Card from '../ui/Card'

export type ChapterReport = {
  title: string
  completed: string
  xp: number
}

function ChapterRow({ title, completed, xp }: ChapterReport) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-200/60">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔥</span>
        <div>
          <div className="font-black text-slate-800">{title}</div>
          <div className="text-sm font-semibold text-slate-500">{completed} Completed</div>
        </div>
      </div>
      <div className="text-sm font-black text-slate-700">{xp} XP</div>
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
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Chapter Reports</h2>

        <div className="mt-4 space-y-3">
          {chapters.length > 0 ? (
            chapters.map((ch) => (
              <ChapterRow key={ch.title} title={ch.title} completed={ch.completed} xp={ch.xp} />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No chapter progress yet.</p>
          )}
        </div>
      </div>
    </Card>
  )
}
