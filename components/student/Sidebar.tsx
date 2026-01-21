'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  User, 
  BarChart3, 
  LogOut, 
  BookOpen,
  Trophy,
  Settings
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'

interface SidebarProps {
  userId: string
  userName?: string
}

export default function Sidebar({ userId, userName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/student' },
    { id: 'missions', icon: BookOpen, label: 'Missions', href: '/student/missions' },
    { id: 'progress', icon: Trophy, label: 'Progress', href: '/student/progress' },
    { id: 'stats', icon: BarChart3, label: 'Statistics', href: '/student/stats' },
    { id: 'profile', icon: User, label: 'Profile', href: `/student/profile` },
    { id: 'settings', icon: Settings, label: 'Settings', href: '/student/settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/student') {
      return pathname === '/student'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-blue-800 text-white rounded-lg shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on both mobile and desktop */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-blue-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-64 shadow-2xl flex-shrink-0 overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-2xl">📖</div>
                <div>
                  <h2 className="font-bold text-sm">TCP</h2>
                  <p className="text-xs text-blue-200">Student Portal</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden p-1 hover:bg-blue-800 rounded"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {userName && (
              <p className="mt-2 text-sm text-blue-200 truncate">
                {userName}
              </p>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
