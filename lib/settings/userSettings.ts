'use client'

import { useState, useEffect } from 'react'

export interface UserSettings {
  soundEnabled: boolean
}

const STORAGE_KEY = 'tcp-settings'

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
}

// Get settings from localStorage
export function getSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage', e)
  }
  
  return DEFAULT_SETTINGS
}

// Save settings to localStorage
export function saveSettings(settings: Partial<UserSettings>) {
  if (typeof window === 'undefined') return
  
  try {
    const current = getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('tcp-settings-changed', { detail: updated }))
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e)
  }
}

// React hook for using settings
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(getSettings)
  
  useEffect(() => {
    // Listen for settings changes from other components
    const handleSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<UserSettings>
      setSettings(customEvent.detail)
    }
    
    window.addEventListener('tcp-settings-changed', handleSettingsChange)
    
    return () => {
      window.removeEventListener('tcp-settings-changed', handleSettingsChange)
    }
  }, [])
  
  const updateSettings = (updates: Partial<UserSettings>) => {
    saveSettings(updates)
    setSettings(prev => ({ ...prev, ...updates }))
  }
  
  return {
    settings,
    updateSettings,
  }
}
