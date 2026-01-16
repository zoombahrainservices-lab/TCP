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
    const isSuggested = day === suggestedDay
    
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500 text-white'
      case 'in-progress':
        return 'bg-yellow-500 border-yellow-600 text-white'
      case 'not-started':
        return isSuggested 
          ? 'bg-blue-500 border-blue-600 ring-2 ring-blue-300 text-white'
          : 'bg-gray-200 border-gray-300 text-gray-600'
      default:
        return 'bg-gray-200 border-gray-300 text-gray-600'
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
      {days.map((day) => {
        const status = dayStatuses[day]
        const isSuggested = day === suggestedDay
        const displayStatus = isSuggested ? 'suggested' : status
        
        return (
          <Link key={day} href={`/student/day/${day}`}>
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-xs md:text-sm font-bold transition-all cursor-pointer hover:scale-110 ${getStatusColor(day)}`}
              title={`Day ${day} - ${displayStatus}`}
              aria-label={`Day ${day} - ${displayStatus}`}
            >
              {day}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
