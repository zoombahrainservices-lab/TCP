import { StoryBlock as StoryBlockType } from '@/lib/blocks/types';

// Typography page: Large Body = text-lg font-normal, Inter, line-height 1.5–1.7
// Dialogue lines (starting with ") are indented to match Chapter 1
const bodyClass = 'text-lg font-normal text-gray-700 dark:text-gray-300 leading-relaxed';

export default function StoryBlock({ text }: StoryBlockType) {
  const lines = (text ?? '').split('\n');
  return (
    <div className="story-block mb-6 font-sans">
      <div className={`${bodyClass} whitespace-pre-line`}>
        {lines.map((line, i) => {
          const isDialogue = line.trimStart().startsWith('"');
          return (
            <span key={i} className={isDialogue ? 'block pl-4 sm:pl-6' : 'block'}>
              {line || ' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
