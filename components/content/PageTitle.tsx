'use client';

interface PageTitleProps {
  title: string;
  color?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

const sizeClasses = {
  small: 'text-2xl sm:text-3xl',
  medium: 'text-3xl sm:text-4xl',
  large: 'text-4xl sm:text-5xl',
  xl: 'text-5xl sm:text-6xl'
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold'
};

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
};

export default function PageTitle({
  title,
  color = '#1f2937', // Default dark gray
  size = 'large',
  fontWeight = 'bold',
  alignment = 'left',
  className = ''
}: PageTitleProps) {
  return (
    <h1
      className={`
        ${sizeClasses[size]}
        ${weightClasses[fontWeight]}
        ${alignmentClasses[alignment]}
        transition-colors
        dark:text-white
        ${className}
      `}
      style={{ color }}
    >
      {title}
    </h1>
  );
}
