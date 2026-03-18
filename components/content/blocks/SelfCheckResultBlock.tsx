'use client';

import { SelfCheckResultBlock as SelfCheckResultBlockType } from '@/lib/blocks/types';

export default function SelfCheckResultBlock({
  title = 'Self-Check Results',
  subtitle = 'This is your starting point for this chapter—not your ending point.',
  message = 'Use these results to guide your focus as you work through the chapter content.',
  styles = {},
}: SelfCheckResultBlockType) {
  return (
    <div 
      className="self-check-result-block max-w-3xl mx-auto py-8 px-6 rounded-lg"
      style={{
        backgroundColor: styles.containerBgColor || undefined
      }}
    >
      {/* Title */}
      {title && (
        <h2 
          className="text-3xl font-bold mb-4 text-center"
          style={{ color: styles.titleColor || undefined }}
        >
          {title}
        </h2>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p 
          className="text-lg text-center mb-6"
          style={{ color: styles.subtitleColor || undefined }}
        >
          {subtitle}
        </p>
      )}

      {/* Message */}
      {message && (
        <p 
          className="text-base leading-relaxed text-center"
          style={{ color: styles.messageTextColor || undefined }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
