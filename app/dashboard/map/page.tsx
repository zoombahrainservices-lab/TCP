'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChapterMarker3D } from '@/components/map/ChapterMarker3D'

type ChapterStatus = 'locked' | 'unlocked' | 'completed'

type Chapter = {
  id: string
  title: string
  status: ChapterStatus
}

type Point = { x: number; y: number }

/** Map branding: Duolingo-like clarity — one pulse (current), amber path, green = done */
export const MAP_COLORS = {
  completed: {
    ring: '#43C000',
    glow: 'rgba(67,192,0,0.25)',
  },
  current: {
    pulse: '#FF6A38',
    pulseGlow: 'rgba(255,106,56,0.35)',
    halo: '#F7B418',
    haloGlow: 'rgba(247,180,24,0.35)',
  },
  unlocked: {
    ring: '#4BC4DC',
    hoverRing: '#0073BA',
  },
  locked: {
    tint: 'rgba(31,41,55,0.45)',
    icon: '#9CA3AF',
    lock: '#052343',
  },
  path: {
    base: 'rgba(255,255,255,0.75)',
    remaining: 'rgba(156,163,175,0.30)',
    progress: '#F7B418',
    progressGlow: 'rgba(247,180,24,0.35)',
  },
}

/** Book icon colors per state (branding) */
export const BOOK_COLORS = {
  completed: '#43C000',
  current: '#FF6A38',
  unlocked: '#4BC4DC',
  locked: '#9CA3AF',
}

// ViewBox: left + top padding; extra bottom padding so Chapter 30 is fully visible.
const VIEWBOX_PAD_TOP = 140
const VIEWBOX_PAD_LEFT = 120
const VIEWBOX_PAD_BOTTOM = 320
const MAP_SHIFT_X = 180
const VIEWBOX = { w: 1440, h: 4500, padTop: VIEWBOX_PAD_TOP, padLeft: VIEWBOX_PAD_LEFT, padBottom: VIEWBOX_PAD_BOTTOM }

// Marker geometry: anchor = contact point where pedestal meets the path. Tweak ANCHOR_Y ±6px for pixel-perfect alignment.
const MARKER_W = 220
const MARKER_H = 220
const ANCHOR_X = MARKER_W / 2
const ANCHOR_Y = 182

// Serpent path (winding line). Points are placed ON this path so the line passes through each pedestal contact point.
const PATH_D =
  'M 200 130 C 200 230, 1440 330, 1440 480 S 200 630, 200 780 S 1440 930, 1440 1080 S 200 1230, 200 1380 S 1440 1530, 1440 1680 S 200 1830, 200 1980 S 1440 2130, 1440 2280 S 200 2430, 200 2580 S 1440 2730, 1440 2880 S 200 3030, 200 3180 S 1440 3330, 1440 3480 S 200 3630, 200 3780 S 1440 3930, 1440 4080 S 200 4230, 200 4380 S 1440 4430, 1440 4580'

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function generateChapters(): Chapter[] {
  const chapters: Chapter[] = []
  for (let i = 1; i <= 30; i++) {
    let status: ChapterStatus = 'locked'
    if (i === 1) status = 'completed'
    else if (i === 2) status = 'unlocked'

    chapters.push({
      id: `c${i}`,
      title: `Chapter ${i}`,
      status,
    })
  }
  return chapters
}

