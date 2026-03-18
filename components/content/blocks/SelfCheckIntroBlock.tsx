'use client';

import { SelfCheckIntroBlock as SelfCheckIntroBlockType } from '@/lib/blocks/types';

export default function SelfCheckIntroBlock({
  title = 'Self-Check',
  subtitle = 'Take a quick snapshot of where you are in this chapter.',
  body1 = 'This check is just for you. Answer based on how things feel right now, not how you wish they were.',
  body2 = "It's not a test or a grade. It's a baseline for this chapter so you can see your progress as you move through the lessons.",
  highlightTitle = "You'll rate 5 statements from 1 to 7.",
  highlightBody = "Takes about a minute. Your score shows which zone you're in and what to focus on next.",
  questionsTitle,
  questionsSubtitle,
  styles = {},
}: SelfCheckIntroBlockType) {
  return (
    <div className="self-check-intro-block max-w-3xl mx-auto py-8 px-4">
      {/* Title */}
      {title && (
        <h1 
          className="text-4xl font-bold mb-4 text-center"
          style={{ color: styles.titleColor || undefined }}
        >
          {title}
        </h1>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p 
          className="text-xl text-center mb-8"
          style={{ color: styles.subtitleColor || undefined }}
        >
          {subtitle}
        </p>
      )}

      {/* Body Paragraphs */}
      <div className="space-y-4 mb-8">
        {body1 && (
          <p 
            className="text-base leading-relaxed"
            style={{ color: styles.bodyTextColor || undefined }}
          >
            {body1}
          </p>
        )}
        {body2 && (
          <p 
            className="text-base leading-relaxed"
            style={{ color: styles.bodyTextColor || undefined }}
          >
            {body2}
          </p>
        )}
      </div>

      {/* Highlight Box */}
      {(highlightTitle || highlightBody) && (
        <div 
          className="p-6 rounded-lg border-l-4 mb-6"
          style={{
            backgroundColor: styles.highlightBgColor || '#fef3c7',
            borderColor: styles.highlightBgColor || '#f59e0b',
            color: styles.highlightTextColor || undefined
          }}
        >
          {highlightTitle && (
            <h3 
              className="font-bold text-lg mb-2"
              style={{ color: styles.highlightTitleColor || undefined }}
            >
              {highlightTitle}
            </h3>
          )}
          {highlightBody && (
            <p style={{ color: styles.highlightTextColor || undefined }}>
              {highlightBody}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
