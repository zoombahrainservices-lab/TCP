import Link from 'next/link';
import { ButtonBlock as ButtonBlockType } from '@/lib/blocks/types';

export default function ButtonBlock({ text, href, action, variant = 'primary' }: ButtonBlockType) {
  const variantStyles = {
    primary: 'bg-[#ff6a38] hover:bg-[#ff8c38] text-white',
    secondary: 'bg-gray-700 hover:bg-gray-900 text-white',
    outline: 'bg-transparent border-2 border-[#ff6a38] text-[#ff6a38] hover:bg-[#ff6a38] hover:text-white',
  };

  const className = `inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all ${variantStyles[variant]} shadow-lg hover:shadow-xl transform hover:scale-105`;

  if (href) {
    return (
      <div className="button-block mb-6 flex justify-center">
        <Link href={href} className={className}>
          {text}
        </Link>
      </div>
    );
  }

  return (
    <div className="button-block mb-6 flex justify-center">
      <button
        onClick={() => {
          if (action) {
            // Client-side action handling (to be implemented)
            console.log('Action:', action);
          }
        }}
        className={className}
      >
        {text}
      </button>
    </div>
  );
}
