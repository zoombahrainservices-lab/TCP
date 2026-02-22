import { CTABlock as CTABlockType } from '@/lib/blocks/types';

export default function CTABlock({ title, text, variant = 'primary' }: CTABlockType) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#ff6a38] to-[#ff8c38] text-white',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white',
    emphasis: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900',
  };

  return (
    <div className={`cta-block mb-6 p-8 rounded-xl ${variantStyles[variant]} shadow-lg`}>
      <h3 className="text-3xl md:text-4xl font-bold mb-4">
        {title}
      </h3>
      <p className="text-lg md:text-xl leading-relaxed opacity-95">
        {text}
      </p>
    </div>
  );
}
