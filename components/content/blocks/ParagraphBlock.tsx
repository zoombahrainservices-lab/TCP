import { ParagraphBlock as ParagraphBlockType } from '@/lib/blocks/types';

interface ExtendedParagraphBlock extends ParagraphBlockType {
  color?: string;
  bgColor?: string;
  fontSize?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export default function ParagraphBlock({ 
  text, 
  color, 
  bgColor, 
  fontSize, 
  align = 'left',
  bold,
  italic,
  underline 
}: ExtendedParagraphBlock) {
  // Detect if this paragraph contains HTML output from the rich text editor
  const isHTML =
    typeof text === 'string' &&
    (text.includes('<p') || text.includes('<span') || text.includes('</') || text.includes('style='));

  // Build dynamic classes (used for plain-text mode or as wrapper classes in HTML mode)
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const fontWeightClass = bold ? 'font-bold' : '';
  const italicClass = italic ? 'italic' : '';
  const underlineClass = underline ? 'underline' : '';

  const baseTextColor = !color ? 'text-[#2a2416] dark:text-gray-200' : '';

  const className = `${fontSize || 'text-base md:text-lg'} leading-relaxed mb-4 ${alignClass} ${fontWeightClass} ${italicClass} ${underlineClass} ${baseTextColor}`.trim();

  // Build inline styles for custom colors/backgrounds (applied to wrapper)
  const style: React.CSSProperties = {};
  if (color) style.color = color;
  if (bgColor) {
    style.backgroundColor = bgColor;
    style.padding = '0.5rem';
    style.borderRadius = '0.375rem';
  }

  if (isHTML) {
    // When content comes from TipTap (HTML string), render it as HTML so
    // inline spans like <span style="color: ...">word</span> actually apply.
    return (
      <div className={className} style={style}>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: text || '' }}
        />
      </div>
    );
  }

  // Fallback: legacy plain-text rendering
  return (
    <p className={className} style={style}>
      {text}
    </p>
  );
}
