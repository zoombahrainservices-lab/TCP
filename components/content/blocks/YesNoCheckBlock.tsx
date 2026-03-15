'use client';

import { useState, useEffect } from 'react';
import { YesNoCheckBlock as YesNoCheckBlockType } from '@/lib/blocks/types';

type YesNoValue = 'yes' | 'no' | 'not_sure';

interface YesNoCheckBlockProps extends YesNoCheckBlockType {
  // Allow legacy boolean responses as well as new tri-state values.
  responses?: Record<string, YesNoValue | boolean>;
  onChange?: (responses: Record<string, YesNoValue>) => void;
}

export default function YesNoCheckBlock({
  id,
  title,
  statements,
  scoring,
  responses,
  onChange,
}: YesNoCheckBlockProps) {
  const normalizeIncoming = (raw?: Record<string, YesNoValue | boolean>): Record<string, YesNoValue> => {
    if (!raw) return {};
    const result: Record<string, YesNoValue> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (value === true || value === 'yes') result[key] = 'yes';
      else if (value === false || value === 'no') result[key] = 'no';
      else if (value === 'not_sure') result[key] = 'not_sure';
    }
    return result;
  };

  const [localResponses, setLocalResponses] = useState<Record<string, YesNoValue>>(
    () => normalizeIncoming(responses)
  );

  // Normalize statements to ensure each has a stable, unique id
  const normalizedStatements = (() => {
    const usedIds = new Set<string>();
    return statements.map((s, index) => {
      const baseId =
        s && typeof s.id === 'string' && s.id.trim()
          ? s.id.trim()
          : `s${index + 1}`;
      let safeId = baseId;
      let suffix = 2;
      while (usedIds.has(safeId)) {
        safeId = `${baseId}_${suffix}`;
        suffix += 1;
      }
      usedIds.add(safeId);
      return { ...s, id: safeId };
    });
  })();

  useEffect(() => {
    setLocalResponses(normalizeIncoming(responses));
  }, [responses]);

  const handleSetResponse = (statementId: string, value: YesNoValue) => {
    const newResponses = { ...localResponses, [statementId]: value };
    setLocalResponses(newResponses);
    onChange?.(newResponses);
  };

  const calculateYesCount = () => {
    return Object.values(localResponses).filter(v => v === 'yes').length;
  };

  const getScoreBand = () => {
    if (!scoring?.bands) return null;
    const yesCount = calculateYesCount();
    return scoring.bands.find(band => yesCount >= band.range[0] && yesCount <= band.range[1]);
  };

  const allStatementsAnswered = normalizedStatements.every(s => localResponses[s.id] !== undefined);
  const yesCount = calculateYesCount();
  const scoreBand = getScoreBand();

  return (
    <div className="yes-no-check-block mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-[#ff6a38]/20">
      {title && (
        <h3 className="text-2xl font-bold text-[#2a2416] dark:text-white mb-6">
          {title}
        </h3>
      )}

      <div className="space-y-4">
        {normalizedStatements.map((statement, index) => (
          <div
            key={`${statement.id}-${index}`}
            className="statement-item p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            <p className="text-base text-[#2a2416] dark:text-white mb-3">
              {index + 1}. {statement.text}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleSetResponse(statement.id, 'yes')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  localResponses[statement.id] === 'yes'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleSetResponse(statement.id, 'not_sure')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  localResponses[statement.id] === 'not_sure'
                    ? 'bg-yellow-400 border-yellow-400 text-black'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-400'
                }`}
              >
                Not sure
              </button>
              <button
                onClick={() => handleSetResponse(statement.id, 'no')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  localResponses[statement.id] === 'no'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500'
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      {allStatementsAnswered && scoring && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-[#2a2416] dark:text-white">
              Yes Count:
            </span>
            <span className="text-2xl font-bold text-[#ff6a38]">
              {yesCount} / {statements.length}
            </span>
          </div>
          
          {scoreBand && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
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
