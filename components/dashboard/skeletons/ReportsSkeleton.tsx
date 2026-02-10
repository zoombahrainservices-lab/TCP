export default function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Streak Card Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* Reports Card Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  )
}
