import Link from 'next/link'

interface DayCardProps {
  dayNumber: number
  title: string
  status: 'completed' | 'in-progress' | 'not-started'
  onClick?: () => void
}

export default function DayCard({ dayNumber, title, status }: DayCardProps) {
  const isCompleted = status === 'completed'
  const isInProgress = status === 'in-progress'

  const content = (
    <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 transition-all hover:shadow-md hover:border-blue-300 cursor-pointer">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCompleted ? 'bg-green-500' : isInProgress ? 'bg-yellow-500' : 'bg-gray-200'
          }`}>
            {isCompleted ? (
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-sm font-semibold text-gray-500">
              Day {dayNumber} {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : ''}
            </div>
            <div className="text-sm md:text-base text-gray-900 truncate">{title}</div>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )

  return (
    <Link href={`/student/day/${dayNumber}`}>
      {content}
    </Link>
  )
}
