import React from 'react'
import { Check } from 'lucide-react'

interface BlockChipProps {
  type: 'reading' | 'assessment' | 'framework' | 'techniques' | 'proof' | 'follow-through'
  active?: boolean
  completed?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export default function BlockChip({ type, active = false, completed = false, children, onClick }: BlockChipProps) {
  const colorStyles = {
    reading: {
      bg: 'bg-blue-500',
      activeBg: 'bg-blue-600',
      text: 'text-blue-700 dark:text-blue-300',
      activeBorder: 'border-blue-500',
      icon: '🔵'
    },
    assessment: {
      bg: 'bg-yellow-400',
      activeBg: 'bg-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-300',
      activeBorder: 'border-yellow-400',
      icon: '🟡'
    },
    framework: {
      bg: 'bg-orange-500',
      activeBg: 'bg-orange-600',
      text: 'text-orange-700 dark:text-orange-300',
      activeBorder: 'border-orange-500',
      icon: '🟠'
    },
    techniques: {
      bg: 'bg-red-500',
      activeBg: 'bg-red-600',
      text: 'text-red-700 dark:text-red-300',
      activeBorder: 'border-red-500',
      icon: '🔴'
    },
    proof: {
      bg: 'bg-purple-500',
      activeBg: 'bg-purple-600',
      text: 'text-purple-700 dark:text-purple-300',
      activeBorder: 'border-purple-500',
      icon: '🟣'
    },
    'follow-through': {
      bg: 'bg-gray-400',
      activeBg: 'bg-gray-500',
      text: 'text-gray-700 dark:text-gray-300',
      activeBorder: 'border-gray-400',
      icon: '⚪'
    },
  }

  const styles = colorStyles[type]

  if (active) {
    return (
      <button
        onClick={onClick}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm
          ${styles.activeBg} text-white
          border-2 ${styles.activeBorder}
          transition-all duration-200
          ${onClick ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
        `}
      >
        <span>{styles.icon}</span>
        {children}
        {completed && <Check className="w-4 h-4" />}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm
        bg-white dark:bg-gray-800 ${styles.text}
        border border-gray-300 dark:border-gray-600
        transition-all duration-200
        ${onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-default'}
        ${completed ? 'opacity-70' : ''}
      `}
    >
      <span>{styles.icon}</span>
      {children}
      {completed && <Check className="w-4 h-4" />}
    </button>
  )
}
