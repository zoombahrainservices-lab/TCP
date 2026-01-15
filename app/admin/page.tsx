import { requireAuth } from '@/lib/auth/guards'
import { getUserStats } from '@/app/actions/admin'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default async function AdminDashboard() {
  await requireAuth('admin')
  const stats = await getUserStats()

  return (
    <div className="max-w-7xl mx-auto">
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
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📚
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Chapters</h3>
                  <p className="text-sm text-gray-600">Create and edit the 30-day curriculum</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/students">
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  🎓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">View and manage all users</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}
