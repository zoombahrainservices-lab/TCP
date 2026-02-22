import { QuoteBlock as QuoteBlockType } from '@/lib/blocks/types';

export default function QuoteBlock({ text, author, role }: QuoteBlockType) {
  return (
    <blockquote className="quote-block mb-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 border-[#ff6a38]">
      <p className="text-lg md:text-xl leading-relaxed text-[#2a2416] dark:text-gray-200 mb-3 italic">
        "{text}"
      </p>
      {(author || role) && (
        <footer className="text-sm text-gray-600 dark:text-gray-400">
          {author && <span className="font-semibold">— {author}</span>}
          {role && <span className="ml-2">({role})</span>}
        </footer>
      )}
    </blockquote>
  );
}
