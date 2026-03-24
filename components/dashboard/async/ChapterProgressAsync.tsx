import { getCachedChapterReportsData, getDashboardChapters, getDashboardChapterReadingPreviewImages, getCurrentChapterFromReports } from '@/lib/dashboard/cache.server'
import TodaysFocusCard from '@/components/dashboard/cards/TodaysFocusCard'
import InProgressCard from '@/components/dashboard/cards/InProgressCard'
import WhatsNextCard from '@/components/dashboard/cards/WhatsNextCard'

interface Props {
  userId: string
}

export default async function ChapterProgressAsync({ userId }: Props) {
  const [chapterReports, allChapters, readingPreviewByChapter] = await Promise.all([
    getCachedChapterReportsData(userId),
    getDashboardChapters(),
    getDashboardChapterReadingPreviewImages(),
  ])

  // Determine current chapter dynamically based on DB chapters + progress
  const publishedChapters = Array.isArray(allChapters) ? allChapters : []
  const progressList = Array.isArray(chapterReports) ? chapterReports : []

  const currentChapter = getCurrentChapterFromReports(publishedChapters, progressList)

  const currentChapterMeta =
    publishedChapters.find(c => c.chapter_number === currentChapter) ??
    publishedChapters[0] ??
    null

  // Map chapter_id (number) -> progress row
  const progressByNumber = new Map<number, any>()
  for (const row of progressList) {
    if (typeof row.chapter_id === 'number') {
      progressByNumber.set(row.chapter_id, row)
    }
  }

  const currentProgressRow = progressByNumber.get(currentChapter) ?? null
  const chapterProgressPercent =
    currentProgressRow && currentProgressRow.totalSections > 0
      ? Math.round(
          (currentProgressRow.completedCount /
            currentProgressRow.totalSections) *
            100
        )
      : 0

  const currentChapterTitle =
    (currentChapterMeta && currentChapterMeta.title) ||
    `Chapter ${currentChapter}`
  const currentChapterSubtitle =
    (currentChapterMeta && currentChapterMeta.subtitle) ||
    ''
  const currentChapterImage =
    (currentChapterMeta && currentChapterMeta.hero_image_url) ||
    (currentChapterMeta && currentChapterMeta.thumbnail_url) ||
    (currentChapterMeta?.id ? readingPreviewByChapter[currentChapterMeta.id] : undefined) ||
    (currentChapter === 1
      ? '/slider-work-on-quizz/chapter1/chaper1-1.jpeg'
      : '/chapter/chapter 2/Nightmare.png')
  const currentChapterSlug =
    (currentChapterMeta && currentChapterMeta.slug) ||
    (currentChapter === 1
      ? 'stage-star-silent-struggles'
      : 'genius-who-couldnt-speak')

  const userProgress = {
    currentChapter,
    currentChapterTitle,
    currentChapterSubtitle,
    readTime: currentChapter === 1 ? 7 : 8,
    progress: chapterProgressPercent,
    xpAward: 20,
    chapterImage: currentChapterImage,
  }

  const readingHref = `/read/${currentChapterSlug}`

  return (
    <div className="space-y-6">
      <TodaysFocusCard
        chapterNumber={userProgress.currentChapter}
        readTime={userProgress.readTime}
        progress={userProgress.progress}
        xpAward={70}
        continueHref={readingHref}
      />
      <InProgressCard
        chapterNumber={userProgress.currentChapter}
        title={userProgress.currentChapterTitle}
        subtitle={userProgress.currentChapterSubtitle}
        readTime={userProgress.readTime}
        xpAward={userProgress.xpAward}
        progress={userProgress.progress}
        chapterImage={userProgress.chapterImage}
        continueHref={readingHref}
      />
      <WhatsNextCard />
    </div>
  )
}
