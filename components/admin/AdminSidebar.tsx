'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/parents', label: 'Parents', icon: '👨‍👩‍👧‍👦' },
  { href: '/admin/students', label: 'Students', icon: '🎓' },
  { href: '/admin/chapters', label: 'Manage Chapters', icon: '📚' },
  { href: '/admin/questions', label: 'Manage Questions', icon: '❓' },
]

interface AdminSidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function AdminSidebar({ isCollapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use local state if no props are passed (for standalone usage)
  const [localCollapsed, setLocalCollapsed] = useState(false)
  const collapsed = isCollapsed !== undefined ? isCollapsed : localCollapsed
  const handleToggle = onToggle || (() => setLocalCollapsed(!localCollapsed))

  if (!isClient) {
    return (
      <aside className="w-64 bg-gray-900 text-white fixed left-0 top-0 h-screen flex flex-col z-40">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    )
  }

  return (
    <aside
      className={`bg-gray-900 text-white fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && <h2 className="text-2xl font-bold">Admin Panel</h2>}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
