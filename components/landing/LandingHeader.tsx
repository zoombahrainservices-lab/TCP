'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type LandingHeaderProps = {
  /** Home landing: hide until user scrolls past the hero CTAs */
  revealOnScroll?: boolean
  /** When `revealOnScroll`, true = navbar visible */
  revealed?: boolean
}

export function LandingHeader({ revealOnScroll = false, revealed = true }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (revealOnScroll && !revealed) {
      setMobileMenuOpen(false)
    }
  }, [revealOnScroll, revealed])

  const slideClass = revealOnScroll
    ? `transition-transform duration-300 ease-out ${revealed ? 'translate-y-0' : '-translate-y-full'}`
    : ''

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#142A4A]/95 backdrop-blur-lg font-[var(--font-body)] ${slideClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="relative h-12 sm:h-16 w-auto">
              <Image
                src="/TCP-logo.png"
                alt="The Communication Protocol"
                width={200}
                height={40}
                className="object-contain h-12 sm:h-16 w-auto dark:hidden"
              />
              <Image
                src="/TCP-logo-white.png"
                alt="The Communication Protocol"
                width={200}
                height={40}
                className="object-contain h-12 sm:h-16 w-auto hidden dark:block"
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10 lg:gap-12 text-base font-semibold text-[#142A4A] dark:text-white/90">
            <Link
              href="/how-it-works"
              className="hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className="hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
            >
              About
            </Link>
            <Link href="/faq" className="hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login" className="hidden md:block">
              <button className="px-4 py-[9px] sm:px-6 sm:py-[11px] bg-white dark:bg-transparent border-2 border-[#0073ba] dark:border-[#4bc4dc] text-[#0073ba] dark:text-[#4bc4dc] rounded-2xl font-bold text-sm hover:bg-[#0073ba] hover:text-white dark:hover:bg-[#4bc4dc] dark:hover:text-gray-900 transition-all uppercase tracking-wide">
                Log in
              </button>
            </Link>
            <Link href="/onboarding">
              <button className="px-3 py-2 sm:px-7 sm:py-3.5 bg-[#ff6a38] hover:bg-[#ff5520] text-white rounded-2xl font-bold text-xs sm:text-sm transition-all uppercase tracking-wide">
                GET STARTED
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#0073ba] dark:border-[#4bc4dc] text-[#0073ba] dark:text-[#4bc4dc]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open menu</span>
              <div className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </div>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#142A4A] p-3">
            <nav className="flex flex-col">
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-[#142A4A] dark:text-white hover:text-[#0770C4] dark:hover:text-[#51BFE3]"
              >
                How it Works
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-[#142A4A] dark:text-white hover:text-[#0770C4] dark:hover:text-[#51BFE3]"
              >
                About
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-[#142A4A] dark:text-white hover:text-[#0770C4] dark:hover:text-[#51BFE3]"
              >
                FAQ
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-[#142A4A] dark:text-white hover:text-[#0770C4] dark:hover:text-[#51BFE3]"
              >
                Log in
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
