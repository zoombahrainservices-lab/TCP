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
    <main
      className={`flex-1 overflow-y-auto w-full pb-safe relative ${
        showBackground
          ? "bg-[url('/BG.png')] dark:bg-[url('/dbg.png')] bg-cover bg-center bg-no-repeat"
          : ''
      }`}
    >
      <div className="relative z-10">
        {children}
      </div>
    </main>
  )
}
