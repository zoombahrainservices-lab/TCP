'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { FooterFaqPreview } from '@/components/landing/FooterFaqPreview'
import { HeroSection } from '@/components/landing/HeroSection'
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection'
import { WhatIsTcpSection } from '@/components/landing/WhatIsTcpSection'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ForWhomSection } from '@/components/landing/ForWhomSection'
import { CTASection } from '@/components/landing/CTASection'
import { WhatStudentsSaySection } from '@/components/landing/WhatStudentsSaySection'

export function LandingPageWrapper() {
  const buttonsRef = useRef<HTMLDivElement>(null)
  const [showNav, setShowNav] = useState(false)

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!buttonsRef.current) return
      const rect = buttonsRef.current.getBoundingClientRect()
      setShowNav(rect.bottom < 0)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#142A4A] transition-colors duration-300" style={{ scrollBehavior: 'smooth' }}>
      <LandingHeader revealOnScroll revealed={showNav} />

      {/* Page Content */}
      <HeroSection buttonsRef={buttonsRef} />
      <WhatIsTcpSection />
      <ProductShowcaseSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ForWhomSection />
      <WhatStudentsSaySection />
      <CTASection />

      {/* FAQ preview above footer */}
      <section
        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#142A4A] transition-colors duration-300"
        aria-labelledby="footer-faq-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <h2
            id="footer-faq-heading"
            className="text-2xl sm:text-3xl font-bold text-[#142A4A] dark:text-white mb-2"
          >
            Questions &amp; answers
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Straight answers about TCP — open a question for more detail, or view the full FAQ.
          </p>
          <FooterFaqPreview />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#142A4A] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <div className="relative h-16 sm:h-20 w-auto mb-4">
                <Image
                  src="/TCP-logo.png"
                  alt="TCP Logo"
                  width={280}
                  height={64}
                  className="object-contain h-16 sm:h-20 w-auto dark:hidden"
                />
                <Image
                  src="/TCP-logo-white.png"
                  alt="TCP Logo"
                  width={280}
                  height={64}
                  className="object-contain h-16 sm:h-20 w-auto hidden dark:block"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                Applied Communication Training
              </p>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#142A4A] dark:text-white mb-4">
                Quick links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#142A4A] dark:text-white mb-4">
                Get started
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/onboarding"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#ff6a38] transition-colors font-medium"
                  >
                    Get started
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    Create account
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#142A4A] dark:text-white mb-4">
                Trust &amp; safety
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/safety"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    Safety &amp; safeguarding
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/families"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0770C4] dark:hover:text-[#51BFE3] transition-colors"
                  >
                    For families
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            &copy; 2026 TCP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
