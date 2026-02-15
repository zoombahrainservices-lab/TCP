import { requireAuth } from '@/lib/auth/guards'
import { getChaptersForReports } from '@/app/actions/reports'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  await requireAuth()
  const result = await getChaptersForReports()
  const chapters = result.success ? result.data : []

  return <ReportsClient chapters={chapters} />
}
