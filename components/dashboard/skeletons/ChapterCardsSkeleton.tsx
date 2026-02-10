export default function ChapterCardsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Today's Focus Card Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* In Progress Card Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg">
        <div className="flex gap-6">
          <div className="h-32 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* What's Next Card Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  )
}
