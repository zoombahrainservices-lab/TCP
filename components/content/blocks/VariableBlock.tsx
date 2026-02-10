'use client';

import { VariableBlock as VariableBlockType } from '@/lib/blocks/types';

interface VariableBlockProps extends VariableBlockType {
  userResponses?: Record<string, any>;
}

export default function VariableBlock({
  template,
  variables,
  userResponses,
}: VariableBlockProps) {
  const replaceVariables = (): string => {
    let result = template;

    Object.entries(variables).forEach(([varName, promptId]) => {
      const value = userResponses?.[promptId] ?? `[${varName}]`;
      const regex = new RegExp(`{{${varName}}}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  };

  const renderedText = replaceVariables();

  return (
    <p className="variable-block mb-4 text-base md:text-lg leading-relaxed text-[#2a2416] dark:text-gray-200">
      {renderedText}
    </p>
  );
}
