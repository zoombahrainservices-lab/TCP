'use client'

import { useState, useEffect } from 'react'
import { getAllUsers } from '@/app/actions/admin'
import UserTable from '@/components/admin/UserTable'
import Button from '@/components/ui/Button'
import { Search, Filter, Download } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'xp' | 'level' | 'created' | 'lastActive'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadUsers()
  }, [search, roleFilter, sortBy, sortOrder, page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await getAllUsers(
        {
          role: roleFilter,
          search,
          sortBy,
          sortOrder,
        },
        {
          page,
          perPage: 50,
        }
      )
      setUsers(result.users)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage all platform users
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
            >
              <option value="created">Join Date</option>
              <option value="xp">XP</option>
              <option value="level">Level</option>
              <option value="lastActive">Last Active</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </Button>
          
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)] mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading users...</p>
        </div>
      ) : (
        <>
          <UserTable users={users} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
