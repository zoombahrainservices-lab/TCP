import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guards'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { getChapterReportsData } from '@/app/actions/gamification'
import { getCurrentChapterFromReports } from '@/lib/dashboard/cache.server'
import { DashboardNav } from '@/components/ui/DashboardNav'

export const revalidate = 60

export default async function ReadIndexPage() {
  const user = await requireAuth()
  const isAdmin = user.role === 'admin'

  const [publishedChapters, reports] = await Promise.all([
    getCachedAllChapters(),
    getChapterReportsData(user.id),
  ])

  const safeChapters = Array.isArray(publishedChapters) ? publishedChapters : []
  const safeReports = Array.isArray(reports) ? reports : []

  const currentChapterNumber = getCurrentChapterFromReports(safeChapters, safeReports)

  const chapters = safeChapters
    .map((ch: any) => {
      const chapterNumber = Number(ch.chapter_number) || 0
      const slug = typeof ch.slug === 'string' && ch.slug.trim().length > 0 ? ch.slug.trim() : `chapter-${chapterNumber}`
      const title = typeof ch.title === 'string' && ch.title.trim().length > 0 ? ch.title.trim() : `Chapter ${chapterNumber}`

      return {
        chapterNumber,
        slug,
        title,
        isUnlocked: chapterNumber > 0 && chapterNumber <= currentChapterNumber,
        isCurrent: chapterNumber === currentChapterNumber,
      }
    })
    .filter((c) => c.chapterNumber > 0)
    .sort((a, b) => a.chapterNumber - b.chapterNumber)

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300" style={{ height: '100dvh', maxHeight: '-webkit-fill-available' }}>
      <DashboardNav serverCurrentChapter={currentChapterNumber} isAdmin={isAdmin} />

      <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Chapters</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose a chapter to start reading.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((ch) => {
              const locked = !ch.isUnlocked
              const href = `/read/${ch.slug}`
              const baseClasses =
                'group block rounded-xl border-2 p-4 bg-white dark:bg-gray-900 transition-colors'
              const stateClasses = locked
                ? 'border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                : 'border-gray-200 dark:border-gray-800 hover:border-[var(--color-amber)] hover:bg-gray-50 dark:hover:bg-gray-800/60'

              const inner = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Chapter {ch.chapterNumber}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {ch.title}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {locked ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V7a4 4 0 10-8 0v4m-1 0h10a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
                          </svg>
                          Locked
                        </span>
                      ) : ch.isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                          Open
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-amber)]">
                      {locked ? 'Complete previous chapters to unlock' : 'Start reading'}
                    </span>
                    {!locked && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        →
                      </span>
                    )}
                  </div>
                </>
              )

              if (locked) {
                return (
                  <div key={ch.slug} className={`${baseClasses} ${stateClasses}`} aria-disabled="true">
                    {inner}
                  </div>
                )
              }

              return (
                <Link key={ch.slug} href={href} className={`${baseClasses} ${stateClasses}`}>
                  {inner}
                </Link>
              )
            })}
          </div>

          {chapters.length === 0 && (
            <div className="mt-10 text-center text-gray-600 dark:text-gray-400">
              No chapters found.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

