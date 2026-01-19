import { requireAuth } from '@/lib/auth/guards'
import { getStudentProgress } from '@/app/actions/student'
import ZoneMap, { Zone } from '@/components/student/ZoneMap'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default async function ZonesPage() {
  const user = await requireAuth('student')
  const progress = await getStudentProgress(user.id)

  // Calculate zone data
  const zones: Zone[] = [
    {
      id: 1,
      name: 'The Focus Chamber',
      icon: '🔴',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      days: [1, 7],
      unlocked: true,
      completed: progress.completedDays.filter(d => d >= 1 && d <= 7).length,
      total: 7
    },
    {
      id: 2,
      name: 'The Connection Hub',
      icon: '🟠',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      days: [8, 14],
      unlocked: progress.completedDays.includes(7),
      completed: progress.completedDays.filter(d => d >= 8 && d <= 14).length,
      total: 7
    },
    {
      id: 3,
      name: 'The Alliance Forge',
      icon: '🟡',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      days: [15, 21],
      unlocked: progress.completedDays.includes(14),
      completed: progress.completedDays.filter(d => d >= 15 && d <= 21).length,
      total: 7
    },
    {
      id: 4,
      name: 'The Influence Vault',
      icon: '🟢',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      days: [22, 28],
      unlocked: progress.completedDays.includes(21),
      completed: progress.completedDays.filter(d => d >= 22 && d <= 28).length,
      total: 7
    },
    {
      id: 5,
      name: 'The Mastery Peak',
      icon: '🔵',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      days: [29, 30],
      unlocked: progress.completedDays.includes(28),
      completed: progress.completedDays.filter(d => d >= 29 && d <= 30).length,
      total: 2
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="headline-xl text-[var(--color-charcoal)] mb-2">🗺️ Mission Map</h1>
          <p className="text-[var(--color-gray)]">Explore all 5 zones of your training journey</p>
        </div>

        {/* Zone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {zones.map((zone) => {
            const isFullyCompleted = zone.completed === zone.total
            const completionPercentage = Math.round((zone.completed / zone.total) * 100)

            return (
              <Card
                key={zone.id}
                className={`relative overflow-hidden transition-all ${
                  zone.unlocked
                    ? `${zone.bgColor} ${zone.borderColor} border-2 hover:shadow-xl hover:scale-105`
                    : 'bg-gray-100 border-gray-300 border-2 opacity-60'
                } ${
                  isFullyCompleted ? 'ring-2 ring-[var(--color-amber)]' : ''
                }`}
              >
                {/* Lock Overlay */}
                {!zone.unlocked && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-600">Locked</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Complete Day {zone.days[0] - 1} to unlock
                      </p>
                    </div>
                  </div>
                )}

                {/* Zone Content */}
                <div className="relative z-0 p-6">
                  {/* Zone Icon */}
                  <div className="text-5xl mb-4 text-center">{zone.icon}</div>

                  {/* Zone Name */}
                  <h2 className={`headline-md text-center mb-2 ${zone.unlocked ? zone.color : 'text-gray-500'}`}>
                    {zone.name}
                  </h2>

                  {/* Day Range */}
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Days {zone.days[0]}-{zone.days[1]}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {zone.completed}/{zone.total} ({completionPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isFullyCompleted ? 'bg-[var(--color-amber)]' : `${zone.bgColor.replace('50', '400')}`
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Enter Zone Button */}
                  {zone.unlocked ? (
                    <Link href={`/student/zone/${zone.id}`}>
                      <Button
                        variant={isFullyCompleted ? 'success' : 'primary'}
                        fullWidth
                        className="mt-2"
                      >
                        {isFullyCompleted ? '✓ Zone Complete' : `Enter Zone ${zone.id}`}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      fullWidth
                      className="mt-2"
                      disabled
                    >
                      Locked
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link href="/student">
            <Button variant="secondary">
              ← Back to Command Center
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
