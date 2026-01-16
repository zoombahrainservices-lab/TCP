import { requireAuth } from '@/lib/auth/guards'
import { getMyFoundation } from '@/app/actions/baseline'
import FoundationScreen from '@/components/student/FoundationScreen'

export default async function FoundationPage() {
  const user = await requireAuth('student')

  // Get existing Foundation data if available
  const foundation = await getMyFoundation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {foundation ? 'Your Foundation' : 'Start with Your Foundation'}
        </h1>
        <p className="text-gray-600">
          {foundation 
            ? 'Review or update your Foundation assessment, identity statement, and commitment.'
            : 'Begin your communication journey by building your Foundation—awareness, self-assessment, and commitment.'}
        </p>
      </div>

      <FoundationScreen initialFoundation={foundation} studentId={user.id} />
    </div>
  )
}
