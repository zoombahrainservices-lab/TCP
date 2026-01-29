import React from 'react'
import Image from 'next/image'

interface Feature {
  text: string
  icon?: string
}

interface FeatureOptionCardProps {
  id: string
  title: string
  subtitle: string
  image: string
  features: Feature[]
  selected?: boolean
  onClick?: () => void
  badge?: string
  accentColor?: 'blue' | 'amber' | 'green' | 'red'
}

export default function FeatureOptionCard({
  id,
  title,
  subtitle,
  image,
  features,
  selected = false,
  onClick,
  badge,
  accentColor = 'blue',
}: FeatureOptionCardProps) {
  const colorStyles = {
    blue: {
      border: 'border-[var(--color-blue)]',
      bg: 'bg-[var(--color-blue)]/5',
      gradient: 'from-[var(--color-blue)]/10 to-[var(--color-blue)]/5',
      checkBg: 'bg-[var(--color-blue)]',
      checkmark: 'text-[var(--color-blue)]',
      badgeBg: 'bg-[var(--color-blue)]',
      badgeText: 'text-white',
    },
    amber: {
      border: 'border-[var(--color-amber)]',
      bg: 'bg-[var(--color-amber)]/5',
      gradient: 'from-[var(--color-amber)]/10 to-[var(--color-amber)]/5',
      checkBg: 'bg-[var(--color-amber)]',
      checkmark: 'text-[var(--color-amber)]',
      badgeBg: 'bg-[var(--color-amber)]',
      badgeText: 'text-[var(--color-charcoal)]',
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-500/5',
      gradient: 'from-green-500/10 to-green-500/5',
      checkBg: 'bg-green-500',
      checkmark: 'text-green-500',
      badgeBg: 'bg-green-500',
      badgeText: 'text-white',
    },
    red: {
      border: 'border-red-500',
      bg: 'bg-red-500/5',
      gradient: 'from-red-500/10 to-red-500/5',
      checkBg: 'bg-red-500',
      checkmark: 'text-red-500',
      badgeBg: 'bg-red-500',
      badgeText: 'text-white',
    },
  }

  const colors = colorStyles[accentColor]

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all hover:scale-105 ${
        selected
          ? `${colors.border} ${colors.bg} shadow-2xl`
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 shadow-lg'
      }`}
    >
      {/* Illustration - top section */}
      <div
        className={`h-96 bg-gradient-to-br ${colors.gradient} flex items-center justify-center overflow-hidden relative`}
      >
        {/* Optional badge */}
        {badge && (
          <div
            className={`absolute top-3 right-3 ${colors.badgeBg} ${colors.badgeText} px-3 py-1 rounded-full text-xs font-bold uppercase z-10`}
          >
            {badge}
          </div>
        )}

        {/* Main image */}
        <Image
          src={image}
          alt={title}
          width={512}
          height={512}
          quality={100}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content section */}
      <div className="p-6 text-left bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-[var(--color-charcoal)] dark:text-white">
            {title}
          </h3>
          {selected && (
            <div
              className={`flex-shrink-0 w-6 h-6 ${colors.checkBg} rounded-full flex items-center justify-center`}
            >
              <svg
                className="w-4 h-4 text-white"
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
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{subtitle}</p>

        {/* Features list */}
        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className={`${colors.checkmark} mt-0.5`}>✓</span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  )
}
