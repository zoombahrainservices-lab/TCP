import Link from 'next/link'
import Image from 'next/image'

// Design system: one card × three emotional states
// Shadow: 0 8px 24px rgba(0,0,0,0.06) | Radius: 16-20px | Padding: 24-32px h, 20-28px v
const CARD_SHADOW = '0 8px 24px rgba(0,0,0,0.06)'
const CARD_RADIUS = '18px'
const CARD_PADDING = '24px 28px' // py-6 px-7 equivalent

export default function DashboardPage() {
  const userProgress = {
    currentChapter: 1,
    currentChapterTitle: 'From Stage Star to Silent Struggles',
    currentChapterSubtitle: "You'll learn why habits feel impossible",
    readTime: 7,
    streakDays: 3,
    progress: 20,
    sectionsCompleted: 1,
    totalSections: 5,
    chapterImage: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
    continueUrl: '/read/chapter-1',
  }

  const streakProgress = Math.min((userProgress.streakDays / 7) * 100, 100)

  return (
    <div className="min-h-full bg-[#F8F8F8] dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        {/* ——— Card 1: Today's Focus (Primary action) ——— */}
        <div
          className="rounded-[18px] overflow-hidden bg-gradient-to-br from-amber-50/90 to-orange-50/50 dark:from-amber-950/30 dark:to-amber-900/20"
          style={{
            boxShadow: CARD_SHADOW,
            padding: CARD_PADDING,
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon: one per card, rounded blob */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(247, 180, 24, 0.15)' }}
              >
                <span className="text-2xl" aria-hidden>📖</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {/* Level 1 — Card title */}
                <h2 className="text-[20px] sm:text-[22px] font-bold text-[var(--color-charcoal)] dark:text-white leading-tight">
                  Today&apos;s Focus
                </h2>
                {/* Level 2 — Support line */}
                <p className="text-[14px] sm:text-[15px] text-[var(--color-gray)] dark:text-gray-400">
                  Chapter {userProgress.currentChapter} · {userProgress.readTime} min read
                </p>
                {/* Level 3 — Micro: streak + progress bar */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-base" aria-hidden>🔥</span>
                  <span className="text-[13px] font-semibold text-[#f59e0b] dark:text-[#fbbf24]">
                    Day {userProgress.streakDays} streak
                  </span>
                  <div className="flex-1 max-w-[140px] h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#f59e0b] dark:bg-[#fbbf24] transition-all"
                      style={{ width: `${streakProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Primary CTA — only one per page, largest, strongest color */}
            <Link
              href={userProgress.continueUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[13px] bg-[#f59e0b] hover:bg-[#d97706] dark:bg-[#fbbf24] dark:hover:bg-[#f59e0b] text-white font-bold text-[15px] transition shadow-sm whitespace-nowrap"
            >
              Continue Chapter {userProgress.currentChapter}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Section header: 24px below card 1 */}
        <div className="mt-6 mb-2">
          <h3 className="text-[18px] sm:text-[20px] font-bold text-[var(--color-charcoal)] dark:text-white leading-tight">
            You&apos;re making progress. Keep going.
          </h3>
          <p className="text-[14px] sm:text-[15px] text-[var(--color-gray)] dark:text-gray-400 mt-0.5">
            Pick up where you left off.
          </p>
        </div>

        {/* ——— Card 2: Chapter Progress (Content + progress) ——— */}
        <div
          className="rounded-[18px] overflow-hidden mt-8 sm:mt-10 bg-gradient-to-br from-white/98 to-slate-50/99 dark:from-gray-900 dark:to-gray-900/95"
          style={{
            boxShadow: CARD_SHADOW,
            padding: CARD_PADDING,
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Left: image + pill */}
              <div className="relative w-full sm:w-52 h-44 sm:h-56 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <Image
                  src={userProgress.chapterImage}
                  alt={`Chapter ${userProgress.currentChapter}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 208px"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef3c7] dark:bg-[#f59e0b]/20 text-[#b45309] dark:text-[#fbbf24] text-[11px] font-bold uppercase tracking-wide">
                  In Progress
                </span>
              </div>

              {/* Right: text + progress */}
              <div className="flex-1 flex flex-col justify-center min-w-0 space-y-3">
                {/* Level 3 — pill + time */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] dark:bg-[#f59e0b]/20 text-[#b45309] dark:text-[#fbbf24] text-[11px] font-bold uppercase tracking-wide">
                    In Progress
                  </span>
                  <span className="inline-flex items-center gap-1 text-[13px] text-[var(--color-gray)] dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {userProgress.readTime} min
                  </span>
                </div>

                {/* Level 1 — title */}
                <h3 className="text-[18px] sm:text-[20px] font-bold text-[var(--color-charcoal)] dark:text-white leading-tight">
                  Chapter {userProgress.currentChapter}: {userProgress.currentChapterTitle}
                </h3>
                {/* Level 2 — support */}
                <p className="text-[14px] sm:text-[15px] text-[var(--color-gray)] dark:text-gray-400">
                  {userProgress.currentChapterSubtitle}
                </p>

                {/* Progress: bar + numeric reinforcement */}
                <div className="space-y-1.5">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#f59e0b] dark:bg-[#fbbf24] transition-all"
                      style={{ width: `${userProgress.progress}%` }}
                    />
                  </div>
                  <p className="text-[13px] text-[var(--color-gray)] dark:text-gray-400">
                    {userProgress.progress}% · {userProgress.sectionsCompleted} / {userProgress.totalSections} sections completed
                  </p>
                </div>

                {/* Level 3 — key takeaway with icon */}
                <div className="flex items-start gap-2 pt-1">
                  <svg className="w-4 h-4 text-[var(--color-gray)] dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-[13px] text-[var(--color-gray)] dark:text-gray-400">
                    = {userProgress.currentChapterSubtitle}
                  </p>
                </div>
              </div>
          </div>
        </div>

        {/* ——— Card 3: What's Next (Motivational preview) ——— */}
        <div
          className="rounded-[18px] overflow-hidden mt-8 sm:mt-10 bg-gradient-to-br from-blue-50/90 to-sky-50/60 dark:from-blue-950/30 dark:to-sky-900/20"
          style={{
            boxShadow: CARD_SHADOW,
            padding: CARD_PADDING,
          }}
        >
          <div className="flex items-start gap-4">
            {/* Icon: lightbulb in soft blob */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(253, 224, 71, 0.25)' }}
            >
              <span className="text-2xl" aria-hidden>💡</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              {/* Level 1 — card title */}
              <h3 className="text-[20px] sm:text-[22px] font-bold text-[var(--color-charcoal)] dark:text-white leading-tight">
                What&apos;s Next?
              </h3>
              {/* Level 2 — accent blue (distinct from muted gray) */}
              <h4 className="text-[15px] sm:text-[16px] font-semibold text-[#2563eb] dark:text-[#60a5fa]">
                Unlock Milestone Mindsets
              </h4>
              {/* Level 2 — muted explanation */}
              <p className="text-[14px] sm:text-[15px] text-[var(--color-gray)] dark:text-gray-400">
                Tomorrow, discover how small habit shifts can lead to big changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
