'use client'

import { useState } from 'react'
import { signOut } from '@/app/actions/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'

interface AdminLayoutClientProps {
  children: React.ReactNode
  userFullName: string
}

export function AdminLayoutClient({ children, userFullName }: AdminLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '256px' }}
      >
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">Welcome, {userFullName}</p>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">Sign Out</Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
