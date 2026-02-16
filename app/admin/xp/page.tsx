'use client'

import { useState, useEffect } from 'react'
import {
  getXPSystemStats,
  getAllXPLogs,
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} from '@/app/actions/admin'
import BadgeEditor from '@/components/admin/BadgeEditor'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Button from '@/components/ui/Button'
import { Trophy, Award, Flame, TrendingUp, Plus, Edit, Trash2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function XPSystemPage() {
  const [stats, setStats] = useState<any>(null)
  const [xpLogs, setXPLogs] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'badges' | 'streaks'>('overview')
  const [showBadgeEditor, setShowBadgeEditor] = useState(false)
  const [editingBadge, setEditingBadge] = useState<any>(null)
  const [confirmDialog, setConfirmDialog] = useState<any>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, logsData, badgesData] = await Promise.all([
        getXPSystemStats(),
        getAllXPLogs({}, { page: 1, perPage: 50 }),
        getAllBadges(),
      ])
      setStats(statsData)
      setXPLogs(logsData.logs)
      setBadges(badgesData)
    } catch (error) {
      console.error('Error loading XP data:', error)
      toast.error('Failed to load XP system data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBadge = () => {
    setEditingBadge(null)
    setShowBadgeEditor(true)
  }

  const handleEditBadge = (badge: any) => {
    setEditingBadge(badge)
    setShowBadgeEditor(true)
  }

  const handleSaveBadge = async (data: any) => {
    try {
      if (editingBadge) {
        await updateBadge(editingBadge.id, data)
        toast.success('Badge updated successfully')
      } else {
        await createBadge(data)
        toast.success('Badge created successfully')
      }
      setShowBadgeEditor(false)
      setEditingBadge(null)
      loadData()
    } catch (error) {
      toast.error('Failed to save badge')
    }
  }

  const handleDeleteBadge = (badge: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Badge',
      message: `Are you sure you want to delete "${badge.name}"? This will remove it from all users who have earned it.`,
      onConfirm: async () => {
        try {
          await deleteBadge(badge.id)
          toast.success('Badge deleted successfully')
          loadData()
        } catch (error) {
          toast.error('Failed to delete badge')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          XP System Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage XP, badges, and gamification
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-8">
          {['overview', 'logs', 'badges', 'streaks'].map((tab) => (
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
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalXP.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Level</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.avgLevel}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Streaks</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.activeStreaks}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Badges Awarded</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.badgesAwarded}
              </p>
            </div>
          </div>

          {/* XP Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              XP Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.xpDistribution).map(([range, count]: [string, any]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{range} XP</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[var(--color-amber)] h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...(Object.values(stats.xpDistribution) as number[]))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent XP Awards
            </h2>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
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
                {xpLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {log.profiles?.full_name || 'User'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Badge Management
            </h2>
            <Button variant="primary" size="sm" onClick={handleCreateBadge}>
              <Plus className="w-4 h-4 mr-2" />
              Create Badge
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge: any) => (
              <div
                key={badge.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBadge(badge)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBadge(badge)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {badge.description}
                </p>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Requirement: {badge.requirement_type.replace(/_/g, ' ')} ≥ {badge.requirement_value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Awarded {badge.timesAwarded} times
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'streaks' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Streak Management
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-600 dark:text-gray-400">
              Streak management features coming soon...
            </p>
          </div>
        </div>
      )}

      {/* Badge Editor Modal */}
      <BadgeEditor
        isOpen={showBadgeEditor}
        onClose={() => {
          setShowBadgeEditor(false)
          setEditingBadge(null)
        }}
        onSubmit={handleSaveBadge}
        initialData={editingBadge}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  )
}
