'use client'

import { usePathname } from 'next/navigation'

const SETTINGS_ROUTES = [
  '/dashboard/pages',
  '/dashboard/branding',
  '/dashboard/components',
  '/dashboard/typography',
  '/dashboard/colors',
  '/dashboard/marketing',
  '/dashboard/reports',
  '/dashboard/duo-components',
  '/dashboard/font-test',
]

export function MainWithBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSettingsRoute = SETTINGS_ROUTES.some((route) => pathname?.startsWith(route))
  const showBackground = !isSettingsRoute

  return (
    <main className="flex-1 overflow-y-auto w-full pb-safe relative">
      {showBackground && (
        <>
          {/* Mobile: Lightweight CSS gradient only (no images) */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 md:hidden"
            style={{ zIndex: 0 }}
          />
          {/* Desktop: Single decorative background div - only active theme loads via CSS */}
          <div 
            className="absolute inset-0 hidden md:block md:bg-dashboard-light md:dark:bg-dashboard-dark bg-cover bg-center"
            style={{ zIndex: 0 }}
          />
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </main>
  )
}
