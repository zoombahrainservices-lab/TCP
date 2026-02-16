'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getUserDetailById,
  getUserProgressTimeline,
  getUserXPHistory,
  updateUserRole,
  adjustUserXP,
  adjustUserStreak,
  resetUserChapterProgress,
  deleteUser,
} from '@/app/actions/admin'
import UserProgressTimeline from '@/components/admin/UserProgressTimeline'
import XPAdjustmentModal from '@/components/admin/XPAdjustmentModal'
import Button from '@/components/ui/Button'
import {
  ArrowLeft,
  Shield,
  Trophy,
  Flame,
  BookOpen,
  Award,
  TrendingUp,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [xpHistory, setXPHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'xp' | 'badges'>('overview')
  const [showXPModal, setShowXPModal] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const [userDetail, userProgress, xpLogs] = await Promise.all([
        getUserDetailById(userId),
        getUserProgressTimeline(userId),
        getUserXPHistory(userId, { limit: 50 }),
      ])
      setUser(userDetail)
      setProgress(userProgress)
      setXPHistory(xpLogs)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      toast.success('Role updated successfully')
      loadUserData()
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleXPAdjustment = async (amount: number, reason: string) => {
    try {
      await adjustUserXP(userId, amount, reason)
      toast.success('XP adjusted successfully')
      loadUserData()
    } catch (error) {
      toast.error('Failed to adjust XP')
    }
  }

  const handleResetProgress = async (chapterId?: number) => {
    if (!confirm('Are you sure you want to reset this user\'s progress? This cannot be undone.')) {
      return
    }

    try {
      await resetUserChapterProgress(userId, chapterId)
      toast.success('Progress reset successfully')
      loadUserData()
    } catch (error) {
      toast.error('Failed to reset progress')
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return
    }

    try {
      await deleteUser(userId)
      toast.success('User deleted successfully')
      router.push('/admin/users')
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)]"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">User not found</p>
        </div>
      </div>
    )
  }

  const { profile, gamification, stats, badges } = user

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile.full_name || 'Anonymous User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {profile.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDeleteUser}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-8">
          {['overview', 'progress', 'xp', 'badges'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize
                ${activeTab === tab
                  ? 'border-[var(--color-amber)] text-[var(--color-amber)]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {gamification?.level || 1}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {gamification?.total_xp?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {gamification?.current_streak || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Chapters</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.chaptersCompleted}
              </p>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={profile.role || 'student'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm" onClick={() => setShowXPModal(true)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Adjust XP
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleResetProgress()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All Progress
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Chapter Progress
            </h2>
          </div>
          <UserProgressTimeline
            progress={progress.progress}
            xpByChapter={progress.xpByChapter}
            assessments={progress.assessments}
            sessions={progress.sessions}
          />
        </div>
      )}

      {activeTab === 'xp' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              XP History
            </h2>
            <Button variant="primary" size="sm" onClick={() => setShowXPModal(true)}>
              Adjust XP
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Chapter
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {xpHistory.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {log.reason.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={log.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {log.amount > 0 ? '+' : ''}{log.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {log.chapter_id ? `Chapter ${log.chapter_id}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Badges & Achievements
          </h2>
          {badges.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No badges earned yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {badges.map((userBadge: any) => (
                <div
                  key={userBadge.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center"
                >
                  <div className="text-4xl mb-3">{userBadge.badges.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {userBadge.badges.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {userBadge.badges.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Earned {new Date(userBadge.awarded_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* XP Adjustment Modal */}
      <XPAdjustmentModal
        isOpen={showXPModal}
        onClose={() => setShowXPModal(false)}
        onSubmit={handleXPAdjustment}
        currentXP={gamification?.total_xp || 0}
      />
    </div>
  )
}
