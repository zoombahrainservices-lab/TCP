import { requireAuth } from '@/lib/auth/guards'
import NotificationBell from '@/components/ui/NotificationBell'
import Sidebar from '@/components/student/Sidebar'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth('student')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Always fixed */}
      <Sidebar userId={user.id} userName={user.fullName || user.email} />
      
      {/* Main Content Area - Offset for sidebar on desktop */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-blue-800 text-white shadow-lg">
          <div className="container max-w-6xl mx-auto px-4 py-3 md:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">📖</div>
                <div>
                  <h1 className="text-base md:text-lg font-bold leading-tight">The Communication Protocol</h1>
                  <p className="text-xs md:text-sm text-blue-200">30-Day Learning Challenge</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <NotificationBell userId={user.id} />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
