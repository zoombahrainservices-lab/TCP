'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChapterMarker3D } from '@/components/map/ChapterMarker3D'
import { X, ChevronDown, BookOpen, CheckSquare, Zap, Lightbulb, Circle as CircleIcon, RotateCcw } from 'lucide-react'

type ChapterStatus = 'locked' | 'unlocked' | 'completed'

export type MapChapter = {
  id: string
  chapter_number: number
  slug: string
  title: string
  framework_code: string | null
  status: ChapterStatus
  completed_count: number
  total_sections: number
  sections: {
    id: string
    step_type: string
    title: string
    slug: string
    order_index: number
    pages: {
      id: string
      slug: string
      title: string
      order_index: number
      isCompleted: boolean
    }[]
  }[]
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

const sectionIcons: Record<string, any> = {
  read: BookOpen,
  self_check: CheckSquare,
  quiz: Zap,
  framework: Zap,
  techniques: Lightbulb,
  resolution: CircleIcon,
  follow_through: RotateCcw,
}

const sectionLabels: Record<string, string> = {
  read: 'Introduction',
  self_check: 'Reading',
  quiz: 'Quiz',
  framework: 'Exercise',
  techniques: 'Tip',
  resolution: 'Insight',
  follow_through: 'Summary',
}

// ViewBox: left + top padding; extra bottom padding so last chapter is fully visible.
const VIEWBOX_PAD_TOP = 140
const VIEWBOX_PAD_LEFT = 120
const VIEWBOX_PAD_BOTTOM = 320
const MAP_SHIFT_X = 180
const VIEWBOX = { w: 1440, h: 4500, padTop: VIEWBOX_PAD_TOP, padLeft: VIEWBOX_PAD_LEFT, padBottom: VIEWBOX_PAD_BOTTOM }

// Marker geometry: anchor = contact point where pedestal meets the path.
const MARKER_W = 220
const MARKER_H = 220
const ANCHOR_X = MARKER_W / 2
const ANCHOR_Y = 182

// Serpent path (winding line). Points are placed ON this path.
const PATH_D =
  'M 200 130 C 200 230, 1440 330, 1440 480 S 200 630, 200 780 S 1440 930, 1440 1080 S 200 1230, 200 1380 S 1440 1530, 1440 1680 S 200 1830, 200 1980 S 1440 2130, 1440 2280 S 200 2430, 200 2580 S 1440 2730, 1440 2880 S 200 3030, 200 3180 S 1440 3330, 1440 3480 S 200 3630, 200 3780 S 1440 3930, 1440 4080 S 200 4230, 200 4380 S 1440 4430, 1440 4580'

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

interface MapClientProps {
  chapters: MapChapter[]
  currentChapterNumber: number | null
}

export default function MapClient({ chapters, currentChapterNumber }: MapClientProps) {
  const router = useRouter()
  const pathRef = useRef<SVGPathElement | null>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [pathLen, setPathLen] = useState<number>(0)
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number | null>(currentChapterNumber ?? chapters[0]?.chapter_number ?? null)

  const currentChapterId = currentChapterNumber != null
    ? chapters.find((c) => c.chapter_number === currentChapterNumber)?.id ?? null
    : null
  const selectedChapter = selectedChapterNumber != null
    ? chapters.find((c) => c.chapter_number === selectedChapterNumber) ?? chapters[0]
    : chapters[0]

  const progressIndex = useMemo(() => {
    if (!currentChapterId) return 0
    const idx = chapters.findIndex((c) => c.id === currentChapterId)
    return clamp(idx, 0, chapters.length - 1)
  }, [chapters, currentChapterId])

  // Points ON the path: evenly distributed along the serpent line.
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

  const handleChapterClick = (chapter: MapChapter) => {
    if (chapter.status === 'locked') return
    const readSection = chapter.sections.find((s) => s.step_type === 'read') ?? chapter.sections[0]
    if (!readSection) {
      router.push(`/read/${chapter.slug}`)
      return
    }
    router.push(`/read/${chapter.slug}/${readSection.slug}`)
  }

  const handlePageCircleClick = (stepSlug: string, pageOrderIndex: number) => {
    if (!selectedChapter) return
    router.push(`/read/${selectedChapter.slug}/${stepSlug}?page=${pageOrderIndex}`)
  }

  const markerTitle = (ch: MapChapter) => `Chapter ${ch.chapter_number}`

  return (
    <div className="w-full min-h-full">
      <button
        onClick={() => setIsDetailsOpen((v) => !v)}
        className="fixed top-4 right-4 z-[80] flex items-center gap-2 rounded-lg bg-[#ff6a38] px-4 py-2.5 text-sm font-semibold text-white shadow-xl hover:bg-[#e95b2b] transition-colors ring-2 ring-white/80"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {isDetailsOpen ? 'Hide Chapter Panel' : 'Show Chapter Panel'}
      </button>

      {isDetailsOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/40 md:hidden"
            onClick={() => setIsDetailsOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-[70] h-screen w-[380px] max-w-[95vw] border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                CH {selectedChapter?.chapter_number ?? 1}
              </h2>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <select
                  value={selectedChapterNumber ?? undefined}
                  onChange={(e) => setSelectedChapterNumber(Number(e.target.value))}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pr-9 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.chapter_number}>
                      Chapter {c.chapter_number}: {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {(selectedChapter?.sections ?? []).map((section, idx) => {
                const Icon = sectionIcons[section.step_type] ?? BookOpen
                const label = sectionLabels[section.step_type] ?? section.title

                return (
                  <div
                    key={section.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-700 dark:text-gray-200 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        {idx + 1}. {label}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                      {section.pages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => handlePageCircleClick(section.slug, page.order_index)}
                          className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                            page.isCompleted
                              ? 'bg-[#f59e0b]'
                              : 'bg-[#b8b9bc]'
                          }`}
                          title={page.title || `Page ${page.order_index}`}
                          aria-label={`Open ${section.title} page ${page.order_index}`}
                        />
                      ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>
        </>
      )}

      <div className="px-6 pt-6 pb-2 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Chapter Map
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
          Your learning journey through {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} — scroll to see all
        </p>
      </div>

      <div className="mapStageFull mt-5 pt-12">
        <svg
          className="mapSvgFull"
          viewBox={`${-VIEWBOX.padLeft} ${-VIEWBOX.padTop} ${VIEWBOX.w + VIEWBOX.padLeft} ${VIEWBOX.h + VIEWBOX.padTop + VIEWBOX.padBottom}`}
          preserveAspectRatio="xMidYMin meet"
        >
          <g transform={`translate(${-MAP_SHIFT_X}, 0)`}>
            <path
              ref={pathRef}
              d={PATH_D}
              fill="none"
              stroke={MAP_COLORS.path.base}
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={PATH_D}
              fill="none"
              stroke={MAP_COLORS.path.remaining}
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="20 16"
            />
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
                      aria-label={markerTitle(ch)}
                    >
                      <ChapterMarker3D
                        title={markerTitle(ch)}
                        status={ch.status}
                        isCurrent={isCurrent}
                        frameworkCode={ch.framework_code}
                      />
                    </div>
                  </foreignObject>
                </g>
              )
            })}
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
