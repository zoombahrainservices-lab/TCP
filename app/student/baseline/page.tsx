import { requireAuth } from '@/lib/auth/guards'
import { hasProgramBaseline } from '@/app/actions/baseline'
import { redirect } from 'next/navigation'
import BaselineForm from '@/components/student/BaselineForm'

export default async function BaselinePage() {
  const user = await requireAuth('student')

  // Check if baseline already completed
  const hasBaseline = await hasProgramBaseline(user.id)
  if (hasBaseline) {
    redirect('/student')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to The Communication Protocol!
        </h1>
        <p className="text-gray-600">
          Before you begin your 30-day journey, please complete this brief baseline assessment. 
          This helps us understand your starting point and track your progress.
        </p>
      </div>

      <BaselineForm studentId={user.id} />
    </div>
  )
}
