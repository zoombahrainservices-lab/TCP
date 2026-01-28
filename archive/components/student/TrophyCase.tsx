'use client'

interface TrophyCaseProps {
  records: Array<{
    day_number: number
    completed: boolean
    updated_at: string
  }>
}

export default function TrophyCase({ records }: TrophyCaseProps) {
  const completedDays = records.filter(r => r.completed).map(r => r.day_number)
  const totalCompleted = completedDays.length

  // Zone completion badges
  const zones = [
    { id: 1, name: 'Focus Chamber', days: [1, 7], icon: '🔴' },
    { id: 2, name: 'Connection Hub', days: [8, 14], icon: '🟠' },
    { id: 3, name: 'Alliance Forge', days: [15, 21], icon: '🟡' },
    { id: 4, name: 'Influence Vault', days: [22, 28], icon: '🟢' },
    { id: 5, name: 'Mastery Peak', days: [29, 30], icon: '🔵' }
  ]

  const zoneBadges = zones.map(zone => {
    const zoneDays = Array.from({ length: zone.days[1] - zone.days[0] + 1 }, (_, i) => zone.days[0] + i)
    const completed = zoneDays.filter(d => completedDays.includes(d)).length
    const isComplete = completed === zoneDays.length
    return { ...zone, completed, total: zoneDays.length, isComplete }
  })

  // Milestone badges
  const milestones = [
    { days: 1, name: 'First Mission', icon: '🎯' },
    { days: 7, name: 'Zone 1 Master', icon: '🏅' },
    { days: 14, name: 'Halfway to Zone 3', icon: '⭐' },
    { days: 15, name: 'Zone 3 Entry', icon: '🔥' },
    { days: 21, name: 'Zone 3 Complete', icon: '💪' },
    { days: 30, name: 'All Missions Complete', icon: '👑' }
  ]

  const earnedMilestones = milestones.filter(m => completedDays.includes(m.days))

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-bold text-[var(--color-charcoal)] mb-1">
          {totalCompleted} / 30
        </div>
        <div className="text-sm text-gray-600">Missions Completed</div>
      </div>

      {/* Zone Completion Badges */}
      {zoneBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Zone Completion</h3>
          <div className="grid grid-cols-2 gap-2">
            {zoneBadges.map((zone) => (
              <div
                key={zone.id}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  zone.isComplete
                    ? 'bg-[var(--color-amber)]/10 border-[var(--color-amber)]'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
                title={zone.isComplete ? `${zone.name} Complete!` : `${zone.completed}/${zone.total} days completed`}
              >
                <div className="text-2xl mb-1">{zone.icon}</div>
                <div className={`text-xs font-medium ${zone.isComplete ? 'text-[var(--color-charcoal)]' : 'text-gray-500'}`}>
                  {zone.name}
                </div>
                {!zone.isComplete && (
                  <div className="text-xs text-gray-400 mt-1">
                    {zone.completed}/{zone.total}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Badges */}
      {earnedMilestones.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Milestones</h3>
          <div className="flex flex-wrap gap-2">
            {earnedMilestones.map((milestone) => (
              <div
                key={milestone.days}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--color-amber)]/10 border border-[var(--color-amber)] rounded-lg"
                title={`Day ${milestone.days}: ${milestone.name}`}
              >
                <span className="text-xl">{milestone.icon}</span>
                <span className="text-xs font-medium text-[var(--color-charcoal)]">
                  {milestone.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCompleted === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-sm">Complete missions to earn badges!</p>
        </div>
      )}
    </div>
  )
}
