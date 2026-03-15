import { ParagraphBlock as ParagraphBlockType } from '@/lib/blocks/types';
import { decodeHtmlEntities } from '@/lib/utils/decodeHtml';

export default function ParagraphBlock({ text }: ParagraphBlockType) {
  const decodedText = decodeHtmlEntities(text);
  const isHTML = decodedText && (decodedText.includes('<p>') || decodedText.includes('<span') || decodedText.includes('style='));
  
  return (
    <div className="text-base md:text-lg leading-relaxed text-[#2a2416] dark:text-gray-200 mb-4">
      {isHTML ? (
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: decodedText }} 
        />
      ) : (
        <p>{decodedText}</p>
      )}
    </div>
  );
}
