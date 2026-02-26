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
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Fixed Sidebar */}
        <AdminSidebar />
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto lg:ml-0">
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
