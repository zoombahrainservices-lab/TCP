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
  const displayLogs = recentXP.slice(0, 5)

  return (
    <Card className="relative overflow-hidden">
      <div className="relative p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-sky-100/50 blur-3xl" />
        </div>

        <h2 className="relative text-2xl font-black text-slate-800 dark:text-slate-100">Recent Activity</h2>

        <div className="relative mt-4 space-y-2">
          {displayLogs.length === 0 ? (
            <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm p-5 ring-1 ring-slate-200/60 dark:ring-slate-600/40">
              <p className="text-slate-500 dark:text-slate-400">No activity yet. Complete your first step to earn XP!</p>
            </div>
          ) : (
            displayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-3 ring-1 ring-slate-200/60 dark:ring-slate-600/40"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 ring-1 ring-amber-200/60 shrink-0">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{formatReason(log.reason)}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-black text-orange-500">+{log.amount} XP</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
