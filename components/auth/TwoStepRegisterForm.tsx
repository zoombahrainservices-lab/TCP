'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signUp } from '@/app/actions/auth'
import EligibilityStep from './EligibilityStep'
import AccountStep from './AccountStep'
import { getOnboardingData, getCategoryName, clearOnboardingData } from '@/lib/onboarding/storage'

type Step = 'eligibility' | 'account'

interface EligibilityData {
  birthYear: number
  country: string
}

export default function TwoStepRegisterForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('eligibility')
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null)
  const [onboardingData, setOnboardingData] = useState<ReturnType<typeof getOnboardingData>>(null)

  useEffect(() => {
    const data = getOnboardingData()
    if (data) {
      console.log('Onboarding data retrieved:', data)
    }
    setOnboardingData(data)
  }, [])

  const handleEligibilityNext = (data: EligibilityData) => {
    setEligibilityData(data)
    setCurrentStep('account')
  }

  const handleAccountBack = () => {
    setCurrentStep('eligibility')
  }

  const handleAccountSubmit = async (accountData: { email: string; password: string }) => {
    if (!eligibilityData) {
      throw new Error('Missing eligibility data')
    }

    // For now, pass empty string for fullName since we'll collect it during onboarding
    // In the future, we can store birthYear and country in the profile
    const result = await signUp(accountData.email, accountData.password, '')

    if (result?.error) {
      throw new Error(result.error)
    }

    // Clear onboarding data after successful registration
    clearOnboardingData()
    router.push(result?.redirectTo || '/dashboard')
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            currentStep === 'eligibility'
              ? 'bg-[#0770C4] text-white dark:bg-[#51BFE3] dark:text-gray-900'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          <span className="font-bold">1</span>
          <span className="hidden sm:inline">Eligibility</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600" />
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            currentStep === 'account'
              ? 'bg-[#0770C4] text-white dark:bg-[#51BFE3] dark:text-gray-900'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          <span className="font-bold">2</span>
          <span className="hidden sm:inline">Account</span>
        </div>
      </div>

      {/* Show onboarding data if available */}
      <AnimatePresence>
        {onboardingData && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 150 }}
            className="bg-gradient-to-r from-[#0073ba]/10 to-[#4bc4dc]/10 dark:from-[#0073ba]/20 dark:to-[#4bc4dc]/20 border-2 border-[#0073ba]/30 dark:border-[#4bc4dc]/30 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0073ba] to-[#4bc4dc] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                ✓
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Your focus area:</p>
                <p className="text-base font-bold text-[#0073ba] dark:text-[#4bc4dc]">
                  {getCategoryName(onboardingData.category)}
                </p>
              </div>
            </div>
            {onboardingData.specificIssue && (
              <div className="pl-13 mb-2">
                <p className="text-xs text-gray-700 dark:text-gray-300">{onboardingData.specificIssue}</p>
              </div>
            )}
            {onboardingData.dailyCommitment > 0 && (
              <div className="pl-13">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Daily commitment: <span className="font-semibold">{onboardingData.dailyCommitment} min/day</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === 'eligibility' && (
          <EligibilityStep key="eligibility" onNext={handleEligibilityNext} />
        )}
        {currentStep === 'account' && eligibilityData && (
          <AccountStep
            key="account"
            eligibilityData={eligibilityData}
            onBack={handleAccountBack}
            onSubmit={handleAccountSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
