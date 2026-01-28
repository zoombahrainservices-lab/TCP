"use client"

import Link from 'next/link'
import { NeonCard } from '@/components/neon-card'
import type { ReactNode } from 'react'

interface PhaseCardWrapperProps {
  href: string
  isLocked: boolean
  color: "red" | "orange" | "yellow" | "green" | "blue"
  children: ReactNode
}

export function PhaseCardWrapper({ href, isLocked, color, children }: PhaseCardWrapperProps) {
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
      <NeonCard color={color}>
        {children}
      </NeonCard>
    </Link>
  )
}
