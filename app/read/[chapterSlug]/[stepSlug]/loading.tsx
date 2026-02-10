export default function LoadingStep() {
  return (
    <div className="fixed inset-0 bg-[var(--color-offwhite)] dark:bg-[#142A4A] flex flex-col">
      {/* Header skeleton */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Progress bar skeleton */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <div className="h-full w-0 bg-[var(--color-blue)]"></div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col lg:flex-row">
            {/* Image section skeleton */}
            <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:min-h-screen bg-gray-300 dark:bg-gray-800 animate-pulse"></div>

            {/* Content section skeleton */}
            <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] p-6 sm:p-8 lg:p-12">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Step title skeleton */}
                <div className="h-4 w-32 bg-[#ff6a38]/30 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-6"></div>

                {/* Content blocks skeleton */}
                <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>

                {/* Prompt/input skeleton */}
                <div className="mt-8 p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                  <div className="h-32 w-full bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation footer skeleton */}
        <div className="flex-shrink-0 p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-[#ff6a38] rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
