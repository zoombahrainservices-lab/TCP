'use client'

import { CheckCircle, Circle, Lock } from 'lucide-react'

interface ChapterProgress {
  chapter_id: number
  reading_complete: boolean
  assessment_complete: boolean
  framework_complete: boolean
  techniques_complete: boolean
  proof_complete: boolean
  follow_through_complete: boolean
  chapter_complete: boolean
  chapters?: {
    chapter_number: number
    title: string
    slug: string
  }
}

interface UserProgressTimelineProps {
  progress: ChapterProgress[]
  xpByChapter: Record<number, number>
  assessments: any[]
  sessions: any[]
}

export default function UserProgressTimeline({
  progress,
  xpByChapter,
  assessments,
  sessions,
}: UserProgressTimelineProps) {
  const getBlockStatus = (isComplete: boolean) => {
    return isComplete ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
    )
  }

  const calculateProgress = (chapter: ChapterProgress) => {
    const blocks = [
      chapter.reading_complete,
      chapter.assessment_complete,
      chapter.framework_complete,
      chapter.techniques_complete,
      chapter.proof_complete,
      chapter.follow_through_complete,
    ]
    const completed = blocks.filter(Boolean).length
    return (completed / 6) * 100
  }

  const getSession = (chapterId: number) => {
    return sessions.find(s => s.chapter_id === chapterId)
  }

  const getAssessment = (chapterId: number) => {
    return assessments.find(a => a.chapter_id === chapterId)
  }

  return (
    <div className="space-y-4">
      {progress.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No progress yet
          </p>
        </div>
      ) : (
        progress.map((chapter) => {
          const progressPercent = calculateProgress(chapter)
          const session = getSession(chapter.chapter_id)
          const assessment = getAssessment(chapter.chapter_id)
          const xp = xpByChapter[chapter.chapter_id] || 0

          return (
            <div
              key={chapter.chapter_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              {/* Chapter Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Chapter {chapter.chapters?.chapter_number}: {chapter.chapters?.title}
                  </h3>
                  {chapter.chapter_complete ? (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded text-xs font-medium">
                      In Progress
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--color-amber)]">
                    {xp} XP
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {progressPercent.toFixed(0)}% complete
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[var(--color-amber)] h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Block Status */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  {getBlockStatus(chapter.reading_complete)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Reading
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getBlockStatus(chapter.assessment_complete)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Assessment
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getBlockStatus(chapter.framework_complete)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Framework
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getBlockStatus(chapter.techniques_complete)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Techniques
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getBlockStatus(chapter.proof_complete)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Proof
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getBlockStatus(chapter.follow_through_complete)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Follow Through
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {session?.started_at && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Started</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(session.started_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {session?.completed_at && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(session.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {assessment && (
                  <>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Score Before</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {assessment.score_before || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Score After</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {assessment.score_after || 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
