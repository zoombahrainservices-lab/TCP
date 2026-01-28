import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { getSession } from '@/lib/auth/guards'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { HeroSection } from '@/components/landing/HeroSection'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ForWhomSection } from '@/components/landing/ForWhomSection'
import { CTASection } from '@/components/landing/CTASection'

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#142A4A] transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#142A4A]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-12 h-12">
                <Image 
                  src="/chapters/TCP-logo.png" 
                  alt="The Communication Protocol" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#142A4A] dark:text-white">
                  The Communication Protocol
                </h1>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/auth/login">
                <Button 
                  variant="secondary" 
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#142A4A] dark:text-white border border-gray-300 dark:border-gray-600"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ForWhomSection />
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#142A4A] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image 
                  src="/chapters/TCP-logo.png" 
                  alt="TCP Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-[#142A4A] dark:text-white">
                The Communication Protocol
              </span>
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
