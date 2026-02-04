import { requireAuth } from '@/lib/auth/guards'
import { DashboardNav } from '@/components/ui/DashboardNav'
import { MainWithBackground } from '@/components/dashboard/MainWithBackground'

export default async function ChapterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300" style={{ height: '100dvh' }}>
      <DashboardNav />
      <MainWithBackground>{children}</MainWithBackground>
    </div>
  )
}
