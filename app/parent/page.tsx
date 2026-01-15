import { requireAuth } from '@/lib/auth/guards'
import { getMyChildren } from '@/app/actions/parent'
import ParentDashboardClient from '@/components/parent/ParentDashboardClient'

export default async function ParentDashboard() {
  const user = await requireAuth('parent')
  
  let children: any[] = []
  try {
    children = await getMyChildren(user.id) || []
  } catch (error) {
    console.error('Failed to load children:', error)
    children = []
  }

  return <ParentDashboardClient parentId={user.id} initialChildren={children} />
}
