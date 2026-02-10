export default function LoadingAssessment() {
  return (
    <div className="bg-[var(--color-offwhite)] dark:bg-[#142A4A] min-h-screen flex">
      <main className="flex-1 max-w-4xl mx-auto w-full p-12">
        {/* Title skeleton */}
        <div className="space-y-4 mb-8">
          <div className="h-12 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>

        {/* Card skeleton */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6 mb-8">
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>

          {/* Callout skeleton */}
          <div className="bg-[#f7b418]/10 dark:bg-[#f7b418]/20 p-6 rounded-lg">
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-4/5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-14 w-full bg-[#f7b418] rounded-xl animate-pulse"></div>
      </main>
    </div>
  );
}
