import { ParagraphBlock as ParagraphBlockType } from '@/lib/blocks/types';

export default function ParagraphBlock({ text }: ParagraphBlockType) {
  const isHTML = text && (text.includes('<p>') || text.includes('<span') || text.includes('style='));
  
  return (
    <div className="text-base md:text-lg leading-relaxed text-[#2a2416] dark:text-gray-200 mb-4">
      {isHTML ? (
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: text }} 
        />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
}
