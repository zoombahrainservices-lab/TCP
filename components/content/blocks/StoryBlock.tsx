import { StoryBlock as StoryBlockType } from '@/lib/blocks/types';

export default function StoryBlock({ text }: StoryBlockType) {
  return (
    <div className="story-block mb-6 p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-[#ff6a38]">
      <p className="text-base md:text-lg leading-relaxed text-[#2a2416] dark:text-gray-200 font-serif italic">
        {text}
      </p>
    </div>
  );
}
