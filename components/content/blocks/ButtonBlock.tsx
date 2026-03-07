'use client'

import Link from 'next/link';
import { ButtonBlock as ButtonBlockType } from '@/lib/blocks/types';
import { playClickSound } from '@/lib/celebration/sounds';

export default function ButtonBlock({ text, href, action, variant = 'primary' }: ButtonBlockType) {
  const variantStyles = {
    primary: 'bg-[#ff6a38] hover:bg-[#ff8c38] text-white',
    secondary: 'bg-gray-700 hover:bg-gray-900 text-white',
    outline: 'bg-transparent border-2 border-[#ff6a38] text-[#ff6a38] hover:bg-[#ff6a38] hover:text-white',
  };

  const className = `inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all ${variantStyles[variant]} shadow-lg hover:shadow-xl transform hover:scale-105`;

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
          {text}
        </Link>
      </div>
    );
  }

  return (
    <div className="button-block mb-6 flex justify-center">
      <button onClick={handleClick} className={className}>
        {text}
      </button>
    </div>
  );
}
