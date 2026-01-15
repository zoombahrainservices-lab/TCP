import { requireAuth } from '@/lib/auth/guards'
import { getMyChildren } from '@/app/actions/parent'
import ParentDashboardClient from '@/components/parent/ParentDashboardClient'

export default async function ParentDashboard() {
  const user = await requireAuth('parent')
  const children = await getMyChildren(user.id)

  return <ParentDashboardClient parentId={user.id} initialChildren={children} />
}
