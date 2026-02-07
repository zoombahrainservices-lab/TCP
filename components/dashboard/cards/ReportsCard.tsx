'use client'

import Card from '../ui/Card'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function ReportsCard({
  xpThisWeek,
  skillImprovement,
  totalXP,
  weeklyXPData = [0, 0, 0, 0],
}: {
  xpThisWeek: number
  skillImprovement: number
  totalXP: number
  weeklyXPData?: number[]
}) {
  // Calculate max XP for scaling (ensure at least 1 to avoid division by zero)
  const maxXP = Math.max(...weeklyXPData, 1)
  
  // Generate bar heights as percentages
  const barHeights = weeklyXPData.map(xp => Math.max((xp / maxXP) * 100, 2)) // Min 2% for visibility
  
  // Generate SVG polyline points for trend lines
  const chartWidth = 320
  const chartHeight = 130
  const padding = 20
  const usableWidth = chartWidth - (padding * 2)
  const usableHeight = chartHeight - 20
  
  // Blue line (primary - actual XP)
  const blueLine = weeklyXPData.map((xp, i) => {
    const x = padding + (i * usableWidth / 3)
    const y = chartHeight - 10 - ((xp / maxXP) * usableHeight)
    return `${x},${y}`
  }).join(' ')
  
  // Orange line (secondary - slightly lower for visual variety)
  const orangeLine = weeklyXPData.map((xp, i) => {
    const x = padding + (i * usableWidth / 3)
    const adjustedXP = xp * 0.85 // 15% lower for secondary line
    const y = chartHeight - 10 - ((adjustedXP / maxXP) * usableHeight)
    return `${x},${y}`
  }).join(' ')

  return (
    <Card className="overflow-hidden h-full">
      <div className="relative p-6">
        {/* Subtle gradient wash */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 top-8 h-40 w-40 rounded-full bg-blue-50/50 blur-2xl" />
        </div>

        {/* Header */}
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300/30">
            <span className="text-2xl">🏆</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Reports</h2>
        </div>

        {/* Chart area */}
        <div className="relative mt-5 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/60">
          {/* Timeline labels */}
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>4w ago</span>
            <span>3w ago</span>
            <span>2w</span>
            <span>This Week</span>
          </div>

          {/* Chart container */}
          <div className="relative h-32 rounded-xl bg-white ring-1 ring-slate-200/60 overflow-hidden">
            {/* Y-axis labels */}
            <div className="absolute right-2 top-1 text-[10px] font-semibold text-slate-400">100</div>
            <div className="absolute right-2 top-1/4 text-[10px] font-semibold text-slate-400">80</div>
            <div className="absolute right-2 top-1/2 text-[10px] font-semibold text-slate-400">60</div>

            {/* Dynamic Bar chart (orange bars) */}
            <div className="absolute bottom-0 left-0 right-8 h-full flex items-end justify-around px-4 pb-1">
              {barHeights.map((height, i) => (
                <div
                  key={i}
                  className="w-4 rounded-t bg-gradient-to-t from-orange-400 to-orange-300 transition-all"
                  style={{ height: `${height}%` }}
                  title={`Week ${i + 1}: ${weeklyXPData[i]} XP`}
                />
              ))}
            </div>

            {/* Dynamic Line chart overlay */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 130" preserveAspectRatio="none">
              {/* Blue line (primary) */}
              <polyline
                points={blueLine}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Orange line (secondary) */}
              <polyline
                points={orangeLine}
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200/60">
              <div className="text-lg font-black text-orange-500">+{xpThisWeek}</div>
              <div className="text-xs font-semibold text-slate-500">XP This Week</div>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200/60">
              <div className="text-lg font-black text-orange-500">+{skillImprovement}</div>
              <div className="text-xs font-semibold text-slate-500">Skill Improvement</div>
            </div>
          </div>

          {/* Total XP box */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 py-3 ring-1 ring-blue-200/50">
            <div className="text-center">
              <span className="text-xl font-black text-slate-800">{totalXP}</span>
              <span className="ml-2 text-sm font-semibold text-slate-500">XP Total Earned</span>
            </div>
          </div>

          {/* PDF Reports Link */}
          <Link
            href="/reports"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-3 text-white text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <FileText className="w-4 h-4" />
            Download PDF Reports
          </Link>
        </div>
      </div>
    </Card>
  )
}
