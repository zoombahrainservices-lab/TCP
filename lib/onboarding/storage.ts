/**
 * Onboarding data storage utilities
 * Stores user preferences before registration and retrieves them during account creation
 */

export interface OnboardingData {
  category: string
  specificIssue: string
  dailyCommitment: number
  startChoice: string
  timestamp: string
}

/**
 * Get complete onboarding data from localStorage
 */
export function getOnboardingData(): OnboardingData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const category = localStorage.getItem('onboarding_category')
    const issue = localStorage.getItem('onboarding_issue')
    const commitment = localStorage.getItem('onboarding_commitment')
    const startChoice = localStorage.getItem('onboarding_start_choice')
    const timestamp = localStorage.getItem('onboarding_timestamp')
    const complete = localStorage.getItem('onboarding_complete')
    
    if (!category || !complete) return null
    
    // Check if data is less than 7 days old
    if (timestamp) {
      const savedDate = new Date(timestamp)
      const now = new Date()
      const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysDiff > 7) {
        clearOnboardingData()
        return null
      }
    }
    
    return {
      category,
      specificIssue: issue || '',
      dailyCommitment: commitment ? parseInt(commitment) : 10,
      startChoice: startChoice || '',
      timestamp: timestamp || ''
    }
  } catch (error) {
    console.error('Failed to retrieve onboarding data:', error)
    return null
  }
}

/**
 * Clear onboarding data from localStorage
 * Should be called after successfully creating an account and saving the data
 */
export function clearOnboardingData(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('onboarding_category')
    localStorage.removeItem('onboarding_issue')
    localStorage.removeItem('onboarding_commitment')
    localStorage.removeItem('onboarding_start_choice')
    localStorage.removeItem('onboarding_timestamp')
    localStorage.removeItem('onboarding_complete')
  } catch (error) {
    console.error('Failed to clear onboarding data:', error)
  }
}

/**
 * Map focus area IDs to display names
 */
export function getCategoryName(id: string): string {
  const names: Record<string, string> = {
    'myself': 'Myself',
    'friends-family': 'Friends & Family',
    'school-work': 'School or Work',
    'influence-leadership': 'Influence & Leadership',
    'complex-situations': 'Complex Situations',
    'exploring': 'Just Exploring'
  }
  
  return names[id] || id
}

/**
 * Map category to internal field name for database storage
 */
export function getInternalFieldName(category: string): string {
  const mapping: Record<string, string> = {
    'myself': 'self_focus_issue',
    'friends-family': 'relationship_issue',
    'school-work': 'work_issue',
    'influence-leadership': 'influence_goal',
    'complex-situations': 'complex_challenge',
    'exploring': 'exploration_mode'
  }
  
  return mapping[category] || 'other'
}

/**
 * Save onboarding data (legacy function for compatibility)
 */
export function saveOnboardingData(focusArea: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('onboarding_category', focusArea)
  } catch (error) {
    console.error('Failed to save onboarding data:', error)
  }
}

/**
 * Get focus area name (legacy function for compatibility)
 */
export function getFocusAreaName(id: string): string {
  return getCategoryName(id)
}
