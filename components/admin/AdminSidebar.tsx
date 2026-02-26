'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users, ArrowLeft, LayoutDashboard, Trophy, BarChart3 } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/chapters', icon: BookOpen, label: 'Chapters' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/xp', icon: Trophy, label: 'XP System' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          TCP Admin
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Platform Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          // Special case: /admin should only match exact path, not /admin/chapters etc.
          const isActive = item.href === '/admin' 
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[var(--color-amber)] text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
