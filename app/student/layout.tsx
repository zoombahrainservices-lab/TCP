import { requireAuth } from '@/lib/auth/guards'
import { signOut } from '@/app/actions/auth'
import NotificationBell from '@/components/ui/NotificationBell'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth('student')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white shadow-lg">
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
              <form action={signOut}>
                <button type="submit" className="p-2 hover:bg-blue-700 rounded-full transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
