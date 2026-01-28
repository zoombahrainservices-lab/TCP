"use client";

import Link from 'next/link'
import { PhaseCard } from '@/components/phase-card'
import type { ReactNode } from 'react'

interface PhaseCardLinkProps {
  href: string
  isLocked: boolean
  phaseNumber: string
  title: string
  subtitle: string
  neonClass: string
  neonColor: string
  icon: ReactNode
  children: ReactNode
  animationDelay?: number
}

export function PhaseCardLink({
  href,
  isLocked,
  phaseNumber,
  title,
  subtitle,
  neonClass,
  neonColor,
  icon,
  children,
  animationDelay = 0,
}: PhaseCardLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLocked) {
      e.preventDefault()
    }
  }

  return (
    <Link
      href={isLocked ? '#' : href}
      className={`block ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      <PhaseCard
        phaseNumber={phaseNumber}
        title={title}
        subtitle={subtitle}
        neonClass={neonClass}
        neonColor={neonColor}
        icon={icon}
        animationDelay={animationDelay}
      >
        {children}
      </PhaseCard>
    </Link>
  )
}
