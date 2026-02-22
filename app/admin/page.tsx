import { getAdminDashboardStats, getRecentActivity } from '@/app/actions/admin'
import StatCard from '@/components/admin/StatCard'
import { Users, BookOpen, Trophy, TrendingUp, UserPlus, CheckCircle, Award } from 'lucide-react'
import Link from 'next/link'

// OPTIMIZED: Revalidate every 60 seconds for fresh data
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats()
  const activity = await getRecentActivity(5)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Platform overview and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={Users}
          iconColor="text-blue-500"
          trend={{
            value: `${stats.users.newThisWeek} new this week`,
            isPositive: true,
          }}
        />
        <StatCard
          title="Active Today"
          value={stats.users.activeToday}
          icon={TrendingUp}
          iconColor="text-green-500"
        />
        <StatCard
          title="Total Chapters"
          value={stats.chapters.total}
          icon={BookOpen}
          iconColor="text-purple-500"
          trend={{
            value: `${stats.chapters.published} published`,
            isPositive: true,
          }}
        />
        <StatCard
          title="Total XP Awarded"
          value={stats.xp.totalAwarded.toLocaleString()}
          icon={Trophy}
          iconColor="text-amber-500"
          trend={{
            value: `Avg level ${stats.xp.avgLevel}`,
            isPositive: true,
          }}
        />
      </div>

      {/* User Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Users by Role
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.users.byRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  {role}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Content Overview
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Parts</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats.parts.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Published Chapters</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {stats.chapters.published}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Draft Chapters</span>
              <span className="font-bold text-gray-600 dark:text-gray-400">
                {stats.chapters.drafts}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Signups
            </h2>
          </div>
          <div className="space-y-3">
            {activity.recentUsers.slice(0, 5).map((user: any) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="block p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.full_name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/admin/users"
            className="block mt-4 text-sm text-[var(--color-amber)] hover:underline"
          >
            View all users →
          </Link>
        </div>

        {/* Recent Completions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Completions
            </h2>
          </div>
          <div className="space-y-3">
            {activity.recentCompletions.slice(0, 5).map((completion: any) => (
              <div
                key={completion.id}
                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {completion.profiles?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Chapter {completion.chapter_id} • {new Date(completion.completed_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent XP Awards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent XP Awards
            </h2>
          </div>
          <div className="space-y-3">
            {activity.recentXP.slice(0, 5).map((xp: any) => (
              <div
                key={xp.id}
                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {xp.profiles?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  +{xp.amount} XP • {xp.reason.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/admin/xp"
            className="block mt-4 text-sm text-[var(--color-amber)] hover:underline"
          >
            View XP system →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-[var(--color-amber)] transition-colors text-center"
          >
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Manage Users
            </p>
          </Link>
          
          <Link
            href="/admin/chapters"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-[var(--color-amber)] transition-colors text-center"
          >
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Edit Chapters
            </p>
          </Link>
          
          <Link
            href="/admin/xp"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-[var(--color-amber)] transition-colors text-center"
          >
            <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              XP System
            </p>
          </Link>
          
          <Link
            href="/admin/analytics"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-[var(--color-amber)] transition-colors text-center"
          >
            <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              View Analytics
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
