import React, { useState } from 'react'
import Image from 'next/image'

interface SelectionCardProps {
  id: string
  title: string
  description: string
  image: string
  hoverImage?: string
  gradient?: string
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function SelectionCard({
  id,
  title,
  description,
  image,
  hoverImage,
  gradient = 'from-blue-500 to-indigo-500',
  selected = false,
  onClick,
  size = 'md',
}: SelectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeStyles = {
    sm: 'p-[clamp(4px,1vw,8px)]',
    md: 'p-[clamp(6px,1vw,12px)]',
    lg: 'p-[clamp(8px,1vw,16px)]',
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group rounded-xl ${sizeStyles[size]} transition-all cursor-pointer flex flex-col h-full ${
        selected
          ? `bg-gradient-to-br ${gradient} text-white shadow-2xl ring-2 ring-offset-1 ring-white/50`
          : 'bg-white dark:bg-[#1a3456] border-2 border-gray-200 dark:border-gray-700 hover:border-[#0073ba] dark:hover:border-[#4bc4dc] shadow-lg hover:shadow-xl'
      }`}
    >
      {/* Image region - grows and shrinks, minimum 40px height */}
      <div
        className={`flex-1 min-h-[40px] rounded-lg mb-2 overflow-hidden relative ${
          selected ? 'bg-white/15' : 'bg-gray-50 dark:bg-gray-800'
        }`}
      >
        {/* Default image */}
        <Image
          src={image}
          alt={title}
          fill
          quality={100}
          className={`object-contain transition-opacity duration-300 ${
            hoverImage && isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Hover image */}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={`${title} hover`}
            fill
            quality={100}
            className={`object-contain transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Text region - fixed height, fluid typography */}
      <div className="flex-shrink-0">
        <h3
          className={`[font-size:clamp(9px,1.8vw,14px)] font-bold mb-1 line-clamp-1 ${
            selected ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}
        >
          {title}
        </h3>

        <p
          className={`[font-size:clamp(8px,1.4vw,12px)] leading-tight line-clamp-1 [@media(max-height:500px)]:hidden ${
            selected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {description}
        </p>
      </div>

      {/* Selection checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
          <svg
            className="w-3 h-3 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  )
}
