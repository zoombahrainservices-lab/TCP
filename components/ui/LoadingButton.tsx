import React from 'react'
import Button from './Button'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'calm' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  glow?: boolean
  loading?: boolean
  loadingText?: string
}

export default function LoadingButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  glow = false,
  loading = false,
  loadingText,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const spinnerSizes = {
    sm: 'w-3 h-3 border',
    md: 'w-4 h-4 border-2',
    lg: 'w-5 h-5 border-2',
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      glow={glow}
      disabled={disabled || loading}
      className={`${loading ? 'relative' : ''} ${className}`}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <div
            className={`${spinnerSizes[size]} border-current border-t-transparent rounded-full animate-spin flex-shrink-0`}
            aria-hidden="true"
          />
        )}
        <span>{loadingText && loading ? loadingText : children}</span>
      </span>
    </Button>
  )
}
