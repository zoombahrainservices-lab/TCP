import { requireAuth } from '@/lib/auth/guards'
import { DashboardNav } from '@/components/ui/DashboardNav'
import { MainWithBackground } from '@/components/dashboard/MainWithBackground'
import {
  getCachedChapterReportsData,
  getDashboardChapters,
  getCurrentChapterFromReports,
} from '@/lib/dashboard/cache.server'

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const [chapterReports, allChapters] = await Promise.all([
    getCachedChapterReportsData(user.id),
    getDashboardChapters(),
  ])

  const publishedChapters = Array.isArray(allChapters) ? allChapters : []
  const progressList = Array.isArray(chapterReports) ? chapterReports : []
  const serverCurrentChapter = getCurrentChapterFromReports(publishedChapters, progressList)
  const isAdmin = user.role === 'admin'

  return (
    <div
      className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300"
      style={{ height: '100dvh' }}
    >
      <DashboardNav serverCurrentChapter={serverCurrentChapter} isAdmin={isAdmin} />
      <MainWithBackground>{children}</MainWithBackground>
    </div>
  )
}
