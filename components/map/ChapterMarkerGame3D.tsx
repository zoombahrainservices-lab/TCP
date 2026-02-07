import * as React from 'react'
import { PedestalUltra3D } from './PedestalUltra3D'
import { BookClosedUltra3D, BookHalfOpenUltra3D, BookOpenUltra3D } from './BooksUltra3D'

type Status = 'locked' | 'unlocked' | 'completed'

const COLORS = {
  blue: '#0073BA',
  cyan: '#4BC4DC',
  amber: '#F7B418',
  orange: '#FF6A38',
  green: '#43C000',
  navy: '#052343',
  gray: '#9CA3AF',
  purple: '#673067',
}

export function ChapterMarkerGame3D({
  title,
  status,
  isCurrent,
}: {
  title: string
  status: Status
  isCurrent: boolean
}) {
  const state: 'current' | 'completed' | 'locked' | 'unlocked' =
    status === 'locked' ? 'locked' : isCurrent ? 'current' : status === 'completed' ? 'completed' : 'unlocked'

  const base =
    state === 'current'
      ? COLORS.purple
      : state === 'completed'
        ? COLORS.cyan
        : state === 'unlocked'
          ? COLORS.blue
          : COLORS.gray

  const ring =
    state === 'current'
      ? COLORS.orange
      : state === 'completed'
        ? COLORS.amber
        : state === 'unlocked'
          ? COLORS.cyan
          : COLORS.gray

  return (
    <div className={`tcpMarker tcpMarkerGame ${state}`}>
      <div className="pedestal">
        <PedestalUltra3D state={state} base={base} ring={ring} />
      </div>

      <div className="book">
        {state === 'locked' ? (
          <BookClosedUltra3D cover={COLORS.gray} coverDark={COLORS.navy} size={150} />
        ) : state === 'current' ? (
          <BookHalfOpenUltra3D cover={COLORS.orange} coverDark={COLORS.amber} size={160} />
        ) : state === 'completed' ? (
          <BookOpenUltra3D cover={COLORS.green} coverDark={COLORS.cyan} size={158} />
        ) : (
          <BookOpenUltra3D cover={COLORS.cyan} coverDark={COLORS.blue} size={156} />
        )}

        {state === 'current' && <span className="sparkHalo" aria-hidden="true" />}
      </div>

      <div className="label">{title}</div>
    </div>
  )
}
