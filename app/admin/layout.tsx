import { requireAuth } from '@/lib/auth/guards'
import AdminSidebar from '@/components/admin/AdminSidebar'
import QueryProvider from '@/components/admin/QueryProvider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require admin role
  await requireAuth('admin')

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <main className="flex-1 lg:ml-0">
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
