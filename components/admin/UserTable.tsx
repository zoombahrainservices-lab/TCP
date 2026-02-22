'use client'

import Link from 'next/link'
import { useState, memo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Eye, Trash2, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  user_gamification?: Array<{
    total_xp: number
    level: number
    current_streak: number
    last_active_date: string
  }>
}

interface UserTableProps {
  users: User[]
  onDelete?: (userId: string) => void
}

// OPTIMIZED: Memoized to prevent unnecessary re-renders
export default memo(function UserTable({ users, onDelete }: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const parentRef = useRef<HTMLDivElement>(null)

  // OPTIMIZED: Virtualize user rows for better performance with large lists
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // Approximate row height in pixels
    overscan: 5, // Render 5 extra items above/below viewport
  })

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const toggleAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                XP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Streak
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
        </table>
        {/* OPTIMIZED: Virtualized tbody with scrollable container */}
        <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
          <table className="w-full">
            <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const user = users[virtualRow.index]
                const gamification = user.user_gamification?.[0]
                
                return (
                  <tr
                    key={user.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {user.role || 'student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {gamification?.level || 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {gamification?.total_xp || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {gamification?.current_streak || 0} days
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedUsers.size > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedUsers.size} user(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
              const gamification = user.user_gamification?.[0]
              
              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' : ''}
                        ${user.role === 'mentor' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100' : ''}
                        ${user.role === 'student' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : ''}
                        ${user.role === 'parent' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : ''}
                      `}
                    >
                      {user.role === 'admin' && <Shield className="w-3 h-3" />}
                      {user.role || 'student'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {gamification?.level || 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {gamification?.total_xp?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {gamification?.current_streak || 0} 🔥
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-[var(--color-amber)] hover:text-[#d49f01] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(user.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      )}
    </div>
  )
})
