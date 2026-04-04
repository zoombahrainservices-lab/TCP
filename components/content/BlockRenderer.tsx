'use client';

import { useCallback } from 'react';
import { Block } from '@/lib/blocks/types';
import { debounce } from '@/lib/utils/debounce';
import { savePromptAnswer } from '@/app/actions/prompts';
import dynamic from 'next/dynamic';

// Import lightweight blocks (static)
import HeadingBlock from './blocks/HeadingBlock';
import ParagraphBlock from './blocks/ParagraphBlock';
import StoryBlock from './blocks/StoryBlock';
import QuoteBlock from './blocks/QuoteBlock';
import DividerBlock from './blocks/DividerBlock';
import ImageBlock from './blocks/ImageBlock';
import InlineImageBlock from './blocks/InlineImageBlock';
import CalloutBlock from './blocks/CalloutBlock';
import ListBlock from './blocks/ListBlock';
import ButtonBlock from './blocks/ButtonBlock';
import VariableBlock from './blocks/VariableBlock';
import FrameworkCoverBlock from './blocks/FrameworkCoverBlock';
import FrameworkIntroBlock from './blocks/FrameworkIntroBlock';
import FrameworkLetterBlock from './blocks/FrameworkLetterBlock';
import IdentityResolutionGuidanceBlock from './blocks/IdentityResolutionGuidanceBlock';
import SelfCheckIntroBlock from './blocks/SelfCheckIntroBlock';
import SelfCheckResultBlock from './blocks/SelfCheckResultBlock';

// Lazy load heavier interactive blocks
const PromptBlock = dynamic(() => import('./blocks/PromptBlock'), {
  loading: () => (
    <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse">
      <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
    </div>
  ),
});

const ChecklistBlock = dynamic(() => import('./blocks/ChecklistBlock'), {
  loading: () => (
    <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse">
      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  ),
});

const ScaleQuestionsBlock = dynamic(() => import('./blocks/ScaleQuestionsBlock'));
const YesNoCheckBlock = dynamic(() => import('./blocks/YesNoCheckBlock'));
const MCQBlock = dynamic(() => import('./blocks/MCQBlock'));
const TaskPlanBlock = dynamic(() => import('./blocks/TaskPlanBlock'));
const ScriptsBlock = dynamic(() => import('./blocks/ScriptsBlock'));
const CTABlock = dynamic(() => import('./blocks/CTABlock'));
const ConditionalBlock = dynamic(() => import('./blocks/ConditionalBlock'));
const ResolutionProofBlock = dynamic(() => import('./blocks/ResolutionProofBlock'), {
  loading: () => (
    <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse">
      <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
    </div>
  ),
});

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

      case 'inline_image':
        return <InlineImageBlock {...block} />;

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

      case 'mcq':
        return (
          <MCQBlock
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

      case 'framework_cover':
        return <FrameworkCoverBlock {...block} />;

      case 'framework_intro':
        return <FrameworkIntroBlock {...block} />;

      case 'framework_letter':
        return <FrameworkLetterBlock {...block} />;

      case 'identity_resolution_guidance':
        return <IdentityResolutionGuidanceBlock {...block} />;

      case 'resolution_proof':
        return (
          <ResolutionProofBlock
            {...block}
            value={userResponses?.[block.id]}
            onChange={(value) => {
              onResponseChange?.(block.id, value);
              debouncedSave(block.id, value);
            }}
            chapterId={chapterId}
            stepId={stepId}
            pageId={pageId}
          />
        );

      case 'self_check_intro':
        return <SelfCheckIntroBlock {...block} />;

      case 'self_check_result':
        return <SelfCheckResultBlock {...block} />;

      case 'title_slide':
        // Title slides are now handled by ChapterCoverPage component
        // Silently ignore these blocks in content
        return null;

      case 'page_meta':
        // Page metadata (e.g. title_style); not rendered
        return null;

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
