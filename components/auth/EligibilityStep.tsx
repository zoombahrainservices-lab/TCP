'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import LoadingButton from '@/components/ui/LoadingButton'
import { validateBirthYear, getCountryOptions, checkAgeEligibility } from '@/lib/auth/age-eligibility'

interface EligibilityStepProps {
  onNext: (data: { birthYear: number; country: string }) => void
  onBack?: () => void
}

export default function EligibilityStep({ onNext, onBack }: EligibilityStepProps) {
  const [birthYear, setBirthYear] = useState('')
  const [country, setCountry] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ageBlocked, setAgeBlocked] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAgeBlocked(false)

    const yearNum = parseInt(birthYear, 10)
    const validation = validateBirthYear(yearNum)

    if (!validation.valid) {
      setError(validation.message || 'Invalid birth year.')
      return
    }

    if (!country) {
      setError('Please select your country or region.')
      return
    }

    setLoading(true)

    // Check age eligibility
    const eligibility = checkAgeEligibility(yearNum)

    if (!eligibility.eligible) {
      setAgeBlocked(true)
      setError(eligibility.message || 'Age verification failed.')
      setLoading(false)
      return
    }

    // Proceed to next step
    onNext({ birthYear: yearNum, country })
    setLoading(false)
  }

  const countryOptions = getCountryOptions()

  if (ageBlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-700 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Parental consent required
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {error}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            TCP is designed for users 13 and older. For younger users, we&apos;re building a family-friendly signup process with parent/guardian involvement.
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            ← Go back
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="w-full">
          <label htmlFor="birth-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Birth year
          </label>
          <input
            id="birth-year"
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="YYYY"
            required
            min="1900"
            max={new Date().getFullYear()}
            disabled={loading}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0770C4] dark:focus:ring-[#51BFE3] focus:border-transparent border-gray-300 dark:border-gray-600"
          />
        </div>

        <div className="w-full">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country / Region
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0770C4] dark:focus:ring-[#51BFE3] focus:border-transparent border-gray-300 dark:border-gray-600"
          >
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={!option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            We ask this to help protect younger users and show the right account setup.
          </p>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        <LoadingButton type="submit" variant="calm" fullWidth loading={loading}>
          Continue
        </LoadingButton>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50"
          >
            ← Go back
          </button>
        )}
      </form>
    </motion.div>
  )
}
