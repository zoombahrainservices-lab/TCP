'use client';

import { ConditionalBlock as ConditionalBlockType } from '@/lib/blocks/types';
import BlockRenderer from '../BlockRenderer';

interface ConditionalBlockProps extends ConditionalBlockType {
  userResponses?: Record<string, any>;
  onResponseChange?: (promptId: string, value: any) => void;
}

export default function ConditionalBlock({
  condition,
  blocks,
  userResponses,
  onResponseChange,
}: ConditionalBlockProps) {
  const evaluateCondition = (): boolean => {
    const value = userResponses?.[condition.promptId];
    
    if (value === undefined) return false;

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'in_range':
        const [min, max] = condition.value as [number, number];
        const numValue = Number(value);
        return numValue >= min && numValue <= max;
      default:
        return false;
    }
  };

  const shouldRender = evaluateCondition();

  if (!shouldRender) return null;

  return (
    <div className="conditional-block">
      {blocks.map((block, index) => (
        <BlockRenderer
          key={index}
          block={block}
          userResponses={userResponses}
          onResponseChange={onResponseChange}
        />
      ))}
    </div>
  );
}
