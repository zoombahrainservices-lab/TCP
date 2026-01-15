import { requireAuth } from '@/lib/auth/guards'
import { getChildProgress } from '@/app/actions/parent'
import { redirect } from 'next/navigation'
import ChildProfileClient from '@/components/parent/ChildProfileClient'

export default async function MentorChildProfilePage({ params }: { params: { childId: string } }) {
  const user = await requireAuth('mentor')
  const progress = await getChildProgress(user.id, params.childId)

  if (!progress) {
    redirect('/mentor')
  }

  return <ChildProfileClient childId={params.childId} parentId={user.id} progress={progress} />
}
