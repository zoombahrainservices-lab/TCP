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
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  }

  const imageSizes = {
    sm: { width: 200, height: 200 },
    md: { width: 300, height: 300 },
    lg: { width: 400, height: 400 },
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group rounded-xl ${sizeStyles[size]} transition-all cursor-pointer ${
        selected
          ? `bg-gradient-to-br ${gradient} text-white shadow-2xl scale-105`
          : 'bg-white dark:bg-[#1a3456] border-2 border-gray-200 dark:border-gray-700 hover:border-[#0073ba] dark:hover:border-[#4bc4dc] shadow-lg hover:shadow-xl hover:scale-105'
      }`}
    >
      {/* Image container with hover effect */}
      <div
        className={`w-full aspect-square rounded-lg mb-2 flex items-center justify-center overflow-hidden relative ${
          selected ? 'bg-white/15' : 'bg-gray-50 dark:bg-gray-800'
        }`}
      >
        {/* Default image */}
        <Image
          src={image}
          alt={title}
          width={imageSizes[size].width}
          height={imageSizes[size].height}
          quality={100}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            hoverImage && isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Hover image */}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={`${title} hover`}
            width={imageSizes[size].width}
            height={imageSizes[size].height}
            quality={100}
            className={`w-full h-full object-contain absolute inset-0 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Title */}
      <h3
        className={`text-sm font-bold mb-1 ${
          selected ? 'text-white' : 'text-gray-900 dark:text-white'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`text-xs leading-tight ${
          selected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {description}
      </p>

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
