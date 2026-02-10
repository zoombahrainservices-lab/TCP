'use client';

import { useState, useEffect } from 'react';
import { ChecklistBlock as ChecklistBlockType } from '@/lib/blocks/types';
import { Check } from 'lucide-react';

interface ChecklistBlockProps extends ChecklistBlockType {
  checkedItems?: string[];
  onChange?: (checkedIds: string[]) => void;
}

export default function ChecklistBlock({
  id,
  title,
  items,
  checkedItems = [],
  onChange,
}: ChecklistBlockProps) {
  const [localChecked, setLocalChecked] = useState<string[]>(checkedItems);

  useEffect(() => {
    setLocalChecked(checkedItems);
  }, [checkedItems]);

  const handleToggle = (itemId: string) => {
    const newChecked = localChecked.includes(itemId)
      ? localChecked.filter(id => id !== itemId)
      : [...localChecked, itemId];
    setLocalChecked(newChecked);
    onChange?.(newChecked);
  };

  const completionPercentage = (localChecked.length / items.length) * 100;

  return (
    <div className="checklist-block mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-[#ff6a38]/20">
      {title && (
        <h3 className="text-2xl font-bold text-[#2a2416] dark:text-white mb-4">
          {title}
        </h3>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{localChecked.length} / {items.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ff6a38] transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={localChecked.includes(item.id)}
                onChange={() => handleToggle(item.id)}
                className="sr-only peer"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                localChecked.includes(item.id)
                  ? 'bg-[#ff6a38] border-[#ff6a38]'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {localChecked.includes(item.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <span className={`flex-1 text-base ${
              localChecked.includes(item.id)
                ? 'line-through text-gray-500 dark:text-gray-500'
                : 'text-[#2a2416] dark:text-white'
            }`}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
