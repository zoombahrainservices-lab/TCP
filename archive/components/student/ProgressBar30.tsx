import Link from 'next/link'

type DayStatus = 'completed' | 'in-progress' | 'not-started'

interface ProgressBar30Props {
  completedDays: number[]
  inProgressDays: number[]
  suggestedDay: number
  dayStatuses: Record<number, DayStatus>
}

export default function ProgressBar30({ 
  completedDays, 
  inProgressDays, 
  suggestedDay, 
  dayStatuses 
}: ProgressBar30Props) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)

  const getStatusColor = (day: number) => {
    const status = dayStatuses[day]
    
    switch (status) {
      case 'completed':
        // Yellow filled circle (like the chain visual)
        return 'bg-yellow-400 border-yellow-400 text-gray-900'
      case 'in-progress':
        // Yellow filled circle for in-progress too
        return 'bg-yellow-400 border-yellow-400 text-gray-900'
      case 'not-started':
        // Gray outline with white interior
        return 'bg-white border-gray-300 text-gray-600'
      default:
        return 'bg-white border-gray-300 text-gray-600'
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
      {days.map((day) => {
        const status = dayStatuses[day]
        
        return (
          <Link key={day} href={`/student/day/${day}`}>
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center text-sm md:text-base font-bold transition-all cursor-pointer hover:scale-110 ${getStatusColor(day)}`}
              title={`Day ${day} - ${status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started'}`}
              aria-label={`Day ${day} - ${status}`}
            >
              {day}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
