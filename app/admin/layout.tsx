import { requireAuth } from '@/lib/auth/guards'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth('admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-700 text-white shadow-lg">
        <div className="container max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-opacity">
              <div className="text-2xl md:text-3xl">⚙️</div>
              <div>
                <h1 className="text-base md:text-lg font-bold leading-tight">The Communication Protocol</h1>
                <p className="text-xs md:text-sm text-red-200">Admin Portal</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/admin/chapters" className="hidden md:block px-3 py-1.5 hover:bg-red-600 rounded-lg transition-colors text-sm">
                Chapters
              </Link>
              <form action={signOut}>
                <button type="submit" className="p-2 hover:bg-red-600 rounded-full transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
