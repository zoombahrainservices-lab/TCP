import React from 'react'

interface RadioOptionProps {
  value: string
  label: string
  subtitle?: string
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function RadioOption({
  value,
  label,
  subtitle,
  selected = false,
  onClick,
  size = 'md',
}: RadioOptionProps) {
  const sizeStyles = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-5 text-lg',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full ${sizeStyles[size]} rounded-xl border-2 text-center transition-all ${
        selected
          ? 'border-[var(--color-blue)] bg-[var(--color-blue)]/5 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm bg-white dark:bg-gray-800'
      }`}
    >
      {/* Main label */}
      <div className="font-bold text-gray-900 dark:text-white mb-1">
        {label}
      </div>
      
      {/* Subtitle */}
      {subtitle && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </div>
      )}
    </button>
  )
}
