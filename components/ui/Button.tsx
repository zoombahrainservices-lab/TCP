import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'calm' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  glow?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-[var(--color-amber)] text-white hover:bg-[#d49f01] focus:ring-[var(--color-amber)] dark:bg-[#DF890C] dark:hover:bg-[#c97a0b]',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-[var(--color-charcoal)] dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-[var(--color-gray)]',
    danger: 'bg-[var(--color-red)] text-white hover:bg-[#d32f3c] focus:ring-[var(--color-red)] dark:bg-[#E63946] dark:hover:bg-[#d32f3c]',
    ghost: 'bg-transparent text-[var(--color-charcoal)] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-[var(--color-gray)]',
    calm: 'bg-[var(--color-blue)] text-white hover:bg-[#3a7bc8] focus:ring-[var(--color-blue)] dark:bg-[#0770C4] dark:hover:bg-[#0660a8]',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  const glowStyle = glow ? 'animate-glow' : ''
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${glowStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
