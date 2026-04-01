'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface AdminContentShellProps {
  children: ReactNode
}

const EDITOR_ROUTE_PATTERNS = [
  /^\/admin\/chapters\/[^/]+\/pages\/[^/]+\/edit$/,
  /^\/admin\/chapters\/[^/]+\/steps\/[^/]+\/pages\/[^/]+$/,
]

export default function AdminContentShell({ children }: AdminContentShellProps) {
  const pathname = usePathname()

  const isPageEditorRoute = EDITOR_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))

  useEffect(() => {
    if (!isPageEditorRoute) return

    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyHeight = document.body.style.height

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100dvh'

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
      document.body.style.height = previousBodyHeight
    }
  }, [isPageEditorRoute])

  return (
    <main
      style={isPageEditorRoute ? { height: '100dvh', maxHeight: '-webkit-fill-available' } : undefined}
      className={
        isPageEditorRoute
          ? 'flex flex-1 min-h-0 flex-col overflow-hidden bg-white dark:bg-gray-900 lg:ml-0'
          : 'flex-1 min-h-0 overflow-y-auto lg:ml-0'
      }
    >
      {children}
    </main>
  )
}
