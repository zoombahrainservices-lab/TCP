'use client';

import { useState, useEffect } from 'react';
import type { MCQBlock as MCQBlockType } from '@/lib/blocks/types';
import { Check, X, Circle } from 'lucide-react';

interface MCQBlockProps extends MCQBlockType {
  responses?: Record<string, string>; // questionId -> selectedOptionId
  onChange?: (responses: Record<string, string>) => void;
}

export default function MCQBlock({
  id,
  title,
  description,
  questions,
  scoring,
  responses,
  onChange,
}: MCQBlockProps) {
  const [localResponses, setLocalResponses] = useState<Record<string, string>>(responses || {});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setLocalResponses(responses || {});
  }, [responses]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const newResponses = { ...localResponses, [questionId]: optionId };
    setLocalResponses(newResponses);
    onChange?.(newResponses);
  };

  const calculateScore = () => {
    let correctCount = 0;
    let totalGraded = 0;

    questions.forEach(question => {
      if (question.correctOptionId) {
        totalGraded++;
        if (localResponses[question.id] === question.correctOptionId) {
          correctCount++;
        }
      }
    });

    return { correctCount, totalGraded };
  };

  const getScoreBand = () => {
    if (!scoring?.bands) return null;
    const { correctCount } = calculateScore();
    return scoring.bands.find(band => correctCount >= band.range[0] && correctCount <= band.range[1]);
  };

  const allQuestionsAnswered = questions.every(q => localResponses[q.id] !== undefined);
  const { correctCount, totalGraded } = calculateScore();
  const scoreBand = getScoreBand();
  const hasGradedQuestions = questions.some(q => q.correctOptionId);

  const getOptionStyle = (questionId: string, optionId: string, isCorrectOption: boolean) => {
    const isSelected = localResponses[questionId] === optionId;
    
    if (!showResults) {
      return isSelected
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700';
    }

    // Show results
    if (isCorrectOption) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    
    if (isSelected && !isCorrectOption) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }

    return 'border-gray-300 dark:border-gray-600 opacity-60';
  };

  const getOptionIcon = (questionId: string, optionId: string, isCorrectOption: boolean) => {
    const isSelected = localResponses[questionId] === optionId;

    if (!showResults) {
      return isSelected ? (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      ) : (
        <Circle className="w-5 h-5 text-gray-400" />
      );
    }

    // Show results
    if (isCorrectOption) {
      return (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      );
    }

    if (isSelected && !isCorrectOption) {
      return (
        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <X className="w-3 h-3 text-white" />
        </div>
      );
    }

    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="my-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {title && (
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
      )}

      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <div key={question.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <p className="text-base font-medium mb-4 text-gray-900 dark:text-white">
              {qIndex + 1}. {question.text}
            </p>

            <div className="space-y-2">
              {question.options.map((option) => {
                const isCorrectOption = question.correctOptionId === option.id;
                const optionStyle = getOptionStyle(question.id, option.id, isCorrectOption);
                const isSelected = localResponses[question.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => !showResults && handleOptionSelect(question.id, option.id)}
                    disabled={showResults}
                    className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${optionStyle} ${
                      showResults ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    {getOptionIcon(question.id, option.id, isCorrectOption)}
                    <span className={`text-left flex-1 ${
                      isSelected ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {allQuestionsAnswered && hasGradedQuestions && scoring?.showResults && !showResults && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowResults(true)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Show Results
          </button>
        </div>
      )}

      {showResults && hasGradedQuestions && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Score: {correctCount} / {totalGraded}
            </p>
            {((correctCount / totalGraded) * 100).toFixed(0)}% Correct
          </div>

          {scoreBand && (
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: scoreBand.color 
                  ? `${scoreBand.color}20` 
                  : 'rgba(59, 130, 246, 0.1)' 
              }}
            >
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                {scoreBand.label}
              </p>
              {scoreBand.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {scoreBand.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {allQuestionsAnswered && !hasGradedQuestions && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-medium">Responses recorded</span>
          </div>
        </div>
      )}
    </div>
  );
}
