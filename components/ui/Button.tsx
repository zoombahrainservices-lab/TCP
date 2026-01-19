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
    primary: 'bg-[var(--color-amber)] text-white hover:bg-[#d49f01] focus:ring-[var(--color-amber)]',
    secondary: 'bg-gray-200 text-[var(--color-charcoal)] hover:bg-gray-300 focus:ring-[var(--color-gray)]',
    danger: 'bg-[var(--color-red)] text-white hover:bg-[#d32f3c] focus:ring-[var(--color-red)]',
    ghost: 'bg-transparent text-[var(--color-charcoal)] hover:bg-gray-100 focus:ring-[var(--color-gray)]',
    calm: 'bg-[var(--color-blue)] text-white hover:bg-[#3a7bc8] focus:ring-[var(--color-blue)]',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
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
