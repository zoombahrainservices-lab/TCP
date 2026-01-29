'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import Typed from 'typed.js'

interface HeroSectionProps {
  buttonsRef?: React.RefObject<HTMLDivElement | null>
}

export function HeroSection({ buttonsRef }: HeroSectionProps) {
  const typedElement = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!typedElement.current) return

    const typed = new Typed(typedElement.current, {
      strings: [
        "communicate.^600",
        "lead.^400",
        "connect.^700",
        "influence.^500",
        "express.^600",
        "persuade.^500",
        "clarify.^650",
        "present.^550",
        "negotiate.^600",
        "listen.^500",
        "speak up.^700",
        "stand out.^600",
        "collaborate.^650",
        "navigate.^550",
        "respond.^500",
        "achieve.^600",
        "change.^500",
        "impact.^700",
        "align.^550",
        "grow.^500"
      ],
      typeSpeed: 55,
      backSpeed: 35,
      backDelay: 1200,
      startDelay: 500,
      smartBackspace: true,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      shuffle: true
    })

    return () => {
      typed.destroy()
    }
  }, [])
  return (
    <section className="relative h-screen w-full overflow-hidden bg-white dark:bg-[#142A4A] flex items-center">
      <style dangerouslySetInnerHTML={{__html: `
        .typed-cursor {
          display: inline !important;
        }
      `}} />
      <div className="container mx-auto px-4 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Hero character with animated circles - bigger and touching bottom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative -mx-4 sm:-mx-8 lg:-ml-16 xl:-ml-24 -mb-16 sm:-mb-20 md:-mb-24 lg:-mb-32"
          >
            <div className="relative w-full">
              {/* Two animated spinning circles - brand colors */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-[3px] sm:border-[4px] border-[#0073ba]/35 rounded-full"
                style={{ transform: 'scale(0.9)' }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-[3px] sm:border-[4px] border-[#ff6a38]/30 rounded-full"
                style={{ transform: 'scale(1.05)' }}
              />
              
              {/* Hero image - MASSIVE and touches bottom */}
              <Image
                src="/hero.png"
                alt="Hero"
                width={1800}
                height={1350}
                priority
                className="relative z-10 w-full h-auto object-contain object-bottom scale-140 sm:scale-145 md:scale-150 lg:scale-155"
                sizes="(max-width: 640px) 140vw, (max-width: 1024px) 120vw, 90vw"
              />
            </div>
          </motion.div>

          {/* Right: Content - centered vertically */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 text-center lg:text-left space-y-6 lg:space-y-8 lg:self-center relative z-20 lg:pl-8 xl:pl-12"
          >
            {/* Animated TCP Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.3,
                type: "spring",
                stiffness: 100
              }}
              className="flex justify-center lg:justify-start mb-6"
            >
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 sm:w-40 md:w-48"
              >
                <Image
                  src="/TCP-Logo.svg"
                  alt="TCP Logo"
                  width={200}
                  height={60}
                  className="w-full h-auto"
                  priority
                />
              </motion.div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
              <span className="block">Learn to</span>
              <span className="block min-h-[1.2em]">
                <span ref={typedElement} className="text-[#0073ba] dark:text-[#4bc4dc]"></span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
              Build real communication skills.
            </p>

            <div ref={buttonsRef} className="flex flex-col gap-4 items-center lg:items-start pt-2 sm:pt-4">
              <Link href="/onboarding">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-[#ff6a38] hover:bg-[#ff5520] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all uppercase tracking-wide"
                >
                  GET STARTED
                </motion.button>
              </Link>
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-white dark:bg-transparent border-2 border-[#0073ba] dark:border-[#4bc4dc] text-[#0073ba] dark:text-[#4bc4dc] rounded-2xl font-bold text-sm hover:bg-[#0073ba] hover:text-white dark:hover:bg-[#4bc4dc] dark:hover:text-gray-900 transition-all uppercase tracking-wide"
                >
                  I ALREADY HAVE AN ACCOUNT
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
