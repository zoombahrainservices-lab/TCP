'use client';

import { useState, useEffect } from 'react';
import { ChecklistBlock as ChecklistBlockType } from '@/lib/blocks/types';
import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';

interface ChecklistBlockProps extends ChecklistBlockType {
  checkedItems?: string[];
  onChange?: (checkedIds: string[]) => void;
}

function areStringArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default function ChecklistBlock({
  id,
  title,
  appearance,
  items,
  checkedItems,
  onChange,
}: ChecklistBlockProps) {
  const [localChecked, setLocalChecked] = useState<string[]>(Array.isArray(checkedItems) ? checkedItems : []);

  useEffect(() => {
    const nextChecked = Array.isArray(checkedItems) ? checkedItems : [];
    setLocalChecked((prev) => (areStringArraysEqual(prev, nextChecked) ? prev : nextChecked));
  }, [checkedItems]);

  const handleToggle = (itemId: string) => {
    const newChecked = localChecked.includes(itemId)
      ? localChecked.filter(id => id !== itemId)
      : [...localChecked, itemId];
    setLocalChecked(newChecked);
    onChange?.(newChecked);
  };

  const checkboxColor = appearance?.checkboxColor || '#ff6a38';
  const containerStyle: CSSProperties = {
    backgroundColor: appearance?.containerBgColor,
    borderColor: appearance?.containerBorderColor,
  };

  return (
    <div
      className="checklist-block mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-[#ff6a38]/20"
      style={containerStyle}
    >
      {title && (
        <h3
          className="text-2xl font-bold text-[#2a2416] dark:text-white mb-4"
          style={appearance?.titleColor ? { color: appearance.titleColor } : undefined}
        >
          {title}
        </h3>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
            style={{
              backgroundColor: appearance?.itemBgColor,
              borderColor: appearance?.itemBorderColor,
            }}
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
              }`}
              style={localChecked.includes(item.id) ? { backgroundColor: checkboxColor, borderColor: checkboxColor } : undefined}>
                {localChecked.includes(item.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <span className={`flex-1 text-base ${
              localChecked.includes(item.id)
                ? 'line-through text-gray-500 dark:text-gray-500'
                : 'text-[#2a2416] dark:text-white'
            }`}
            style={!localChecked.includes(item.id) && appearance?.textColor ? { color: appearance.textColor } : undefined}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
