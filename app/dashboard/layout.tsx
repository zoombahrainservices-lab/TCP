import { requireAuth } from '@/lib/auth/guards'
import { DashboardNav } from '@/components/ui/DashboardNav'
import { MainWithBackground } from '@/components/dashboard/MainWithBackground'
import { getChapterReportsData } from '@/app/actions/gamification'
import { getAllChapters } from '@/lib/content/queries'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const [chapterReports, allChapters] = await Promise.all([
    getChapterReportsData(user.id),
    getAllChapters(),
  ])
  const publishedChapters = Array.isArray(allChapters) ? allChapters : []
  const progressList = Array.isArray(chapterReports) ? chapterReports : []
  const progressByNumber = new Map<number, unknown>()
  for (const row of progressList) {
    if (typeof (row as { chapter_id?: number }).chapter_id === 'number') {
      progressByNumber.set((row as { chapter_id: number }).chapter_id, row)
    }
  }
  let currentChapterNumber: number | null = null
  for (const ch of publishedChapters) {
    const chapterNum = ch.chapter_number as number
    const progress = progressByNumber.get(chapterNum) as { totalSections?: number; completedCount?: number } | undefined
    const totalSections = progress?.totalSections ?? 6
    const completedCount = progress?.completedCount ?? 0
    if (!progress || completedCount < totalSections) {
      currentChapterNumber = chapterNum
      break
    }
  }
  if (currentChapterNumber == null && publishedChapters.length > 0) {
    currentChapterNumber = publishedChapters[publishedChapters.length - 1].chapter_number as number
  }
  const serverCurrentChapter = currentChapterNumber ?? 1
  const isAdmin = user.role === 'admin'

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300" style={{ height: '100dvh' }}>
      <DashboardNav serverCurrentChapter={serverCurrentChapter} isAdmin={isAdmin} />
      <MainWithBackground>{children}</MainWithBackground>
    </div>
  )
}
