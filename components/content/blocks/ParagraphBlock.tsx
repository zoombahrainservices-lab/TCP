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
  // Build dynamic classes
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const fontWeightClass = bold ? 'font-bold' : '';
  const italicClass = italic ? 'italic' : '';
  const underlineClass = underline ? 'underline' : '';

  // Combine all classes
  const className = `${fontSize || 'text-base md:text-lg'} leading-relaxed mb-4 ${alignClass} ${fontWeightClass} ${italicClass} ${underlineClass} ${!color ? 'text-[#2a2416] dark:text-gray-200' : ''}`.trim();

  // Build inline styles for custom colors
  const style: React.CSSProperties = {};
  if (color) style.color = color;
  if (bgColor) {
    style.backgroundColor = bgColor;
    style.padding = '0.5rem';
    style.borderRadius = '0.375rem';
  }

  return (
    <p className={className} style={style}>
      {text}
    </p>
  );
}
