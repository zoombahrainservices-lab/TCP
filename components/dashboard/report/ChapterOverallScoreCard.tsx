'use client'

import Image from 'next/image'
import Card from '../ui/Card'

const CHAPTER_1_IMAGE = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg'

export type ChapterOverallData = {
  chapterId: number
  bestScore: number | null
  scoreBefore: number | null
  improvement: number
  xpEarned: number
  isComplete: boolean
  xpBreakdown: { reason: string; amount: number }[]
}

function formatReason(r: string): string {
  const map: Record<string, string> = {
    chapter_completion: 'Completion',
    section_completion: 'Section',
    improvement: 'Improvement',
    streak_bonus: 'Streak Bonus',
    milestone: 'Milestone',
    daily_activity: 'Daily Activity',
  }
  return map[r] || r.replace(/_/g, ' ')
}

export default function ChapterOverallScoreCard({
  data,
}: {
  data: ChapterOverallData | null
}) {
  if (!data) {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row p-6">
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No chapter progress yet. Complete a chapter to see your overall score here.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const score = data.bestScore ?? data.scoreBefore ?? 0
  const improvement = data.improvement

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-[200px] w-full lg:h-auto lg:w-[220px] shrink-0 bg-gradient-to-br from-amber-200 via-amber-100 to-orange-100 flex flex-col items-center justify-center p-4">
          <div className="relative h-[100px] w-[100px] rounded-full overflow-hidden shadow-lg ring-2 ring-white/60">
            <Image
              src={CHAPTER_1_IMAGE}
              alt={`Chapter ${data.chapterId}`}
              fill
              className="object-cover"
              sizes="100px"
            />
          </div>
          <span className="mt-2 text-sm font-bold text-amber-800">Chapter {data.chapterId}</span>
        </div>

        <div className="flex-1 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                Chapter {data.chapterId} Overall Score
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-300/50">
                    <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                      {score}
                    </span>
                  </div>
                  {improvement > 0 && (
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      +{improvement} Improvement
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-orange-500">
                  +{data.xpEarned} XP Earned
                </span>
              </div>
              {data.scoreBefore != null && data.bestScore != null && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <span>{data.scoreBefore}</span>
                  <span className="text-green-500">→</span>
                  <span className="font-semibold text-slate-700">{data.bestScore}</span>
                </div>
              )}
              {data.isComplete && (
                <p className="mt-2 text-sm font-bold text-green-600">Chapter {data.chapterId} Completed!</p>
              )}
            </div>
          </div>

          {data.xpBreakdown.length > 0 && (
            <div className="mt-4 space-y-1">
              {data.xpBreakdown.map(({ reason, amount }) => (
                <div
                  key={reason}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    +{amount} XP for {formatReason(reason)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
