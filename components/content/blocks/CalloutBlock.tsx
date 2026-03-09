import { CalloutBlock as CalloutBlockType } from '@/lib/blocks/types';
import { Lightbulb, AlertTriangle, Beaker, CheckCircle, Info } from 'lucide-react';
import { processHTMLContent } from '@/lib/utils/htmlDecode';

export default function CalloutBlock({
  variant,
  title,
  text,
  icon,
  bgColor,
  borderColor,
  textColor,
  iconColor,
}: CalloutBlockType) {
  // Process HTML content: detect and decode if needed
  const { isHTML, content: htmlContent } = processHTMLContent(text);

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
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-500',
      text: 'text-green-900 dark:text-green-100',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-500',
      text: 'text-red-900 dark:text-red-100',
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
    },
    info: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-500',
      text: 'text-gray-900 dark:text-gray-100',
      icon: <Info className="w-6 h-6 text-gray-500" />,
    },
    custom: {
      bg: '',
      border: '',
      text: '',
      icon: <Lightbulb className="w-6 h-6" />,
    },
  };

  const style = variantStyles[variant] ?? variantStyles.tip;
  const hasCustomColors = Boolean(bgColor || borderColor || textColor || iconColor);
  const customContainerStyle: React.CSSProperties | undefined = hasCustomColors
    ? {
        backgroundColor: bgColor || undefined,
        borderLeftColor: borderColor || undefined,
      }
    : undefined;
  const customTextStyle: React.CSSProperties | undefined = textColor ? { color: textColor } : undefined;
  const customIconStyle: React.CSSProperties | undefined = iconColor ? { color: iconColor } : undefined;
  const baseIcon = style.icon;
  const iconNode = customIconStyle ? (
    <span style={customIconStyle} className="inline-flex">
      {baseIcon}
    </span>
  ) : (
    baseIcon
  );

  return (
    <div
      className={`callout-block mb-6 p-6 rounded-lg border-l-4 ${style.bg} ${style.border}`}
      style={customContainerStyle}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {iconNode}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`text-lg font-bold mb-2 ${style.text}`} style={customTextStyle}>
              {title}
            </h4>
          )}
          {isHTML ? (
            <div 
              className={`text-base leading-relaxed ${style.text} prose dark:prose-invert max-w-none`}
              style={customTextStyle}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className={`text-base leading-relaxed ${style.text}`} style={customTextStyle}>
              {text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