export default function MapPage() {
  const router = useRouter()
  const pathRef = useRef<SVGPathElement | null>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [pathLen, setPathLen] = useState<number>(0)
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null)

  const chapters = useMemo(() => generateChapters(), [])
  const currentChapterId = 'c2'

  const progressIndex = useMemo(() => {
    const idx = chapters.findIndex((c) => c.id === currentChapterId)
    return clamp(idx, 0, chapters.length - 1)
  }, [chapters, currentChapterId])

  // Points ON the path: chapter 1 at start (t=0), then 2..30 evenly. Line passes through each point = through center of each pedestal.
  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const total = path.getTotalLength()
    setPathLen(total)

    const n = chapters.length
    const start = 0
    const end = total
    const span = end - start

    const pts: Point[] = []
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? start : i === 0 ? 0 : start + (span * i) / (n - 1)
      const pt = path.getPointAtLength(t)
      pts.push({ x: pt.x, y: pt.y })
    }
    setPoints(pts)
  }, [chapters.length])

  const progressLen = useMemo(() => {
    if (!pathLen) return 0
    const n = chapters.length
    const start = 0
    const end = pathLen
    const span = end - start
    const t = n === 1 ? start : start + (span * progressIndex) / (n - 1)
    return t
  }, [pathLen, chapters.length, progressIndex])

  const handleChapterClick = (chapter: Chapter) => {
    if (chapter.status !== 'locked') {
      const chapterNumber = chapter.id.replace('c', '')
      router.push(`/chapter/${chapterNumber}/reading`)
    }
  }

  return (
    <div className="w-full min-h-full">
      {/* Header: bottom margin so Chapter 1 is not covered */}
      <div className="px-6 pt-6 pb-2 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Chapter Map
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
          Your learning journey through 30 chapters — scroll to see all
        </p>
      </div>

      {/* Map: 20px margin from heading + top padding so Chapter 1 is clear */}
      <div className="mapStageFull mt-5 pt-12">
        <svg
          className="mapSvgFull"
          viewBox={`${-VIEWBOX.padLeft} ${-VIEWBOX.padTop} ${VIEWBOX.w + VIEWBOX.padLeft} ${VIEWBOX.h + VIEWBOX.padTop + VIEWBOX.padBottom}`}
          preserveAspectRatio="xMidYMin meet"
        >
          <g transform={`translate(${-MAP_SHIFT_X}, 0)`}>
          {/* 1) Base path: serpent line — passes through center of each pedestal */}
          <path
            ref={pathRef}
            d={PATH_D}
            fill="none"
            stroke={MAP_COLORS.path.base}
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 2) Remaining path: light gray dashed (not yet reached) */}
          <path
            d={PATH_D}
            fill="none"
            stroke={MAP_COLORS.path.remaining}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="20 16"
          />
          {/* 3) Progress path: Amber (journey progress up to current) */}
          <path
            d={PATH_D}
            fill="none"
            stroke={MAP_COLORS.path.progress}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: `${progressLen} ${pathLen}`,
              filter: `drop-shadow(0 4px 10px ${MAP_COLORS.path.progressGlow})`,
            }}
          />
          {/* Chapter nodes: anchor (ANCHOR_X, ANCHOR_Y) in marker box aligns to path point (p.x, p.y) so pedestal touches line */}
          {chapters.map((ch, i) => {
            const p = points[i]
            if (!p) return null

            const locked = ch.status === 'locked'
            const isCurrent = ch.id === currentChapterId && !locked

            return (
              <g key={ch.id} transform={`translate(${p.x - ANCHOR_X}, ${p.y - ANCHOR_Y})`}>
                <foreignObject
                  x={0}
                  y={0}
                  width={MARKER_W}
                  height={MARKER_H}
                  style={{ overflow: 'visible' }}
                  onClick={() => !locked && handleChapterClick(ch)}
                  onMouseEnter={() => setHoveredChapterId(ch.id)}
                  onMouseLeave={() => setHoveredChapterId(null)}
                >
                  <div
                    style={{
                      width: `${MARKER_W}px`,
                      height: `${MARKER_H}px`,
                      position: 'relative',
                      cursor: locked ? 'not-allowed' : 'pointer',
                    }}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    aria-label={ch.title}
                  >
                    <ChapterMarker3D title={ch.title} status={ch.status} isCurrent={isCurrent} />
                  </div>
                </foreignObject>
              </g>
            )
          })}
          {/* Waypoint dots at path contact point (cap circle for touch illusion) */}
          {points.map((p, i) => {
            const isCompleted = i < progressIndex
            const isCurrent = i === progressIndex
            const fill = isCompleted
              ? MAP_COLORS.completed.ring
              : isCurrent
                ? MAP_COLORS.current.halo
                : 'rgba(255,255,255,0.7)'
            return (
              <circle
                key={`wp-${i}`}
                cx={p.x}
                cy={p.y}
                r={isCurrent ? 8 : isCompleted ? 7 : 6}
                fill={fill}
                opacity={isCompleted || isCurrent ? 0.95 : 0.6}
                style={{
                  filter: isCompleted
                    ? `drop-shadow(0 2px 6px ${MAP_COLORS.completed.glow})`
                    : undefined,
                  pointerEvents: 'none',
                }}
              />
            )
          })}
          </g>
        </svg>
      </div>
    </div>
  )
}
