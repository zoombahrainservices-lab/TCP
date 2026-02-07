import * as React from 'react'
import Image from 'next/image'
import { Pedestal3D, PedestalState } from './Pedestal3D'

type Status = 'locked' | 'unlocked' | 'completed'

/** Book image assets (public/map books/) */
const BOOK_IMAGES = {
  current: '/map books/current chapter.png',
  completed: '/map books/completed.png',
  locked: '/map books/closed book.png',
  unlocked: '/map books/completed.png',
} as const

/** Branding page colors (dashboard/branding) — exact hex from TCP Brand Guidelines */
const BRAND = {
  blue: '#0073ba',
  cyan: '#4bc4dc',
  amber: '#f7b418',
  red: '#da1f26',
  navy: '#052343',
  orange: '#ff6a38',
  purple: '#673067',
  green: '#43c000',
  gray: '#9ca3af',
  white: '#ffffff',
}

export function ChapterMarker3D({
  title,
  status,
  isCurrent,
}: {
  title: string
  status: Status
  isCurrent: boolean
}) {
  const pedestalState: PedestalState =
    status === 'locked' ? 'locked' : isCurrent ? 'current' : status === 'completed' ? 'completed' : 'unlocked'

  const pedestalColor =
    pedestalState === 'current'
      ? BRAND.purple
      : pedestalState === 'completed'
        ? BRAND.cyan
        : pedestalState === 'unlocked'
          ? BRAND.blue
          : BRAND.gray

  const glow = pedestalState === 'current' ? BRAND.orange : BRAND.amber

  const bookSrc =
    status === 'locked'
      ? BOOK_IMAGES.locked
      : isCurrent
        ? BOOK_IMAGES.current
        : status === 'completed'
          ? BOOK_IMAGES.completed
          : BOOK_IMAGES.unlocked

  return (
    <div className={`tcpMarker ${status} ${isCurrent ? 'current' : ''}`}>
      <div className="pedestalWrap">
        <Pedestal3D state={pedestalState} color={pedestalColor} glow={glow} />
      </div>

      <div className="bookWrap tcpMarkerBookImg">
        <Image
          src={bookSrc}
          alt=""
          width={140}
          height={140}
          className="tcpMarkerBookImgInner"
          unoptimized
        />
      </div>

      <div className="tcpMarkerLabel">{title}</div>
    </div>
  )
}
