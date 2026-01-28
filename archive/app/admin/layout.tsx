import { requireAuth } from '@/lib/auth/guards'
import { AdminLayoutClient } from './admin-layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth('admin')

  return (
    <AdminLayoutClient userFullName={user.fullName}>
      {children}
    </AdminLayoutClient>
  )
}
