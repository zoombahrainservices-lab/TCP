'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeroSection } from '@/components/landing/HeroSection'
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ForWhomSection } from '@/components/landing/ForWhomSection'
import { CTASection } from '@/components/landing/CTASection'

export function LandingPageWrapper() {
  const [showNav, setShowNav] = useState(false)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (buttonsRef.current) {
        const buttonsRect = buttonsRef.current.getBoundingClientRect()
        // Show nav when buttons scroll past top of viewport
        setShowNav(buttonsRect.bottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Smooth scrolling for the whole page
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#142A4A] transition-colors duration-300" style={{ scrollBehavior: 'smooth' }}>
      {/* Header - appears after scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#142A4A]/95 backdrop-blur-lg transition-transform duration-300 ${
          showNav ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative h-16 w-auto">
                {/* Light mode logo */}
                <Image
                  src="/TCP-logo.png"
                  alt="The Communication Protocol"
                  width={300}
                  height={64}
                  className="object-contain h-16 w-auto dark:hidden"
                  priority
                />
                {/* Dark mode logo */}
                <Image
                  src="/TCP-logo-white.png"
                  alt="The Communication Protocol"
                  width={300}
                  height={64}
                  className="object-contain h-16 w-auto hidden dark:block"
                  priority
                />
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <button className="px-6 py-3 bg-white dark:bg-transparent border-2 border-[#0073ba] dark:border-[#4bc4dc] text-[#0073ba] dark:text-[#4bc4dc] rounded-2xl font-bold text-sm hover:bg-[#0073ba] hover:text-white dark:hover:bg-[#4bc4dc] dark:hover:text-gray-900 transition-all uppercase tracking-wide">
                  I already have an account
                </button>
              </Link>
              <Link href="/onboarding">
                <button className="px-6 py-3 bg-[#ff6a38] hover:bg-[#ff5520] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all uppercase tracking-wide">
                  GET STARTED
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <HeroSection buttonsRef={buttonsRef} />
      <ProductShowcaseSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ForWhomSection />
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#142A4A] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-20">
              {/* Light mode logo */}
              <Image
                src="/TCP-logo.png"
                alt="TCP Logo"
                width={340}
                height={80}
                className="object-contain h-20 w-auto dark:hidden"
              />
              {/* Dark mode logo */}
              <Image
                src="/TCP-logo-white.png"
                alt="TCP Logo"
                width={340}
                height={80}
                className="object-contain h-20 w-auto hidden dark:block"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Applied Communication Training
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              &copy; 2026 TCP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
