import { requireAuth } from '@/lib/auth/guards'
import { getChildProgress } from '@/app/actions/parent'
import { redirect } from 'next/navigation'
import ChildProfileClient from '@/components/parent/ChildProfileClient'

export default async function ChildProfilePage({ params }: { params: { childId: string } }) {
  const user = await requireAuth('parent')
  const progress = await getChildProgress(user.id, params.childId)

  if (!progress) {
    redirect('/parent')
  }

  return <ChildProfileClient childId={params.childId} parentId={user.id} progress={progress} />
}
