import Image from 'next/image'
import { requireAuth } from '@/lib/auth/guards'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { getChapterReportsData } from '@/app/actions/gamification'
import { getCurrentChapterFromReports } from '@/lib/dashboard/cache.server'
import { getDashboardChapterReadingPreviewImages } from '@/lib/dashboard/cache.server'
import { DashboardNav } from '@/components/ui/DashboardNav'
import { ChapterCard } from '@/components/read/ChapterCard'
import { FeaturedContinueCard } from '@/components/read/FeaturedContinueCard'

export const revalidate = 60

const TOTAL_CHAPTERS = 30

export default async function ReadIndexPage() {
  const user = await requireAuth()
  const isAdmin = user.role === 'admin'

  const [publishedChapters, reports, readingPreviewByChapter] = await Promise.all([
    getCachedAllChapters(),
    getChapterReportsData(user.id),
    getDashboardChapterReadingPreviewImages(),
  ])

  const safeChapters = Array.isArray(publishedChapters) ? publishedChapters : []
  const safeReports = Array.isArray(reports) ? reports : []

  const currentChapterNumber = getCurrentChapterFromReports(safeChapters, safeReports)

  const chapterMetaByNumber = new Map<number, any>()
  for (const ch of safeChapters) {
    const n = Number((ch as any)?.chapter_number) || 0
    if (n > 0) chapterMetaByNumber.set(n, ch)
  }

  const reportByChapterId = new Map<number, any>()
  for (const r of safeReports) {
    const id = Number((r as any)?.chapter_id) || 0
    if (id > 0) reportByChapterId.set(id, r)
  }

  const isChapterCompleted = (n: number) => {
    const row = reportByChapterId.get(n)
    const completedCount = Number(row?.completedCount) || 0
    const totalSections = Number(row?.totalSections) || 0
    return totalSections > 0 && completedCount >= totalSections
  }

  const completedChaptersCount = Array.from({ length: TOTAL_CHAPTERS }, (_, i) => i + 1).filter(isChapterCompleted).length

  const getSafeImageSrc = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    if (!trimmed) return null
    const normalized = trimmed.toLowerCase()
    if (
      normalized === '/placeholder.png' ||
      normalized.endsWith('/placeholder.png') ||
      normalized === 'placeholder.png'
    ) {
      return null
    }
    return trimmed
  }

  const getChapterSlug = (n: number, meta: any) => {
    const slug = typeof meta?.slug === 'string' ? meta.slug.trim() : ''
    return slug.length > 0 ? slug : `chapter-${n}`
  }

  const getChapterTitle = (n: number, meta: any) => {
    const title = typeof meta?.title === 'string' ? meta.title.trim() : ''
    return title.length > 0 ? title : `Chapter ${n}`
  }

  const getChapterImage = (n: number, meta: any) => {
    const hero = getSafeImageSrc(meta?.hero_image_url)
    const thumb = getSafeImageSrc(meta?.thumbnail_url)
    if (hero) return hero
    if (thumb) return thumb
    const contentPreview =
      meta?.id != null ? getSafeImageSrc(readingPreviewByChapter?.[String(meta.id)]) : null
    if (contentPreview) return contentPreview
    if (n === 1) return '/slider-work-on-quizz/chapter1/chaper1-1.jpeg'
    if (n === 2) return '/chapter/chapter 2/Nightmare.png'
    return '/Chapter_cover_page.png'
  }

  const chapters = Array.from({ length: TOTAL_CHAPTERS }, (_, idx) => {
    const chapterNumber = idx + 1
    const meta = chapterMetaByNumber.get(chapterNumber) ?? null
    const slug = getChapterSlug(chapterNumber, meta)
    const title = getChapterTitle(chapterNumber, meta)
    const imageSrc = getChapterImage(chapterNumber, meta)

    const isUnlocked = chapterNumber <= currentChapterNumber
    const isCurrent = chapterNumber === currentChapterNumber
    const isCompleted = isChapterCompleted(chapterNumber)

    const state = !isUnlocked ? 'locked' : isCurrent ? 'current' : isCompleted ? 'completed' : 'normal'

    return {
      chapterNumber,
      slug,
      title,
      href: `/read/${slug}`,
      imageSrc,
      state,
    } as const
  })

  const current = chapters.find((c) => c.chapterNumber === currentChapterNumber) ?? chapters[0]

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300" style={{ height: '100dvh', maxHeight: '-webkit-fill-available' }}>
      <DashboardNav serverCurrentChapter={currentChapterNumber} isAdmin={isAdmin} />

      <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Header + progress */}
          <section className="mb-7 sm:mb-9">
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Chapters
                  </h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
                    Continue your journey. All chapters are listed below—locked ones stay visible so you always know what’s next.
                  </p>
                </div>
                <div className="hidden sm:flex flex-shrink-0 items-center gap-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-gray-900/50 px-4 py-3 ring-1 ring-black/5 dark:ring-white/5">
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Progress
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {completedChaptersCount}/{TOTAL_CHAPTERS}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-slate-200/70 dark:bg-slate-800/80" />
                  <div className="w-40">
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-orange-500/90 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((completedChaptersCount / TOTAL_CHAPTERS) * 100))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Keep going—small steps add up.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile progress bar */}
              <div className="sm:hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-gray-900/50 px-4 py-4 ring-1 ring-black/5 dark:ring-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Progress
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {completedChaptersCount}/{TOTAL_CHAPTERS}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-orange-500/90 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((completedChaptersCount / TOTAL_CHAPTERS) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Featured continue */}
          <section className="mb-7 sm:mb-10">
            <FeaturedContinueCard
              title={current?.title ?? `Chapter ${currentChapterNumber}`}
              chapterNumber={current?.chapterNumber ?? currentChapterNumber}
              href={current?.href ?? '/read'}
              imageSrc={current?.imageSrc ?? null}
            />
          </section>

          {/* Chapters grid */}
          <section>
            <div className="mb-4 sm:mb-5 flex items-center justify-between gap-4">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                All Chapters
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-400" /> Current
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Completed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" /> Locked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {chapters.map((ch) => (
                <ChapterCard
                  key={`chapter-${ch.chapterNumber}`}
                  chapterNumber={ch.chapterNumber}
                  title={ch.title}
                  href={ch.href}
                  state={ch.state}
                  imageSrc={ch.imageSrc}
                />
              ))}
            </div>
          </section>

          {/* Footer note */}
          <div className="mt-10 sm:mt-12 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <Image src="/TCP-SYMBOL.svg" alt="TCP" width={18} height={18} className="opacity-70" />
            <p>
              Locked chapters remain visible so your path is always clear.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

