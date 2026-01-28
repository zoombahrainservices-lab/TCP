import { requireAuth } from '@/lib/auth/guards'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import Button from '@/components/ui/Button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-blue-600">TCP</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.fullName}</span>
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
