'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { getClient } from '@/lib/supabase/client'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

export default function DashboardNavSettingsModal({ isOpen, onClose, isAdmin = false }: SettingsModalProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const supabase = getClient()
      await supabase.auth.signOut()
    } finally {
      router.push('/auth/login')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Admin Panel Pages */}
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 sm:mb-3">Admin Panel</p>
              <Link href="/dashboard/pages" onClick={onClose} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">Pages</span>
              </Link>
              <Link href="/dashboard/branding" onClick={onClose} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-semibold">Branding</span>
              </Link>
              <Link href="/dashboard/components" onClick={onClose} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                <span className="font-semibold">Components</span>
              </Link>
              <Link href="/dashboard/typography" onClick={onClose} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="font-semibold">Typography</span>
              </Link>
              <Link href="/dashboard/colors" onClick={onClose} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="font-semibold">Colors</span>
              </Link>
              <Link href="/dashboard/marketing" onClick={onClose} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <span className="font-semibold">Marketing</span>
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={onClose} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-semibold">Admin</span>
                </Link>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Theme
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Switch between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>

            {/* Sign Out Button */}
            <Button
              type="button"
              onClick={handleSignOut}
              variant="danger"
              fullWidth
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
