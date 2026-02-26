import { QuoteBlock as QuoteBlockType } from '@/lib/blocks/types';

interface ExtendedQuoteBlock extends QuoteBlockType {
  color?: string;
  bgColor?: string;
  fontSize?: string;
  align?: 'left' | 'center' | 'right';
}

export default function QuoteBlock({ text, author, role, color, bgColor, fontSize, align = 'left' }: ExtendedQuoteBlock) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const style: React.CSSProperties = {};
  if (bgColor) style.background = bgColor;

  const textStyle: React.CSSProperties = {};
  if (color) textStyle.color = color;

  return (
    <blockquote 
      className={`quote-block mb-6 p-6 rounded-lg border-l-4 border-[#ff6a38] ${!bgColor ? 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700' : ''}`}
      style={style}
    >
      <p 
        className={`${fontSize || 'text-lg md:text-xl'} leading-relaxed mb-3 italic ${alignClass} ${!color ? 'text-[#2a2416] dark:text-gray-200' : ''}`}
        style={textStyle}
      >
        "{text}"
      </p>
      {(author || role) && (
        <footer className={`text-sm text-gray-600 dark:text-gray-400 ${alignClass}`}>
          {author && <span className="font-semibold">— {author}</span>}
          {role && <span className="ml-2">({role})</span>}
        </footer>
      )}
    </blockquote>
  );
}
