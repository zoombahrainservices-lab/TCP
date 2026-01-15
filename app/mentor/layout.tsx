import { requireAuth } from '@/lib/auth/guards'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth('mentor')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/mentor">
              <h1 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Mentor Portal
              </h1>
            </Link>
            <p className="text-sm text-gray-600">Welcome, {user.fullName}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">Sign Out</Button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
