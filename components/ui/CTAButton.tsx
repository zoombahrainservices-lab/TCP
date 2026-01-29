import React from 'react'
import { ArrowRight, Save, Check } from 'lucide-react'

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'ghost'
  icon?: 'arrow' | 'save' | 'check' | 'none'
  fullWidth?: boolean
  loading?: boolean
}

export default function CTAButton({
  children,
  variant = 'primary',
  icon = 'arrow',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: CTAButtonProps) {
  const baseStyles = 'font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide text-sm'
  
  const variantStyles = {
    primary: 'bg-[var(--color-amber)] text-[var(--color-charcoal)] hover:opacity-90 focus:ring-[var(--color-amber)] shadow-md hover:shadow-lg px-8 py-3',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg px-8 py-3',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400 px-6 py-2',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  
  const iconMap = {
    arrow: <ArrowRight className="w-5 h-5" />,
    save: <Save className="w-5 h-5" />,
    check: <Check className="w-5 h-5" />,
    none: null,
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {icon !== 'none' && iconMap[icon]}
        </>
      )}
    </button>
  )
}
