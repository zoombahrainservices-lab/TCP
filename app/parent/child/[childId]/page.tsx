import { requireAuth } from '@/lib/auth/guards'
import { getChildProgress } from '@/app/actions/parent'
import { redirect } from 'next/navigation'
import ChildProfileClient from '@/components/parent/ChildProfileClient'

export default async function ChildProfilePage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params
  const user = await requireAuth('parent')
  const progress = await getChildProgress(user.id, childId)

  if (!progress) {
    redirect('/parent')
  }

  return <ChildProfileClient childId={childId} parentId={user.id} progress={progress} />
}
