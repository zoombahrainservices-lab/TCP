'use client';

import { Flame } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ 
  currentStreak, 
  longestStreak 
}: StreakDisplayProps) {
  const isActiveStreak = currentStreak > 0;
  const nextMilestone = [3, 7, 30, 100].find(m => m > currentStreak) || null;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
      <Flame 
        className={`w-5 h-5 shrink-0 ${isActiveStreak ? 'text-orange-500' : 'text-gray-400'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {currentStreak} Day Streak
        </div>
        {nextMilestone && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {nextMilestone - currentStreak} days to next milestone
          </div>
        )}
      </div>
      {longestStreak > currentStreak && (
        <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 shrink-0">
          Best: {longestStreak}
        </div>
      )}
    </div>
  );
}
