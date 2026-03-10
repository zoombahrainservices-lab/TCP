'use client';

import { useState, useEffect } from 'react';
import { ScaleQuestionsBlock as ScaleQuestionsBlockType } from '@/lib/blocks/types';

interface ScaleQuestionsBlockProps extends ScaleQuestionsBlockType {
  responses?: Record<string, number>;
  onChange?: (responses: Record<string, number>) => void;
}

export default function ScaleQuestionsBlock({
  id,
  title,
  description,
  questions,
  questionNumbering,
  scale,
  scoring,
  responses,
  onChange,
}: ScaleQuestionsBlockProps) {
  const [localResponses, setLocalResponses] = useState<Record<string, number>>(responses || {});

  useEffect(() => {
    setLocalResponses(responses || {});
  }, [responses]);

  const handleRating = (questionId: string, rating: number) => {
    const newResponses = { ...localResponses, [questionId]: rating };
    setLocalResponses(newResponses);
    onChange?.(newResponses);
  };

  const calculateTotalScore = () => {
    const scores = Object.values(localResponses);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0);
  };

  const getScoreBand = () => {
    if (!scoring?.bands) return null;
    const total = calculateTotalScore();
    return scoring.bands.find(band => total >= band.range[0] && total <= band.range[1]);
  };

  // Normalize questions so each has an id (old templates may have only text).
  // Also de-dupe ids defensively so React keys + response mapping stay stable.
  const usedIds = new Set<string>();
  const normalizedQuestions = (questions || []).map((q: any, i: number) => {
    const baseId = (q?.id && String(q.id).trim()) ? String(q.id).trim() : `q${i + 1}`;
    let resolvedId = baseId;
    let suffix = 2;
    while (usedIds.has(resolvedId)) {
      resolvedId = `${baseId}_${suffix}`;
      suffix += 1;
    }
    usedIds.add(resolvedId);
    return {
      id: resolvedId,
      text: q?.text ?? '',
      number: q?.number != null && typeof q.number === 'number' ? q.number : undefined,
    };
  });

  const numbering = questionNumbering ?? 'auto';

  // Get display line for a question: avoid double numbering by stripping leading "N. " from text when we add a number
  const getQuestionLabel = (q: { text: string; number?: number }, index: number): string => {
    const textOnly = (q.text || '').replace(/^\d+\.\s*/, '').trim() || q.text || '';
    const num =
      numbering === 'none'
        ? null
        : numbering === 'custom' && q.number != null
          ? q.number
          : numbering === 'auto'
            ? index + 1
            : null;
    return num !== null ? `${num}. ${textOnly}` : textOnly;
  };

  const allQuestionsAnswered = normalizedQuestions.every(q => localResponses[q.id] !== undefined);
  const totalScore = calculateTotalScore();
  const scoreBand = getScoreBand();

  // Defensive: ensure scale exists (templates or old content may omit it)
  const safeScale = scale ?? {
    min: 1,
    max: 5,
    minLabel: 'Not at all',
    maxLabel: 'Completely',
  };

  return (
    <div className="scale-questions-block mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-[#ff6a38]/20">
      {title && (
        <h3 className="text-2xl font-bold text-[#2a2416] dark:text-white mb-3">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
      )}

      <div className="space-y-6">
        {normalizedQuestions.map((question, index) => (
          <div key={`${question.id}-${index}`} className="question-item">
            <p className="text-base font-medium text-[#2a2416] dark:text-white mb-3">
              {getQuestionLabel(question, index)}
            </p>
            
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                {safeScale.minLabel}
              </span>
              
              <div className="flex gap-2">
                {Array.from({ length: safeScale.max - safeScale.min + 1 }, (_, i) => i + safeScale.min).map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRating(question.id, value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      localResponses[question.id] === value
                        ? 'bg-[#ff6a38] border-[#ff6a38] text-white scale-110'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#ff6a38] hover:scale-105'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                {safeScale.maxLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {allQuestionsAnswered && scoring && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-[#2a2416] dark:text-white">
              Total Score:
            </span>
            <span className="text-2xl font-bold text-[#ff6a38]">
              {totalScore}
            </span>
          </div>
          
          {scoreBand && (
            <div className={`mt-4 p-4 rounded-lg border-l-4`} style={{ 
              backgroundColor: scoreBand.color ? `${scoreBand.color}20` : '#fef3c7',
              borderColor: scoreBand.color || '#f59e0b'
            }}>
              <h4 className="font-bold text-[#2a2416] dark:text-white mb-1">
                {scoreBand.label}
              </h4>
              {scoreBand.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {scoreBand.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
