'use client';

import { useCallback } from 'react';
import { Block } from '@/lib/blocks/types';
import { debounce } from '@/lib/utils/debounce';
import { savePromptAnswer } from '@/app/actions/prompts';

// Import all block components
import HeadingBlock from './blocks/HeadingBlock';
import ParagraphBlock from './blocks/ParagraphBlock';
import StoryBlock from './blocks/StoryBlock';
import QuoteBlock from './blocks/QuoteBlock';
import DividerBlock from './blocks/DividerBlock';
import ImageBlock from './blocks/ImageBlock';
import CalloutBlock from './blocks/CalloutBlock';
import ListBlock from './blocks/ListBlock';
import PromptBlock from './blocks/PromptBlock';
import ScaleQuestionsBlock from './blocks/ScaleQuestionsBlock';
import YesNoCheckBlock from './blocks/YesNoCheckBlock';
import TaskPlanBlock from './blocks/TaskPlanBlock';
import ChecklistBlock from './blocks/ChecklistBlock';
import ScriptsBlock from './blocks/ScriptsBlock';
import CTABlock from './blocks/CTABlock';
import ButtonBlock from './blocks/ButtonBlock';
import ConditionalBlock from './blocks/ConditionalBlock';
import VariableBlock from './blocks/VariableBlock';
import FrameworkIntroBlock from './blocks/FrameworkIntroBlock';
import FrameworkLetterBlock from './blocks/FrameworkLetterBlock';

interface BlockRendererProps {
  block: Block;
  userResponses?: Record<string, any>;
  onResponseChange?: (promptId: string, value: any) => void;
  chapterId?: number;
  stepId?: string;
  pageId?: string;
}

export default function BlockRenderer({
  block,
  userResponses,
  onResponseChange,
  chapterId,
  stepId,
  pageId,
}: BlockRendererProps) {
  const debouncedSave = useCallback(
    debounce(async (promptKey: string, answer: any) => {
      if (chapterId) {
        await savePromptAnswer({
          promptKey,
          chapterId,
          stepId,
          pageId,
          answer,
        });
      }
    }, 1000),
    [chapterId, stepId, pageId]
  );

  // Safety check
  if (!block || !block.type) {
    console.warn('BlockRenderer: Invalid block received', block);
    return null;
  }

  try {
    switch (block.type) {
      case 'heading':
        return <HeadingBlock {...block} />;

      case 'paragraph':
        return <ParagraphBlock {...block} />;

      case 'story':
        return <StoryBlock {...block} />;

      case 'quote':
        return <QuoteBlock {...block} />;

      case 'divider':
        return <DividerBlock {...block} />;

      case 'image':
        return <ImageBlock {...block} />;

      case 'callout':
        return <CalloutBlock {...block} />;

      case 'list':
        return <ListBlock {...block} />;

      case 'prompt':
        return (
          <PromptBlock
            {...block}
            value={userResponses?.[block.id]}
            onChange={(value) => {
              onResponseChange?.(block.id, value);
              debouncedSave(block.id, value);
            }}
          />
        );

      case 'scale_questions':
        return (
          <ScaleQuestionsBlock
            {...block}
            responses={userResponses?.[block.id]}
            onChange={(responses) => onResponseChange?.(block.id, responses)}
          />
        );

      case 'yes_no_check':
        return (
          <YesNoCheckBlock
            {...block}
            responses={userResponses?.[block.id]}
            onChange={(responses) => onResponseChange?.(block.id, responses)}
          />
        );

      case 'task_plan':
        return <TaskPlanBlock {...block} />;

      case 'checklist':
        return (
          <ChecklistBlock
            {...block}
            checkedItems={userResponses?.[block.id]}
            onChange={(checkedIds) => onResponseChange?.(block.id, checkedIds)}
          />
        );

      case 'scripts':
        return <ScriptsBlock {...block} />;

      case 'cta':
        return <CTABlock {...block} />;

      case 'button':
        return <ButtonBlock {...block} />;

      case 'conditional':
        return (
          <ConditionalBlock
            {...block}
            userResponses={userResponses}
            onResponseChange={onResponseChange}
          />
        );

      case 'variable':
        return <VariableBlock {...block} userResponses={userResponses} />;

      case 'framework_intro':
        return <FrameworkIntroBlock {...block} />;

      case 'framework_letter':
        return <FrameworkLetterBlock {...block} />;

      default:
        console.warn(`BlockRenderer: Unknown block type "${(block as any).type}"`);
        return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300 font-mono text-sm">
              Unknown block type: {(block as any).type}
            </p>
          </div>
        );
    }
  } catch (error) {
    console.error('BlockRenderer: Error rendering block', block, error);
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-300 font-mono text-sm">
          Error rendering block: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}
