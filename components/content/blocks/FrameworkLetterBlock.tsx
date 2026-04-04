import Image from 'next/image';
import type { FrameworkLetterBlock as Props } from '@/lib/blocks/types';
import { processHTMLContent } from '@/lib/utils/htmlDecode';

export default function FrameworkLetterBlock({
  letter,
  title,
  content,
  image,
}: Props) {
  const _unused = { letter, title };
  const { isHTML, content: renderedContent } = processHTMLContent(content);

  return (
    <div className="framework-letter mt-2 mb-6">
      {image && (
        <div className="relative w-full h-64 rounded-lg mb-6 overflow-hidden">
          <Image
            src={image}
            alt={`${letter} illustration`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          />
        </div>
      )}

      {/* Body copy only – page title above supplies the heading */}
      {isHTML ? (
        <div
          className="prose dark:prose-invert max-w-none text-lg leading-relaxed [&_p:empty]:h-5 [&_p:empty]:my-0"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      ) : (
        <div className="text-lg leading-relaxed whitespace-pre-wrap text-[#2a2416] dark:text-gray-200">
          {content}
        </div>
      )}
    </div>
  );
}
