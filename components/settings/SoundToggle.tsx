'use client'

import { useUserSettings } from '@/lib/settings/userSettings'
import { Volume2, VolumeX } from 'lucide-react'

export default function SoundToggle() {
  const { settings, updateSettings } = useUserSettings()
  
  const handleToggle = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled })
  }
  
  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      aria-label={settings.soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
    >
      {settings.soundEnabled ? (
        <Volume2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      ) : (
        <VolumeX className="h-5 w-5 text-gray-400" />
      )}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sound Effects
      </span>
      <div
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          settings.soundEnabled
            ? 'bg-green-600'
            : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  )
}
