import React from 'react'

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton component with pulse animation
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  )
}

/**
 * Text line skeleton - simulates a line of text
 */
export function SkeletonText({ className = '', width = 'full' }: SkeletonProps & { width?: 'full' | 'medium' | 'short' }) {
  const widthClass = {
    full: 'w-full',
    medium: 'w-3/4',
    short: 'w-1/2',
  }[width]
  
  return <Skeleton className={`h-4 ${widthClass} ${className}`} />
}

/**
 * Avatar skeleton - circular, for profile pictures
 */
export function SkeletonAvatar({ size = 'md', className = '' }: SkeletonProps & { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  }[size]
  
  return <Skeleton className={`${sizeClass} rounded-full ${className}`} />
}

/**
 * Card skeleton - generic card shape
 */
export function SkeletonCard({ className = '', children }: SkeletonProps & { children?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg animate-pulse ${className}`}>
      {children || (
        <>
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-32 w-full" />
        </>
      )}
    </div>
  )
}

/**
 * Button skeleton - for loading button states
 */
export function SkeletonButton({ className = '' }: SkeletonProps) {
  return <Skeleton className={`h-10 w-32 rounded-lg ${className}`} />
}
