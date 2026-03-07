import { Howl } from 'howler'
import { getSettings } from '@/lib/settings/userSettings'
import type { CelebrationType } from './types'

// Initialize sound objects
const sounds: Record<string, Howl> = {
  ding: new Howl({ 
    src: ['/sounds/ding.mp3'], 
    volume: 0.5,
    preload: true
  }),
  levelup: new Howl({ 
    src: ['/sounds/levelup.mp3'], 
    volume: 0.6,
    preload: true
  }),
  streak: new Howl({ 
    src: ['/sounds/streak.mp3'], 
    volume: 0.5,
    preload: true
  }),
  chapter: new Howl({ 
    src: ['/sounds/chapter.mp3'], 
    volume: 0.7,
    preload: true
  }),
  click: new Howl({ 
    src: ['/sounds/clicking.mp3'], 
    volume: 0.4,
    preload: true
  })
}

export function playSound(type: CelebrationType) {
  const settings = getSettings()
  if (!settings.soundEnabled) return
  
  try {
    // Map celebration type to sound
    const soundKey = type === 'section' ? 'ding' : type
    const sound = sounds[soundKey]
    
    if (sound) {
      // Stop if already playing, then play
      sound.stop()
      sound.play()
    }
  } catch (error) {
    console.warn('Failed to play sound:', error)
  }
}

// Play click sound for button interactions
export function playClickSound() {
  const settings = getSettings()
  if (!settings.soundEnabled) return
  
  try {
    const sound = sounds.click
    if (sound) {
      // Don't stop click sounds - allow overlapping for rapid clicks
      sound.play()
    }
  } catch (error) {
    console.warn('Failed to play click sound:', error)
  }
}

// Preload all sounds on module load
export function preloadSounds() {
  Object.values(sounds).forEach(sound => {
    try {
      sound.load()
    } catch (error) {
      console.warn('Failed to preload sound:', error)
    }
  })
}
