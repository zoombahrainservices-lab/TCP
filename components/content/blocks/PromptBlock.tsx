'use client';

import { useState, useEffect } from 'react';
import { PromptBlock as PromptBlockType } from '@/lib/blocks/types';

interface PromptBlockProps extends PromptBlockType {
  value?: any;
  onChange?: (value: any) => void;
}

export default function PromptBlock({
  id,
  label,
  description,
  input,
  unit,
  options,
  placeholder,
  required = false,
  validation,
  value,
  onChange,
}: PromptBlockProps) {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const renderInput = () => {
    switch (input) {
      case 'text':
        return (
          <input
            type="text"
            id={id}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff6a38] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            {...(validation?.pattern && { pattern: validation.pattern })}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={id}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff6a38] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-3">
            <input
              type="number"
              id={id}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              required={required}
              min={validation?.min}
              max={validation?.max}
              className="w-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff6a38] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {unit && (
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {unit}
              </span>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            id={id}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            required={required}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff6a38] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select an option...</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <label key={option} className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(localValue) && localValue.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(localValue) ? localValue : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option);
                    handleChange(newValues);
                  }}
                  className="w-5 h-5 text-[#ff6a38] border-gray-300 rounded focus:ring-[#ff6a38]"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="prompt-block mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-[#ff6a38]/20">
      <label htmlFor={id} className="block mb-3">
        <span className="text-lg font-semibold text-[#2a2416] dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </label>
      {renderInput()}
    </div>
  );
}
