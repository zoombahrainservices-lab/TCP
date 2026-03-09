'use client';

import { IdentityResolutionGuidanceBlock as BlockType } from '@/lib/blocks/types';
import { Sprout } from 'lucide-react';

export default function IdentityResolutionGuidanceBlock({
  title,
  subtitle,
  exampleText,
}: BlockType) {
  return (
    <div className="identity-resolution-guidance mb-6 p-6 rounded-xl border border-cyan-200/80 bg-[#e0f7fa] dark:bg-cyan-900/20 dark:border-cyan-700/50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            {subtitle}
          </p>
          <div className="rounded-lg bg-gray-100/90 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4">
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {exampleText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
