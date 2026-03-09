import { StoryBlock as StoryBlockType } from '@/lib/blocks/types';
import { processHTMLContent } from '@/lib/utils/htmlDecode';

interface ExtendedStoryBlock extends StoryBlockType {
  color?: string;
  bgColor?: string;
  fontSize?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

// Typography page: Large Body = text-lg font-normal, Inter, line-height 1.5–1.7
// Dialogue lines (starting with ") are indented to match Chapter 1
export default function StoryBlock({ 
  text, 
  color, 
  bgColor, 
  fontSize, 
  align = 'left',
  bold,
  italic,
  underline 
}: ExtendedStoryBlock) {
  // Process HTML content: detect and decode if needed
  const { isHTML, content: htmlContent } = processHTMLContent(text);

  // Build dynamic classes
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const fontWeightClass = bold ? 'font-bold' : 'font-normal';
  const italicClass = italic ? 'italic' : '';
  const underlineClass = underline ? 'underline' : '';

  const baseTextColor = !color ? 'text-gray-700 dark:text-gray-300' : '';

  const bodyClass = `${fontSize || 'text-lg'} leading-relaxed ${fontWeightClass} ${italicClass} ${underlineClass} ${baseTextColor}`;

  // Build inline styles for custom colors/backgrounds
  const wrapperStyle: React.CSSProperties = {};
  if (bgColor) {
    wrapperStyle.backgroundColor = bgColor;
    wrapperStyle.padding = '1rem';
    wrapperStyle.borderRadius = '0.5rem';
  }

  const textStyle: React.CSSProperties = {};
  if (color) {
    textStyle.color = color;
  }

  if (isHTML) {
    // HTML mode: render the TipTap HTML string directly so inline spans
    // (e.g. a single red word) are respected.
    return (
      <div className="story-block mb-6 font-sans" style={wrapperStyle}>
        <div
          className={`${bodyClass} ${alignClass} prose dark:prose-invert max-w-none [&_p:empty]:h-5 [&_p:empty]:my-0`}
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    );
  }

  // Legacy plain-text mode (line-based with dialogue indentation)
  const lines = (text ?? '').split('\n');

  return (
    <div className="story-block mb-6 font-sans" style={wrapperStyle}>
      <div className={`${bodyClass} whitespace-pre-line ${alignClass}`} style={textStyle}>
        {lines.map((line, i) => {
          const isDialogue = line.trimStart().startsWith('"');
          return (
            <span key={i} className={isDialogue && align === 'left' ? 'block pl-4 sm:pl-6' : 'block'}>
              {line || ' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
