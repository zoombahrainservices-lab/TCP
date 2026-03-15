import { StoryBlock as StoryBlockType } from '@/lib/blocks/types';
import { decodeHtmlEntities } from '@/lib/utils/decodeHtml';

export default function StoryBlock({ text }: StoryBlockType) {
  const decodedText = decodeHtmlEntities(text);
  const isHTML = decodedText && (decodedText.includes('<p>') || decodedText.includes('<span') || decodedText.includes('style='));
  
  return (
    <div className="story-block mb-6 p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-[#ff6a38]">
      {isHTML ? (
        <div 
          className="text-base md:text-lg leading-relaxed text-[#2a2416] dark:text-gray-200 font-serif italic prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: decodedText }} 
        />
      ) : (
        <p className="text-base md:text-lg leading-relaxed text-[#2a2416] dark:text-gray-200 font-serif italic">
          {decodedText}
        </p>
      )}
    </div>
  );
}
