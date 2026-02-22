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

  const allQuestionsAnswered = questions.every(q => localResponses[q.id] !== undefined);
  const totalScore = calculateTotalScore();
  const scoreBand = getScoreBand();

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
        {questions.map((question, index) => (
          <div key={question.id} className="question-item">
            <p className="text-base font-medium text-[#2a2416] dark:text-white mb-3">
              {index + 1}. {question.text}
            </p>
            
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                {scale.minLabel}
              </span>
              
              <div className="flex gap-2">
                {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => i + scale.min).map((value) => (
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
                {scale.maxLabel}
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
