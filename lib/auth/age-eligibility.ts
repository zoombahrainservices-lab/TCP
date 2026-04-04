/**
 * Age eligibility utilities for TCP registration
 * Determines minimum age requirements and age-gating logic
 */

export interface AgeEligibility {
  eligible: boolean
  requiresParentalConsent: boolean
  message?: string
}

/**
 * Minimum age for self-serve account creation (can be adjusted per business requirements)
 */
const MINIMUM_AGE = 13

/**
 * Age at which parental consent is recommended but not blocking
 */
const PARENTAL_CONSENT_AGE = 16

/**
 * Calculate age from birth year
 */
export function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear()
  return currentYear - birthYear
}

/**
 * Check if user meets age eligibility requirements
 */
export function checkAgeEligibility(birthYear: number): AgeEligibility {
  const age = calculateAge(birthYear)

  if (age < MINIMUM_AGE) {
    return {
      eligible: false,
      requiresParentalConsent: true,
      message: 'You need a parent or guardian to help create your account.',
    }
  }

  if (age < PARENTAL_CONSENT_AGE) {
    return {
      eligible: true,
      requiresParentalConsent: true,
      message: 'We recommend having a parent or guardian review TCP with you.',
    }
  }

  return {
    eligible: true,
    requiresParentalConsent: false,
  }
}

/**
 * Validate birth year input
 */
export function validateBirthYear(year: number): { valid: boolean; message?: string } {
  const currentYear = new Date().getFullYear()
  const minYear = 1900
  const maxYear = currentYear

  if (isNaN(year)) {
    return { valid: false, message: 'Please enter a valid year.' }
  }

  if (year < minYear || year > maxYear) {
    return { valid: false, message: `Please enter a year between ${minYear} and ${maxYear}.` }
  }

  return { valid: true }
}

/**
 * Get list of countries/regions for registration
 * Can be expanded or integrated with a countries library
 */
export function getCountryOptions(): { value: string; label: string }[] {
  return [
    { value: '', label: 'Select your country/region' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'BH', label: 'Bahrain' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'IN', label: 'India' },
    { value: 'OTHER', label: 'Other' },
  ]
}
