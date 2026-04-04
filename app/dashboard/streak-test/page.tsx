'use client'

import { useState } from 'react'
import StreakCard from '@/components/dashboard/cards/StreakCard'

export default function StreakTestPage() {
  const [currentStreak, setCurrentStreak] = useState(3)
  const [longestStreak, setLongestStreak] = useState(5)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">
            Streak Celebration Test
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Use the controls below to change the streak. When the streak goes up, the celebration
            runs from the streak card (same as on the dashboard).
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              type="button"
              onClick={() => {
                setCurrentStreak((prev) => prev + 1)
                if (currentStreak + 1 > longestStreak) {
                  setLongestStreak(currentStreak + 1)
                }
              }}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
            >
              Increase Streak (+1)
            </button>
            <button
              type="button"
              onClick={() => setCurrentStreak((prev) => Math.max(0, prev - 1))}
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
            >
              Decrease Streak (-1)
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStreak(0)
              }}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
            >
              Reset Streak
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Current Streak
              </div>
              <div className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {currentStreak}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Longest Streak
              </div>
              <div className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {longestStreak}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
            💡 How it works
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>
              <strong>Automatic:</strong> Celebration shows when streak increases
            </li>
            <li>
              <strong>Once per session:</strong> First time you see your streak today
            </li>
            <li>
              <strong>3 seconds:</strong> Animation plays then auto-dismisses
            </li>
            <li>
              <strong>Fullscreen:</strong> Overlay with blur background
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
