import { requireAuth } from '@/lib/auth/guards'

export default async function ReadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  
  // Full-screen layout - no DashboardNav, no wrapper
  return <>{children}</>
}
