import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  // TODO: Replace with real user progress data from database
  const userProgress = {
    currentChapter: 1,
    currentChapterTitle: 'From Stage Star to Silent Struggles',
    currentChapterSubtitle: "You'll learn why habits feel impossible",
    readTime: 7,
    streakDays: 3,
    progress: 20, // percentage
    sectionsCompleted: 1,
    totalSections: 5,
    chapterImage: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    continueUrl: '/read/chapter-1'
  }

  return (
    <div className="min-h-full bg-[var(--color-offwhite)] dark:bg-[#142A4A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Today's Focus Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-amber)]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-[var(--color-charcoal)] dark:text-white mb-1">
                  Today&apos;s Focus
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-400">
                    Chapter {userProgress.currentChapter}
                  </p>
                  <span className="text-[var(--color-gray)] dark:text-gray-500">·</span>
                  <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-400">
                    {userProgress.readTime} min read
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">🔥</span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-amber)]">
                    Day {userProgress.streakDays} streak
                  </span>
                  <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-amber)] rounded-full transition-all"
                      style={{ width: `${Math.min(userProgress.streakDays * 10, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Link
              href={userProgress.continueUrl}
              className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-[var(--color-amber)] hover:bg-[#e5a616] text-[var(--color-charcoal)] rounded-xl font-bold text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Continue Chapter {userProgress.currentChapter}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Progress Message */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-charcoal)] dark:text-white">
            You&apos;re making progress. Keep going.
          </h3>
          <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-400">
            Pick up where you left off.
          </p>
        </div>

        {/* Chapter Progress Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Chapter Image */}
            <div className="relative w-full sm:w-48 h-48 sm:h-56 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
              <Image
                src={userProgress.chapterImage}
                alt={`Chapter ${userProgress.currentChapter}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-amber)] text-[var(--color-charcoal)] rounded-lg text-xs font-bold uppercase tracking-wide">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  In Progress
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg text-xs font-semibold text-[var(--color-gray)] dark:text-gray-300">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {userProgress.readTime} min
                </span>
              </div>
            </div>

            {/* Chapter Info */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--color-charcoal)] dark:text-white mb-2 leading-tight">
                  Chapter {userProgress.currentChapter}: {userProgress.currentChapterTitle}
                </h3>
                <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-400 mb-4">
                  {userProgress.currentChapterSubtitle}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[var(--color-charcoal)] dark:text-white">Progress</span>
                    <span className="text-[var(--color-gray)] dark:text-gray-400">
                      {userProgress.progress}% · {userProgress.sectionsCompleted}/{userProgress.totalSections} sections completed
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-amber)] rounded-full transition-all"
                      style={{ width: `${userProgress.progress}%` }}
                    />
                  </div>
                </div>

                {/* Learning Objective */}
                <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <svg className="w-4 h-4 text-[var(--color-gray)] dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xs sm:text-sm text-[var(--color-gray)] dark:text-gray-300">
                    {userProgress.currentChapterSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-[#E8F4F8] dark:bg-[#1a3a4a] rounded-2xl p-5 sm:p-6 border border-[#b8dce8] dark:border-[#2a4a5a]">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-charcoal)] dark:text-white mb-4">
            What&apos;s Next?
          </h3>
          
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#ffd93d]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl">💡</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-[var(--color-charcoal)] dark:text-white mb-1">
                Unlock Milestone Mindsets
              </h4>
              <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-300">
                Tomorrow, discover how small habit shifts can lead to big changes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
