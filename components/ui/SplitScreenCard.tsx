import React from 'react'
import Image from 'next/image'

interface SplitScreenCardProps {
  title: string
  subtitle?: string
  leftImage?: string
  rightImage?: string
  children: React.ReactNode
  className?: string
}

export default function SplitScreenCard({
  title,
  subtitle,
  leftImage,
  rightImage,
  children,
  className = '',
}: SplitScreenCardProps) {
  return (
    <div className={`relative max-w-3xl mx-auto ${className}`}>
      {/* Background images - HUGE faded behind content */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-visible">
        {/* Left side image */}
        {leftImage && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-96 w-[600px] h-[600px] opacity-12">
            <Image
              src={leftImage}
              alt="Background"
              width={600}
              height={600}
              quality={100}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {/* Right side image */}
        {rightImage && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-96 w-[600px] h-[600px] opacity-8">
            <Image
              src={rightImage}
              alt="Background hover"
              width={600}
              height={600}
              quality={100}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Centered content with glass morphism */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-[var(--color-charcoal)] dark:text-white mb-4">
          {title}
        </h2>

        {/* Subtitle / Info box */}
        {subtitle && (
          <div className="bg-[var(--color-blue)]/10 border-l-4 border-[var(--color-blue)] p-4 mb-6 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {subtitle}
            </p>
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  )
}
