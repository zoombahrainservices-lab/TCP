'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type FoundationIntroBannerProps = {
  dayNumber: number
  hasFoundation: boolean
}

export default function FoundationIntroBanner({ 
  dayNumber, 
  hasFoundation 
}: FoundationIntroBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (hasFoundation || isDismissed) return null

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6 relative">
      {/* Close button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="pr-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Before You Dive In: Your Foundation
        </h3>
        
        <p className="text-gray-700 mb-4">
          Foundation is a quick self-check and identity exercise that helps you get more out of these 30 days.
        </p>

        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-4">
          <li>7-question self-check</li>
          <li>Optional identity statement</li>
          <li>Choose one small action to commit to</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Link href="/student/baseline">
            <Button size="md">
              Go to Foundation
            </Button>
          </Link>
          
          <Button 
            variant="secondary" 
            size="md"
            onClick={() => setIsDismissed(true)}
          >
            Continue with Day {dayNumber}
          </Button>

          <a
            href="/tcp-foundation-chapter1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 underline ml-auto"
          >
            Download Foundation PDF
          </a>
        </div>
      </div>
    </Card>
  )
}
