import React from 'react';
import { HeadingBlock as HeadingBlockType } from '@/lib/blocks/types';

interface ExtendedHeadingBlock extends HeadingBlockType {
  color?: string;
  bgColor?: string;
  fontSize?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export default function HeadingBlock({ 
  level, 
  text, 
  color, 
  bgColor, 
  fontSize, 
  align = 'left',
  bold,
  italic,
  underline 
}: ExtendedHeadingBlock) {
  // Be defensive: some older/migrated heading blocks may not have a level set.
  // Default to h2 styling when level is missing or out of range.
  const safeLevel = level && level >= 1 && level <= 4 ? level : 2;
  const Tag = `h${safeLevel}` as keyof React.JSX.IntrinsicElements;

  // Base classes by level
  const baseClassName =
    {
      1: 'text-4xl md:text-5xl lg:text-6xl font-bold mb-6',
      2: 'text-3xl md:text-4xl font-bold mb-4',
      3: 'text-2xl md:text-3xl font-semibold mb-3',
      4: 'text-xl md:text-2xl font-semibold mb-2',
    }[safeLevel];

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
  const className = `${baseClassName} ${fontSize || ''} ${alignClass} ${fontWeightClass} ${italicClass} ${underlineClass} ${!color ? 'text-[#2a2416] dark:text-white' : ''}`.trim();

  // Build inline styles for custom colors
  const style: React.CSSProperties = {};
  if (color) style.color = color;
  if (bgColor) style.backgroundColor = bgColor;

  return <Tag className={className} style={style}>{text}</Tag>;
}
