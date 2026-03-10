import { QuoteBlock as QuoteBlockType } from '@/lib/blocks/types';
import { processHTMLContent } from '@/lib/utils/htmlDecode';

interface ExtendedQuoteBlock extends QuoteBlockType {
  color?: string;
  bgColor?: string;
  borderColor?: string;
  /**
   * Optional semantic font size key for the quote text.
   * - 'small'   => slightly smaller than default
   * - 'xsmall'  => extra small (much smaller)
   * - 'large'   => slightly larger than default
   * - undefined => default size
   */
  fontSize?: 'small' | 'xsmall' | 'large' | string;
  align?: 'left' | 'center' | 'right';
}

export default function QuoteBlock({ text, author, role, color, bgColor, borderColor, fontSize, align = 'left' }: ExtendedQuoteBlock) {
  // Process HTML content: detect and decode if needed
  const { isHTML, content: htmlContent } = processHTMLContent(text);

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  // Map semantic fontSize value to Tailwind classes.
  const sizeClass =
    fontSize === 'small'
      ? 'text-base md:text-lg'
      : fontSize === 'xsmall'
      ? 'text-sm md:text-base'
      : fontSize === 'large'
      ? 'text-xl md:text-2xl'
      : 'text-lg md:text-xl';

  const style: React.CSSProperties = {};
  if (bgColor) style.background = bgColor;
  if (borderColor) style.borderLeftColor = borderColor;

  const textStyle: React.CSSProperties = {};
  if (color) textStyle.color = color;

  return (
    <blockquote 
      className={`quote-block mb-6 p-6 rounded-lg border-l-4 border-[#ff6a38] ${!bgColor ? 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700' : ''}`}
      style={style}
    >
      {isHTML ? (
        <div
          className={`${sizeClass} leading-relaxed mb-3 italic ${alignClass} ${!color ? 'text-[#2a2416] dark:text-gray-200' : ''} prose dark:prose-invert max-w-none`}
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <p
          className={`${sizeClass} leading-relaxed mb-3 italic ${alignClass} ${!color ? 'text-[#2a2416] dark:text-gray-200' : ''}`}
          style={textStyle}
        >
          "{text}"
        </p>
      )}
      {(author || role) && (
        <footer className={`text-sm text-gray-600 dark:text-gray-400 ${alignClass}`}>
          {author && <span className="font-semibold">— {author}</span>}
          {role && <span className="ml-2">({role})</span>}
        </footer>
      )}
    </blockquote>
  );
}
