'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import NavLogo from '@/components/ui/NavLogo'
import DashboardNavSocialIcons from '@/components/ui/DashboardNavSocialIcons'
import { getGuidedSectionUrl } from '@/lib/guided-book/navigation'

const DashboardNavSettingsModal = dynamic(() => import('@/components/ui/DashboardNavSettingsModal'), {
  ssr: false,
})

const STORAGE_KEY = 'tcpCurrentChapter'

type DashboardNavProps = {
  /** When on dashboard, use this so Framework/Techniques/Resolution/Follow-through match current chapter */
  serverCurrentChapter?: number
  /** Whether the logged-in user has admin role */
  isAdmin?: boolean
  /** When true, sidebar is collapsed by default and only opens via toggle (e.g. on reading pages) */
  collapseSidebarByDefault?: boolean
}

export function DashboardNav({ serverCurrentChapter, isAdmin = false, collapseSidebarByDefault = false }: DashboardNavProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(!collapseSidebarByDefault)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [storedChapter, setStoredChapter] = useState<number | null>(null)
  const pathname = usePathname()

  // When on dashboard (or any non-chapter page), use the current chapter from localStorage
  // so Framework, Techniques, Resolution, Follow-through all point to the correct chapter.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw != null) {
        const n = parseInt(raw, 10)
        if (Number.isFinite(n) && n >= 1) setStoredChapter(n)
      }
    } catch {
      // ignore
    }
  }, [pathname])

  // Infer current chapter from URL when we're on a chapter/read page
  let chapterFromPath = 1
  let hasChapterInPath = false
  const chapterMatch = pathname.match(/^\/(?:read\/chapter-(\d+)|chapter\/(\d+)|read\/([^/]+))/)
  if (chapterMatch) {
    if (chapterMatch[1] || chapterMatch[2]) {
      chapterFromPath = Number(chapterMatch[1] || chapterMatch[2]) || 1
      hasChapterInPath = true
    } else if (chapterMatch[3]) {
      const slug = chapterMatch[3]
      const chapterNumberFromSlug = slug.match(/^chapter-(\d+)$/)
      if (chapterNumberFromSlug?.[1]) {
        chapterFromPath = Number(chapterNumberFromSlug[1]) || 1
        hasChapterInPath = true
      }
      if (slug === 'stage-star-silent-struggles') {
        chapterFromPath = 1
        hasChapterInPath = true
      }
      if (slug === 'genius-who-couldnt-speak') {
        chapterFromPath = 2
        hasChapterInPath = true
      }
    }
  }

  // Use chapter from URL when on a chapter page; otherwise use server or stored current chapter
  const activeChapter = hasChapterInPath
    ? chapterFromPath
    : (serverCurrentChapter ?? storedChapter ?? 1)

  // Helper: chapter slug for dynamic read routes
  const chapterSlugByNumber: Record<number, string> = {
    1: 'stage-star-silent-struggles',
    2: 'genius-who-couldnt-speak',
  }

  // Dynamic slug: use known slug or fallback to chapter-N format for any chapter
  const getChapterSlug = (chapterNum: number) => {
    return chapterSlugByNumber[chapterNum] || `chapter-${chapterNum}`
  }

  // Use canonical URLs from shared helper
  const readingHref = `/read`
  const selfCheckHref = getGuidedSectionUrl(activeChapter, 'self_check')
  const frameworkHref = getGuidedSectionUrl(activeChapter, 'framework')
  const techniquesHref = getGuidedSectionUrl(activeChapter, 'techniques')
  const followThroughHref = getGuidedSectionUrl(activeChapter, 'follow_through')
  const resolutionHref = getGuidedSectionUrl(activeChapter, 'resolution')

  const menuItems = [
    // Map - Main Navigation (at the very top)
    {
      id: 'map',
      label: 'Map',
      href: '/dashboard/map',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: '#0073ba', // BLUE
    },
    { type: 'divider' },
    // Reading
    {
      id: 'reading',
      label: 'Reading',
      href: readingHref,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: '#ff3d3d', // RED
    },
    { type: 'divider' },
    // Self-Check alone
    {
      id: 'self-check',
      label: 'Self-Check',
      href: selfCheckHref,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: '#10b981', // GREEN
    },
    { type: 'divider' },
    // Framework + Techniques
    {
      id: 'framework',
      label: 'Framework',
      href: frameworkHref,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: '#d97706', // ORANGE DARK
    },
    {
      id: 'techniques',
      label: 'Techniques',
      href: techniquesHref,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: '#d97706', // ORANGE DARK
    },
    { type: 'divider' },
    // Resolution + Follow-Through
    {
      id: 'resolution',
      label: 'Resolution',
      href: resolutionHref,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#6b21a8', // PURPLE DARK EPIC
    },
    {
      id: 'follow-through',
      label: 'Follow-Through',
      href: followThroughHref,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: '#6b21a8', // PURPLE DARK EPIC
    },
    { type: 'divider' },
    // Bottom Section - CHECK/USER (Profile, Report, Help - all BLACK)
    {
      id: 'profile',
      label: 'Profile',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: '#000000', // BLACK
    },
    {
      id: 'report',
      label: 'Report',
      href: '/dashboard/progress',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: '#000000', // BLACK
    },
    {
      id: 'help',
      label: 'Help',
      href: '/dashboard/help',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#000000', // BLACK
    },
    { type: 'social-media' },
  ]

  const getActiveNavId = () => {
    if (pathname === '/dashboard/map') return 'map'
    if (pathname === '/dashboard/profile') return 'profile'
    if (pathname === '/dashboard/progress' || pathname === '/reports') return 'report'
    if (pathname === '/dashboard/help' || pathname === '/help') return 'help'

    if (pathname === '/read') return 'reading'

    const readMatch = pathname.match(/^\/read\/([^/?#]+)(?:\/([^/?#]+))?/)
    if (readMatch) {
      const stepSlug = readMatch[2]

      if (!stepSlug) return 'reading'
      if (stepSlug === 'assessment') return 'self-check'
      if (stepSlug === 'framework') return 'framework'
      if (stepSlug === 'techniques') return 'techniques'
      if (stepSlug === 'follow-through') return 'follow-through'

      return 'reading'
    }

    const chapterMatch = pathname.match(/^\/chapter\/\d+\/([^/?#]+)/)
    if (chapterMatch) {
      const sectionKey = chapterMatch[1]

      if (sectionKey === 'proof') return 'resolution'
      if (sectionKey === 'follow-through') return 'follow-through'
      if (sectionKey === 'reading') return 'reading'
      if (sectionKey === 'assessment') return 'self-check'
      if (sectionKey === 'framework') return 'framework'
      if (sectionKey === 'techniques') return 'techniques'
    }

    return null
  }

  const activeNavId = getActiveNavId()
  const isActive = (itemId?: string) => itemId != null && itemId === activeNavId
  const getInactiveIconClassName = (itemId?: string) => {
    if (itemId === 'map') return '!text-[#0073ba] dark:!text-[#0073ba]'
    if (itemId === 'profile' || itemId === 'report' || itemId === 'help') {
      return '!text-black dark:!text-white'
    }
    return ''
  }

  return (
    <>
      {/* Mobile Header - IN FLOW not fixed */}
      <header className="lg:hidden flex-shrink-0 h-16 bg-white dark:bg-[#000000] border-b border-gray-200 dark:border-gray-700 shadow-sm z-50">
        <div className="h-full flex items-center justify-between px-4">
          {/* Logo - Left Side */}
          <NavLogo height={40} width={175} />

          {/* Hamburger Menu - Right Side */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop: toggle button when sidebar is collapsed by default (e.g. reading page) */}
      {collapseSidebarByDefault && (
        <button
          onClick={() => setDesktopSidebarOpen(true)}
          className="hidden lg:flex fixed left-4 top-2 z-40 items-center justify-center w-11 h-11 rounded-lg bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Desktop backdrop when sidebar is open (collapse mode) */}
      {collapseSidebarByDefault && desktopSidebarOpen && (
        <div
          className="hidden lg:block fixed inset-0 bg-black/50 z-40"
          onClick={() => setDesktopSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar - full height; when collapseSidebarByDefault, fixed overlay and only when open */}
      <aside
        className={`
          hidden lg:flex lg:flex-col lg:flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          ${collapseSidebarByDefault
            ? `fixed left-0 top-0 bottom-0 z-50 w-64 transition-transform duration-300 ease-out ${desktopSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'lg:w-64'
          }
        `}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#000000] px-6 py-4 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <NavLogo height={48} width={210} />
          </div>
          {collapseSidebarByDefault && (
            <button
              onClick={() => setDesktopSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col">
          {/* All Menu Items with Dividers */}
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <li key={`divider-${index}`} className="my-3 border-t border-gray-200 dark:border-gray-700"></li>
              }
              if (item.type === 'social-media') {
                return null // Handle social media separately below
              }
              return (
                <li key={item.id}>
                  <Link
                    href={item.href ?? '/'}
                    onClick={collapseSidebarByDefault ? () => setDesktopSidebarOpen(false) : undefined}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive(item.id)
                        ? 'bg-[#0073ba] text-white dark:bg-[#4bc4dc] dark:text-gray-900'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    <span
                      className={getInactiveIconClassName(item.id)}
                      style={{
                        color: isActive(item.id)
                          ? 'currentColor'
                          : getInactiveIconClassName(item.id)
                            ? undefined
                            : item.color
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Spacer */}
          <div className="flex-1"></div>

          <DashboardNavSocialIcons />
        </nav>

        {/* Bottom Actions - Desktop */}
        <div className="flex-shrink-0 p-4">
          <button
            onClick={() => {
              setSettingsOpen(true)
              if (collapseSidebarByDefault) setDesktopSidebarOpen(false)
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold">Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Drawer - Slides down from header */}
      <aside
        className={`lg:hidden fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-in-out z-50 ${
          mobileMenuOpen ? 'top-0' : 'top-full'
        }`}
      >
        {/* Menu Header with Close Button */}
        <div className="flex-shrink-0 h-16 bg-white dark:bg-[#000000] border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="h-full flex items-center justify-between px-4">
            <NavLogo height={40} width={175} onClick={() => setMobileMenuOpen(false)} />

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col">
          {/* All Menu Items with Dividers */}
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <li key={`divider-mobile-${index}`} className="my-3 border-t border-gray-200 dark:border-gray-700"></li>
              }
              if (item.type === 'social-media') {
                return null // Handle social media separately below
              }
              return (
                <li key={item.id}>
                  <Link
                    href={item.href ?? '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive(item.id)
                        ? 'bg-[#0073ba] text-white dark:bg-[#4bc4dc] dark:text-gray-900'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    <span
                      className={getInactiveIconClassName(item.id)}
                      style={{
                        color: isActive(item.id)
                          ? 'currentColor'
                          : getInactiveIconClassName(item.id)
                            ? undefined
                            : item.color
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Spacer */}
          <div className="flex-1"></div>

          <DashboardNavSocialIcons />
        </nav>

        {/* Bottom Actions - Mobile */}
        <div className="flex-shrink-0 p-4">
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              setSettingsOpen(true)
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold">Settings</span>
          </button>
        </div>
      </aside>

      {/* Settings Modal - Lazy Loaded */}
      <DashboardNavSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isAdmin={isAdmin}
      />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
