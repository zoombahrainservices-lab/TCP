import { requireAuth } from '@/lib/auth/guards'
import { signOut } from '@/app/actions/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth('admin')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">Welcome, {user.fullName}</p>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">Sign Out</Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
