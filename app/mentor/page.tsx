import { requireAuth } from '@/lib/auth/guards'
import { getMyChildren } from '@/app/actions/parent'
import MentorDashboardClient from '@/components/mentor/MentorDashboardClient'

export default async function MentorDashboard() {
  const user = await requireAuth('mentor')
  const students = await getMyChildren(user.id)

  return <MentorDashboardClient mentorId={user.id} initialStudents={students} />
}
