'use client'

import Card from '../ui/Card'
import type { IdentityResolutionData } from '@/app/actions/identity'

export default function IdentityResolutionCard({ identity }: { identity: IdentityResolutionData | null }) {
  const hasIdentity = !!identity && !!identity.identity.trim()

  return (
    <Card className="h-full">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-300 ring-1 ring-emerald-300/50">
            <span className="text-xl">🌱</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-slate-800">Who you&apos;re becoming</h2>
            <p className="text-xs text-slate-500">
              Your Chapter 1 identity resolution. A quick reminder when you log in.
            </p>
          </div>
        </div>

        {hasIdentity ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/70">
            <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
              Identity statement
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {identity!.identity}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/70">
            <p className="text-sm text-slate-700">
              You haven&apos;t written your identity resolution yet. Take 2 minutes to define who you&apos;re
              becoming.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

