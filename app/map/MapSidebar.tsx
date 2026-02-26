'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Map as MapIcon, 
  BookOpen, 
  CheckSquare, 
  Layers, 
  Lightbulb, 
  Target,
  TrendingUp,
  User,
  BarChart3,
  HelpCircle,
  Settings,
  Shield
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { signOut } from '@/app/actions/auth'
import Button from '@/components/ui/Button'

interface MapSidebarProps {
  currentChapterSlug: string
  isAdmin: boolean
}

export default function MapSidebar({ currentChapterSlug, isAdmin }: MapSidebarProps) {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const navItems = [
    { href: '/map', icon: MapIcon, label: 'Map', exact: true },
    { href: `/read/${currentChapterSlug}`, icon: BookOpen, label: 'Reading' },
    { href: `/read/${currentChapterSlug}/assessment`, icon: CheckSquare, label: 'Self-Check' },
    { href: `/read/${currentChapterSlug}/framework`, icon: Layers, label: 'Framework' },
    { href: `/read/${currentChapterSlug}/techniques`, icon: Lightbulb, label: 'Techniques' },
    { href: `/read/${currentChapterSlug}/proof`, icon: Target, label: 'Resolution' },
    { href: `/read/${currentChapterSlug}/follow-through`, icon: TrendingUp, label: 'Follow-Through' },
    { href: '/dashboard', icon: User, label: 'Profile' },
    { href: '/reports', icon: BarChart3, label: 'Report' },
    { href: '/help', icon: HelpCircle, label: 'Help' },
  ]

  return (
    <>
      <div className="w-64 h-screen flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="text-2xl font-bold text-[var(--color-amber)]">
            TCP
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            PROTOCOL
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSettingsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      Theme
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Sign Out Button */}
                <form action={signOut} className="w-full">
                  <Button
                    type="submit"
                    variant="danger"
                    fullWidth
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
