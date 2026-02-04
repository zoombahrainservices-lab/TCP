'use client';

import { getLevelThreshold } from '@/lib/gamification/math';

interface XPDisplayProps {
  currentXP: number;
  level: number;
  showProgress?: boolean;
}

export function XPDisplay({ 
  currentXP, 
  level, 
  showProgress = true 
}: XPDisplayProps) {
  const xpForCurrentLevel = getLevelThreshold(level);
  const xpForNextLevel = getLevelThreshold(level + 1);
  const xpInLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progress = (xpInLevel / xpNeededForNext) * 100;
  
  return (
    <div className="flex items-center gap-3">
      {/* Level Badge */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-lg shrink-0">
        {level}
      </div>
      
      {/* XP Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Level {level}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentXP.toLocaleString()} XP
        </div>
        
        {showProgress && (
          <div className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
