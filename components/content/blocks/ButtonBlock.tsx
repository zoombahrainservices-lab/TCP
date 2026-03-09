'use client'

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ButtonBlock as ButtonBlockType } from '@/lib/blocks/types';
import { playClickSound } from '@/lib/celebration/sounds';

export default function ButtonBlock({ text, href, action, variant = 'primary' }: ButtonBlockType) {
  const variantStyles = {
    primary: 'bg-[#ff6a38] hover:bg-[#ff8c38] text-white',
    secondary: 'bg-gray-700 hover:bg-gray-900 text-white',
    outline: 'bg-transparent border-2 border-[#ff6a38] text-[#ff6a38] hover:bg-[#ff6a38] hover:text-white',
    resolution_cta: 'bg-[#5e35b1] hover:bg-[#7e57c2] text-white',
  };

  const style = variantStyles[variant ?? 'primary'] ?? variantStyles.primary;
  const className = `inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all ${style} shadow-lg hover:shadow-xl transform hover:scale-105`;
  const content = (
    <>
      {text}
      {variant === 'resolution_cta' && <ChevronRight className="w-5 h-5" />}
    </>
  );

  const handleClick = () => {
    playClickSound();
    if (action) {
      console.log('Action:', action);
    }
  };

  if (href) {
    return (
      <div className="button-block mb-6 flex justify-center">
        <Link href={href} className={className} onClick={() => playClickSound()}>
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div className="button-block mb-6 flex justify-center">
      <button onClick={handleClick} className={className}>
        {content}
      </button>
    </div>
  );
}
