'use client'

import Card from '../ui/Card'

export type XPLogRow = {
  id: number
  reason: string
  amount: number
  created_at: string
}

function formatReason(reason: string): string {
  return reason
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export default function RecentActivityProfileCard({
  recentXP,
}: {
  recentXP: XPLogRow[]
}) {
  const displayLogs = recentXP.slice(0, 4)

  return (
    <Card className="relative overflow-hidden">
      <div className="relative p-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-sky-100/50 blur-3xl" />
        </div>

        <h2 className="relative text-xl font-black text-slate-800 dark:text-slate-100">Recent Activity</h2>

        <div className="relative mt-3 space-y-1.5">
          {displayLogs.length === 0 ? (
            <div className="rounded-xl bg-white/70 p-4 ring-1 ring-slate-200/60 backdrop-blur-sm dark:bg-slate-800/50 dark:ring-slate-600/40">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No activity yet. Complete your first step to earn XP!
              </p>
            </div>
          ) : (
            displayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 ring-1 ring-slate-200/60 backdrop-blur-sm dark:bg-slate-800/50 dark:ring-slate-600/40"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 ring-1 ring-amber-200/60">
                    <span className="text-base">🏆</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {formatReason(log.reason)}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-black text-orange-500">+{log.amount} XP</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
