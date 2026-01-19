import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

export default function Card({ children, className = '', padding = 'md', style }: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${paddingStyles[padding]} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
