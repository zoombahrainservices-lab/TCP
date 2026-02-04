import Link from 'next/link'
import Image from 'next/image'

// Shared card shadow: soft, wide, low-contrast (Duolingo principle)
const CARD_SHADOW = '0 8px 24px rgba(0,0,0,0.06)'

// Base padding: horizontal 24-32px, vertical 20-28px
const CARD_PADDING = 'px-6 sm:px-8 py-5 sm:py-7'
// Border radius: 16-20px
const CARD_RADIUS = 'rounded-[18px]'
// Progress bar: 6-8px height, rounded ends
const PROGRESS_BAR_HEIGHT = 'h-2' // 8px
// Typography: Level 1 = 20-24px bold, Level 2 = 14-16px muted, Level 3 = micro
const TEXT_TITLE = 'text-xl sm:text-2xl font-bold text-[var(--color-charcoal)] dark:text-white'
const TEXT_SUPPORT = 'text-sm sm:text-base text-gray-500 dark:text-gray-400'
const TEXT_MICRO = 'text-xs text-gray-500 dark:text-gray-400'

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
    continueUrl: '/read/chapter-1'
  }

  return (
    <div className="min-h-full bg-[var(--color-offwhite)] dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header — 24px to first card */}
        <div className="mb-6">
          <h1 className={`${TEXT_TITLE} text-[20px] sm:text-[22px]`}>
            You&apos;re making progress. Keep going.
          </h1>
          <p className={`${TEXT_SUPPORT} mt-1`}>
            Pick up where you left off.
          </p>
        </div>

        {/* Spacing: card → card 32–40px */}
        <div className="space-y-8 sm:space-y-9">
          
          {/* ——— Card 1: Today's Focus (Primary action) ——— */}
          <div
            className={`${CARD_RADIUS} ${CARD_PADDING} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6`}
            style={{
              boxShadow: CARD_SHADOW,
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 191, 36, 0.04))'
            }}
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Anchor icon: one per card, rounded blob */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[rgba(249,115,22,0.15)]">
                <svg className="w-6 h-6 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <h2 className={`${TEXT_TITLE} leading-tight`}>
                  Today&apos;s Focus
                </h2>
                <p className={TEXT_SUPPORT}>
                  Chapter {userProgress.currentChapter} · {userProgress.readTime} min read
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-base" aria-hidden>🔥</span>
                  <span className={`${TEXT_MICRO} font-semibold text-[#f97316]`}>
                    Day {userProgress.streakDays} streak
                  </span>
                  <div className="flex-1 max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`${PROGRESS_BAR_HEIGHT} bg-[#f97316] rounded-full transition-all`}
                      style={{ width: `${Math.min(userProgress.streakDays * 15, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Primary CTA: only one per page, largest, strongest color */}
            <Link
              href={userProgress.continueUrl}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base rounded-xl transition whitespace-nowrap"
              style={{ boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}
            >
              Continue Chapter {userProgress.currentChapter}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* ——— Card 2: Chapter Progress (Content + progress) ——— */}
          <div
            className={`${CARD_RADIUS} overflow-hidden`}
            style={{
              boxShadow: CARD_SHADOW,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))'
            }}
          >
            <div className={`${CARD_PADDING} flex flex-col sm:flex-row gap-5 sm:gap-6`}>
              {/* Image thumbnail */}
              <div className="relative w-full sm:w-44 h-44 sm:h-52 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <Image
                  src={userProgress.chapterImage}
                  alt={`Chapter ${userProgress.currentChapter}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 176px"
                />
                {/* Status pill: 999px radius, soft orange, uppercase */}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f97316]/90 text-white rounded-full text-[10px] font-bold uppercase tracking-wide">
                  In Progress
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                {/* Top info: pill + clock + bookmark */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f97316]/90 text-white rounded-full text-[10px] font-bold uppercase">
                    In Progress
                  </span>
                  <span className={`${TEXT_MICRO} flex items-center gap-1`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {userProgress.readTime} min
                  </span>
                  <span className={`${TEXT_MICRO} flex items-center gap-1`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {userProgress.readTime} min
                  </span>
                </div>

                <h3 className={`${TEXT_TITLE} leading-tight`}>
                  Chapter {userProgress.currentChapter}: {userProgress.currentChapterTitle}
                </h3>
                <p className={TEXT_SUPPORT}>
                  {userProgress.currentChapterSubtitle}
                </p>

                {/* Progress: visual bar + numeric reinforcement */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`${TEXT_MICRO} font-semibold text-[var(--color-charcoal)] dark:text-white`}>
                      Progress
                    </span>
                    <span className={TEXT_MICRO}>
                      {userProgress.progress}% · {userProgress.sectionsCompleted} / {userProgress.totalSections} sections completed
                    </span>
                  </div>
                  <div className={`${PROGRESS_BAR_HEIGHT} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-[#f97316] rounded-full transition-all"
                      style={{ width: `${userProgress.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key takeaway: document icon + support text */}
                <div className="flex items-start gap-2 pt-1">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <p className={TEXT_SUPPORT}>
                    {userProgress.currentChapterSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ——— Card 3: What's Next (Anticipation) ——— */}
          <div
            className={`${CARD_RADIUS} ${CARD_PADDING} flex items-start gap-4`}
            style={{
              boxShadow: CARD_SHADOW,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 197, 253, 0.04))'
            }}
          >
            {/* Icon: lightbulb, soft blue blob */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[rgba(59,130,246,0.15)]">
              <span className="text-2xl" aria-hidden>💡</span>
            </div>
            <div className="flex-1 min-w-0">
              {/* Accent blue for this card's title */}
              <h3 className="text-xl sm:text-2xl font-bold text-[#2563eb] dark:text-[#93c5fd] leading-tight">
                Unlock Milestone Mindsets
              </h3>
              <p className={`${TEXT_SUPPORT} mt-2`}>
                Tomorrow, discover how small habit shifts can lead to big changes.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
