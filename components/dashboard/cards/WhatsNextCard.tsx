export default function WhatsNextCard({
  currentChapter = 1,
  currentProgress = 0,
}: {
  currentChapter?: number
  currentProgress?: number
}) {
  const isLocked = currentProgress < 100
  const nextChapter = currentChapter + 1

  return (
    <div
      className={`rounded-[22px] bg-gradient-to-br shadow-[0_10px_35px_rgba(15,23,42,0.08)] ring-1 overflow-hidden transition-colors duration-300 ${
        isLocked
          ? 'from-slate-100/80 to-slate-50 dark:from-slate-900/60 dark:to-slate-900/40 ring-slate-300/40 dark:ring-slate-700'
          : 'from-[#e8f4f8] to-[#f0f8ff] dark:from-[#0a1628] dark:to-[#020617] ring-sky-200/40 dark:ring-slate-800'
      }`}
    >
      <div className="relative p-6">
        {!isLocked && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-sky-100/50 dark:bg-sky-900/20 blur-3xl" />
          </div>
        )}

        <div className="relative flex items-center gap-3 mb-4">
          {isLocked ? (
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0">
              <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          ) : (
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300/30 shrink-0">
              <span className="text-2xl sm:text-3xl">💡</span>
            </div>
          )}
          <h2 className="text-[clamp(1.25rem,3vw,1.5rem)] font-black text-slate-800 dark:text-slate-100">
            {isLocked ? 'Next Unlock' : "What's Next"}
          </h2>
        </div>

        <div
          className={`relative rounded-2xl p-5 ring-1 transition-colors ${
            isLocked
              ? 'bg-white/40 dark:bg-slate-800/40 ring-slate-200/60 dark:ring-slate-700'
              : 'bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm ring-slate-200/60 dark:ring-slate-800'
          }`}
        >
          <h3
            className={`text-[clamp(1rem,2.5vw,1.25rem)] font-black leading-tight ${
              isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-blue-600 dark:text-blue-300'
            }`}
          >
            {isLocked ? `Chapter ${nextChapter}` : 'Advanced Frameworks'}
          </h3>
          <p
            className={`mt-2 text-[clamp(13px,2vw,14px)] leading-relaxed ${
              isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-200'
            }`}
          >
            {isLocked
              ? `Complete Chapter ${currentChapter} to unlock the next chapter and new communication tools.`
              : 'Discover how small habit shifts can lead to big changes in how people hear you.'}
          </p>

          {isLocked && (
            <div className="mt-4 flex items-center gap-2 text-[clamp(12px,2vw,13px)] font-semibold text-amber-600 dark:text-amber-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{100 - currentProgress}% until unlock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
