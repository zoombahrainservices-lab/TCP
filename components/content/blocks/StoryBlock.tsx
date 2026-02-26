import { StoryBlock as StoryBlockType } from '@/lib/blocks/types';

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
  const lines = (text ?? '').split('\n');
  
  // Build dynamic classes
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const fontWeightClass = bold ? 'font-bold' : 'font-normal';
  const italicClass = italic ? 'italic' : '';
  const underlineClass = underline ? 'underline' : '';

  const bodyClass = `${fontSize || 'text-lg'} leading-relaxed ${fontWeightClass} ${italicClass} ${underlineClass} ${!color ? 'text-gray-700 dark:text-gray-300' : ''}`;

  // Build inline styles for custom colors
  const style: React.CSSProperties = {};
  if (color) style.color = color;
  if (bgColor) {
    style.backgroundColor = bgColor;
    style.padding = '1rem';
    style.borderRadius = '0.5rem';
  }

  return (
    <div className="story-block mb-6 font-sans" style={bgColor ? { backgroundColor: bgColor, padding: '1rem', borderRadius: '0.5rem' } : {}}>
      <div className={`${bodyClass} whitespace-pre-line ${alignClass}`} style={color ? { color } : {}}>
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
