import { requireAuth } from '@/lib/auth/guards'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth('admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-2 border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin">
              <h1 className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors">
                Admin Portal
              </h1>
            </Link>
            <Link href="/admin/chapters" className="text-sm text-gray-600 hover:text-gray-900">
              Manage Chapters
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
