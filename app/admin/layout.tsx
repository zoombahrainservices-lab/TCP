import { requireAuth } from '@/lib/auth/guards'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminContentShell from '@/components/admin/AdminContentShell'
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
      <div
        className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900"
        style={{ height: '100dvh', maxHeight: '-webkit-fill-available' }}
      >
        {/* Fixed Sidebar */}
        <AdminSidebar />
        <AdminContentShell>{children}</AdminContentShell>
      </div>
    </QueryProvider>
  )
}
