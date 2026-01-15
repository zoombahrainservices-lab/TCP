interface ProgressBar30Props {
  completedDays: number[]
  currentDay: number
}

export default function ProgressBar30({ completedDays, currentDay }: ProgressBar30Props) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)

  const getDayStatus = (day: number) => {
    if (completedDays.includes(day)) return 'completed'
    if (day === currentDay) return 'current'
    return 'locked'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500'
      case 'current':
        return 'bg-blue-500 border-blue-600 ring-2 ring-blue-300'
      case 'locked':
        return 'bg-gray-300 border-gray-400'
      default:
        return 'bg-gray-300 border-gray-400'
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
      {days.map((day) => {
        const status = getDayStatus(day)
        return (
          <div
            key={day}
            className={`w-7 h-7 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${getStatusColor(
              status
            )}`}
            title={`Day ${day} - ${status}`}
            aria-label={`Day ${day} - ${status}`}
          >
            {/* Empty circle - status shown by color */}
          </div>
        )
      })}
    </div>
  )
}
