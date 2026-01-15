import { requireAuth } from '@/lib/auth/guards'
import { getUserStats } from '@/app/actions/admin'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default async function AdminDashboard() {
  await requireAuth('admin')
  const stats = await getUserStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.students}</div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats.parents}</div>
            <div className="text-sm text-gray-600">Parents</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.mentors}</div>
            <div className="text-sm text-gray-600">Mentors</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-600 mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/chapters">
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Chapters</h3>
                  <p className="text-sm text-gray-600">Create and edit the 30-day curriculum</p>
                </div>
              </div>
            </div>
          </Link>
          
          <div className="border-2 border-gray-200 rounded-lg p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
