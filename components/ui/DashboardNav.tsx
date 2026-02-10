'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import { signOut } from '@/app/actions/auth'

const STORAGE_KEY = 'tcpCurrentChapter'

type DashboardNavProps = {
  /** When on dashboard, use this so Framework/Techniques/Resolution/Follow-through match current chapter */
  serverCurrentChapter?: number
}

export function DashboardNav({ serverCurrentChapter }: DashboardNavProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const frameworkHref = `/read/${chapterSlugByNumber[activeChapter] ?? 'stage-star-silent-struggles'}/framework`
  const techniquesHref = `/read/${chapterSlugByNumber[activeChapter] ?? 'stage-star-silent-struggles'}/techniques`

  const followThroughHref = `/read/${chapterSlugByNumber[activeChapter] ?? 'stage-star-silent-struggles'}/follow-through`
  const resolutionHref = `/read/${chapterSlugByNumber[activeChapter] ?? 'stage-star-silent-struggles'}/proof`

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
      href: `/chapter/${activeChapter}/reading`,
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
      href: `/chapter/${activeChapter}/assessment`,
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

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header - IN FLOW not fixed */}
      <header className="lg:hidden flex-shrink-0 h-16 bg-white dark:bg-[#000000] border-b border-gray-200 dark:border-gray-700 shadow-sm z-50">
        <div className="h-full flex items-center justify-between px-4">
          {/* Logo - Left Side */}
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <div className="relative h-10">
              <Image 
                src="/TCP-logo.png" 
                alt="TCP" 
                width={175}
                height={40}
                className="object-contain h-10 w-auto dark:hidden"
              />
              <Image 
                src="/TCP-logo-white.png" 
                alt="TCP" 
                width={175}
                height={40}
                className="object-contain h-10 w-auto hidden dark:block"
              />
            </div>
          </Link>

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

      {/* Desktop Sidebar - Full height */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {/* Logo Section */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#000000] px-6 py-4">
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity block">
            <div className="relative h-12">
              <Image 
                src="/TCP-logo.png" 
                alt="TCP" 
                width={210}
                height={48}
                className="object-contain h-12 w-auto dark:hidden"
              />
              <Image 
                src="/TCP-logo-white.png" 
                alt="TCP" 
                width={210}
                height={48}
                className="object-contain h-12 w-auto hidden dark:block"
              />
            </div>
          </Link>
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
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive(item.href ?? '')
                        ? 'bg-[#0073ba] text-white dark:bg-[#4bc4dc] dark:text-gray-900'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    <span style={{ color: isActive(item.href ?? '') ? 'currentColor' : item.color }}>
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

          {/* Social Media Icons - Left Aligned */}
          <div className="flex justify-start gap-4 py-3 px-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </nav>

        {/* Bottom Actions - Desktop */}
        <div className="flex-shrink-0 p-4">
          <button
            onClick={() => setSettingsOpen(true)}
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
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative h-10">
                <Image 
                  src="/TCP-logo.png" 
                  alt="TCP" 
                  width={175}
                  height={40}
                  className="object-contain h-10 w-auto dark:hidden"
                />
                <Image 
                  src="/TCP-logo-white.png" 
                  alt="TCP" 
                  width={175}
                  height={40}
                  className="object-contain h-10 w-auto hidden dark:block"
                />
              </div>
            </Link>

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
                      isActive(item.href ?? '')
                        ? 'bg-[#0073ba] text-white dark:bg-[#4bc4dc] dark:text-gray-900'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    <span style={{ color: isActive(item.href ?? '') ? 'currentColor' : item.color }}>
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

          {/* Social Media Icons - Left Aligned */}
          <div className="flex justify-start gap-4 py-3 px-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#0073ba] dark:hover:text-[#4bc4dc] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
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

      {/* Settings Modal */}
      {settingsOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSettingsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Settings
                </h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Admin Panel Pages */}
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 sm:mb-3">Admin Panel</p>
                  <Link href="/dashboard/pages" onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold">Pages</span>
                  </Link>
                  <Link href="/dashboard/branding" onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-semibold">Branding</span>
                  </Link>
                  <Link href="/dashboard/components" onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                    <span className="font-semibold">Components</span>
                  </Link>
                  <Link href="/dashboard/typography" onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="font-semibold">Typography</span>
                  </Link>
                  <Link href="/dashboard/colors" onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="font-semibold">Colors</span>
                  </Link>
                  <Link href="/dashboard/marketing" onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <span className="font-semibold">Marketing</span>
                  </Link>
                  <Link href="/dashboard/reports" onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold">Reports</span>
                  </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      Theme
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Sign Out Button */}
                <form action={signOut} className="w-full">
                  <Button
                    type="submit"
                    variant="danger"
                    fullWidth
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

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
