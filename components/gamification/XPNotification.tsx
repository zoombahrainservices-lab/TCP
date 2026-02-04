'use client';

import { toast } from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

export type XPReasonCode =
  | 'awarded'
  | 'already_awarded'
  | 'first_time'
  | 'repeat_completion'
  | 'no_improvement'
  | 'streak_continued'
  | 'milestone'
  | 'daily_activity';

const REASON_COPY: Record<XPReasonCode, string> = {
  awarded: '+{xp} XP',
  already_awarded: 'Already completed — no XP',
  first_time: '+{xp} XP',
  repeat_completion: 'Already completed — no XP',
  no_improvement: 'Good practice — no improvement XP',
  streak_continued: 'Streak continued +5 XP',
  milestone: 'Milestone bonus +{xp} XP',
  daily_activity: 'Daily activity +10 XP',
};

interface XPNotificationOptions {
  levelUp?: boolean;
  newLevel?: number;
  multiplier?: number;
  reasonCode?: XPReasonCode;
  milestoneDays?: number;
}

export function showXPNotification(
  xpGained: number,
  reason: string,
  options?: XPNotificationOptions
) {
  const reasonCode = options?.reasonCode
  const copy = reasonCode
    ? REASON_COPY[reasonCode]?.replace('{xp}', String(xpGained)) || reason
    : reason

  const message = options?.levelUp
    ? `Level ${options.newLevel}!`
    : xpGained > 0
      ? `+${xpGained} XP`
      : reasonCode === 'repeat_completion' || reasonCode === 'already_awarded'
        ? 'Already completed — no XP'
        : ''

  const description = options?.multiplier
    ? `${copy} (${options.multiplier}x streak bonus)`
    : xpGained > 0 || reasonCode === 'repeat_completion' || reasonCode === 'already_awarded'
      ? copy
      : reason

  if (!message && !description) return

  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {message || description}
            </p>
            {message && description && message !== description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  ), {
    duration: 3000,
    position: 'top-center',
  });
}

