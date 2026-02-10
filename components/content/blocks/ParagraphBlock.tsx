import { ParagraphBlock as ParagraphBlockType } from '@/lib/blocks/types';

export default function ParagraphBlock({ text }: ParagraphBlockType) {
  return (
    <p className="text-base md:text-lg leading-relaxed text-[#2a2416] dark:text-gray-200 mb-4">
      {text}
    </p>
  );
}
