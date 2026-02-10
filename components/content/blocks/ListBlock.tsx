import { ListBlock as ListBlockType } from '@/lib/blocks/types';
import { Check } from 'lucide-react';

export default function ListBlock({ style, items }: ListBlockType) {
  if (style === 'bullets') {
    return (
      <ul className="list-disc list-inside mb-6 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-base md:text-lg text-[#2a2416] dark:text-gray-200 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (style === 'numbers') {
    return (
      <ol className="list-decimal list-inside mb-6 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-base md:text-lg text-[#2a2416] dark:text-gray-200 leading-relaxed">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  if (style === 'checkmarks') {
    return (
      <ul className="mb-6 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-base md:text-lg text-[#2a2416] dark:text-gray-200 leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
