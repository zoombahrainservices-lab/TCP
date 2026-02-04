'use client';

interface ChapterReportProps {
  chapterId: number;
  scoreBefore: number;
  scoreAfter: number;
  improvement: number;
  xpEarned: {
    completion: number;
    improvement: number;
    streak: number;
    total: number;
  };
}

export function ChapterReport({
  chapterId,
  scoreBefore,
  scoreAfter,
  improvement,
  xpEarned
}: ChapterReportProps) {
  const improvedBy = scoreBefore - scoreAfter; // Lower is better
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Chapter {chapterId} Complete!
      </h2>
      
      {/* Score Comparison */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">Before</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{scoreBefore}</div>
          </div>
          
          <div className="flex-1 mx-4 flex items-center justify-center">
            {improvedBy > 0 ? (
              <div className="text-green-600 dark:text-green-400 font-semibold">
                ↓ {improvedBy} points better
              </div>
            ) : improvedBy < 0 ? (
              <div className="text-red-600 dark:text-red-400 font-semibold">
                ↑ {Math.abs(improvedBy)} points
              </div>
            ) : (
              <div className="text-gray-500">→</div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">After</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{scoreAfter}</div>
          </div>
        </div>
      </div>
      
      {/* XP Breakdown */}
      <div className="space-y-2 mb-6">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          XP Earned:
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Completion</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">+{xpEarned.completion} XP</span>
        </div>
        
        {xpEarned.improvement > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Improvement</span>
            <span className="font-medium text-green-600 dark:text-green-400">+{xpEarned.improvement} XP</span>
          </div>
        )}
        
        {xpEarned.streak > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Streak Bonus</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">+{xpEarned.streak} XP</span>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-semibold">
          <span className="text-gray-900 dark:text-gray-100">Total</span>
          <span className="text-purple-600 dark:text-purple-400">+{xpEarned.total} XP</span>
        </div>
      </div>
      
      {improvedBy > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
          "Even small improvements matter"
        </div>
      )}
    </div>
  );
}
