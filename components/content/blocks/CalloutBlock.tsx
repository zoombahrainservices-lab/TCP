import { CalloutBlock as CalloutBlockType } from '@/lib/blocks/types';
import { Lightbulb, AlertTriangle, Beaker, CheckCircle, Info } from 'lucide-react';

export default function CalloutBlock({ variant, title, text, icon }: CalloutBlockType) {
  const variantStyles = {
    science: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-500',
      text: 'text-blue-900 dark:text-blue-100',
      icon: <Beaker className="w-6 h-6 text-blue-500" />,
    },
    tip: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-500',
      text: 'text-green-900 dark:text-green-100',
      icon: <Lightbulb className="w-6 h-6 text-green-500" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-500',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    },
    example: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-500',
      text: 'text-purple-900 dark:text-purple-100',
      icon: <CheckCircle className="w-6 h-6 text-purple-500" />,
    },
    truth: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-500',
      text: 'text-orange-900 dark:text-orange-100',
      icon: <Info className="w-6 h-6 text-orange-500" />,
    },
    research: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-500',
      text: 'text-indigo-900 dark:text-indigo-100',
      icon: <Beaker className="w-6 h-6 text-indigo-500" />,
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`callout-block mb-6 p-6 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {style.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`text-lg font-bold mb-2 ${style.text}`}>
              {title}
            </h4>
          )}
          <p className={`text-base leading-relaxed ${style.text}`}>
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
