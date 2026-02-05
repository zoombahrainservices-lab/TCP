'use client'

export default function WhatsNextCard() {
  return (
    <div className="rounded-[22px] bg-gradient-to-br from-[#e8f4f8] to-[#f0f8ff] dark:bg-[#020617] dark:bg-none shadow-[0_10px_35px_rgba(15,23,42,0.08)] ring-1 ring-sky-200/40 dark:ring-slate-800 overflow-hidden transition-colors duration-300">
      <div className="relative p-6">
        {/* Subtle gradient wash */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-sky-100/50 blur-3xl" />
        </div>

        <h2 className="relative text-2xl font-black text-slate-800 dark:text-slate-100">What&apos;s Next?</h2>

        <div className="relative mt-4 flex items-start gap-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm p-5 ring-1 ring-slate-200/60 dark:ring-slate-800">
          {/* Lightbulb icon */}
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300/30 shrink-0">
            <span className="text-3xl">💡</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-300">Unlock Milestone Mindsets</h3>
            <p className="mt-1.5 text-slate-600 dark:text-slate-200 leading-relaxed">
              Tomorrow, discover how small habit shifts can lead to big changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
