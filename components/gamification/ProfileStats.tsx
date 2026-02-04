'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { XPDisplay } from './XPDisplay';
import { StreakDisplay } from './StreakDisplay';

interface ChapterScore {
  chapter_id: number;
  best_score: number | null;
  improvement: number | null;
}

interface XPLog {
  id: number;
  reason: string;
  amount: number;
  created_at: string;
}

interface GamificationData {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
}

interface ProfileStatsProps {
  gamification: GamificationData;
  chapterScores: ChapterScore[];
  recentXP: XPLog[];
}

export function ProfileStats({
  gamification,
  chapterScores,
  recentXP
}: ProfileStatsProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with XP & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <XPDisplay 
            currentXP={gamification.total_xp}
            level={gamification.level}
            showProgress={true}
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <StreakDisplay 
            currentStreak={gamification.current_streak}
            longestStreak={gamification.longest_streak}
          />
        </div>
      </div>
      
      {/* Chapter Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Chapter Progress
        </h3>
        
        {chapterScores.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No chapters completed yet. Start your journey!
          </p>
        ) : (
          <div className="space-y-3">
            {chapterScores.map((chapter) => (
              <div 
                key={chapter.chapter_id} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Chapter {chapter.chapter_id}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Score: {chapter.best_score !== null ? chapter.best_score : 'Not started'}
                  </div>
                </div>
                
                {chapter.improvement !== null && (
                  <div className={`flex items-center gap-1 ${
                    chapter.improvement > 0 ? 'text-green-600 dark:text-green-400' : 
                    chapter.improvement < 0 ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {chapter.improvement > 0 ? <TrendingUp className="w-4 h-4" /> :
                     chapter.improvement < 0 ? <TrendingDown className="w-4 h-4" /> :
                     <Minus className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {chapter.improvement > 0 ? '+' : ''}{chapter.improvement}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        
        {recentXP.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No activity yet. Complete your first step to earn XP!
          </p>
        ) : (
          <div className="space-y-2">
            {recentXP.map((log) => (
              <div 
                key={log.id} 
                className="flex justify-between items-center text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div>
                  <div className="font-medium capitalize text-gray-900 dark:text-gray-100">
                    {log.reason.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-semibold text-purple-600 dark:text-purple-400">
                  +{log.amount} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
