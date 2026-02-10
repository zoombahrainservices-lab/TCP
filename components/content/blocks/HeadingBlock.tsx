import React from 'react';
import { HeadingBlock as HeadingBlockType } from '@/lib/blocks/types';

export default function HeadingBlock({ level, text }: HeadingBlockType) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  
  const className = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold text-[#2a2416] dark:text-white mb-6',
    2: 'text-3xl md:text-4xl font-bold text-[#2a2416] dark:text-white mb-4',
    3: 'text-2xl md:text-3xl font-semibold text-[#2a2416] dark:text-white mb-3',
    4: 'text-xl md:text-2xl font-semibold text-[#2a2416] dark:text-white mb-2',
  }[level];

  return <Tag className={className}>{text}</Tag>;
}
