import { requireAuth } from '@/lib/auth/guards'
import { getChaptersForReports } from '@/app/actions/reports'
import { getAllUserPromptAnswers } from '@/app/actions/prompts'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  await requireAuth()
  const result = await getChaptersForReports()
  const chapters = result.success ? result.data : []

  const { data: promptAnswers } = await getAllUserPromptAnswers()

  return <ReportsClient chapters={chapters} promptAnswers={promptAnswers} />
}
