'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import {
  Trophy,
  Users,
  FileText,
  Award,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getXPSystemStats,
  getAllXPLogs,
  getAllBadges,
  getAllUsers,
  createBadge,
  updateBadge,
  deleteBadge,
  getChapterXPOverview,
  setChapterXPForAllPages,
  adjustUserXP,
  adjustUserStreak,
  awardBadge,
  revokeBadge,
  setUserXP,
  deleteXPLog,
  getUserBadges,
} from '@/app/actions/admin'

type Tab = 'overview' | 'users' | 'logs' | 'badges' | 'chapters'

export default function XPSystemPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(1)
  const [badges, setBadges] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [chapterXP, setChapterXP] = useState<any[]>([])
  const [logsFilters, setLogsFilters] = useState({ userId: '', reason: '', dateFrom: '', dateTo: '' })
  const [usersSearch, setUsersSearch] = useState('')
  const [showBadgeForm, setShowBadgeForm] = useState(false)
  const [editingBadge, setEditingBadge] = useState<any>(null)
  const [adjustingUser, setAdjustingUser] = useState<string | null>(null)
  const [awardingUser, setAwardingUser] = useState<string | null>(null)
  const [editingStreakUser, setEditingStreakUser] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'overview') loadStats()
    if (activeTab === 'logs') loadLogs()
    if (activeTab === 'badges') loadBadges()
    if (activeTab === 'users') loadUsers()
    if (activeTab === 'chapters') loadChapterXP()
  }, [activeTab, logsPage, logsFilters, usersPage, usersSearch])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await getXPSystemStats()
      setStats(data)
    } catch (e) {
      toast.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (logsFilters.userId) filters.userId = logsFilters.userId
      if (logsFilters.reason) filters.reason = logsFilters.reason
      if (logsFilters.dateFrom) filters.dateFrom = logsFilters.dateFrom
      if (logsFilters.dateTo) filters.dateTo = logsFilters.dateTo
      const res = await getAllXPLogs(filters, { page: logsPage, perPage: 20 })
      setLogs(res.logs)
      setLogsTotal(res.total)
    } catch (e) {
      toast.error('Failed to load XP logs')
    } finally {
      setLoading(false)
    }
  }

  const loadBadges = async () => {
    setLoading(true)
    try {
      const data = await getAllBadges()
      setBadges(data)
    } catch (e) {
      toast.error('Failed to load badges')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await getAllUsers(
        { search: usersSearch || undefined, sortBy: 'xp', sortOrder: 'desc' },
        { page: usersPage, perPage: 20 }
      )
      setUsers(res.users)
      setUsersTotal(res.total)
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadChapterXP = async () => {
    setLoading(true)
    try {
      const data = await getChapterXPOverview()
      setChapterXP(data)
    } catch (e) {
      toast.error('Failed to load chapter XP')
    } finally {
      setLoading(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'users', label: 'Users & XP', icon: Users },
    { id: 'logs', label: 'XP Logs', icon: FileText },
    { id: 'chapters', label: 'Chapter XP', icon: BookOpen },
    { id: 'badges', label: 'Badges', icon: Award },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          XP System
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage XP, levels, streaks, and badges
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? 'border-[var(--color-amber)] text-[var(--color-amber)]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)]" />
        </div>
      )}

      {!loading && activeTab === 'overview' && stats && (
        <OverviewTab stats={stats} />
      )}

      {!loading && activeTab === 'users' && (
        <UsersTab
          users={users}
          usersTotal={usersTotal}
          usersPage={usersPage}
          setUsersPage={setUsersPage}
          usersSearch={usersSearch}
          setUsersSearch={setUsersSearch}
          badges={badges}
          loadUsers={loadUsers}
          loadBadges={loadBadges}
          adjustingUser={adjustingUser}
          setAdjustingUser={setAdjustingUser}
          awardingUser={awardingUser}
          setAwardingUser={setAwardingUser}
          editingStreakUser={editingStreakUser}
          setEditingStreakUser={setEditingStreakUser}
        />
      )}

      {!loading && activeTab === 'logs' && (
        <LogsTab
          logs={logs}
          logsTotal={logsTotal}
          logsPage={logsPage}
          setLogsPage={setLogsPage}
          logsFilters={logsFilters}
          setLogsFilters={setLogsFilters}
          loadLogs={loadLogs}
        />
      )}

      {!loading && activeTab === 'badges' && (
        <BadgesTab
          badges={badges}
          showBadgeForm={showBadgeForm}
          setShowBadgeForm={setShowBadgeForm}
          editingBadge={editingBadge}
          setEditingBadge={setEditingBadge}
          loadBadges={loadBadges}
        />
      )}

      {!loading && activeTab === 'chapters' && (
        <ChapterXPTab
          chapters={chapterXP}
          reload={loadChapterXP}
        />
      )}
    </div>
  )
}

function OverviewTab({ stats }: { stats: any }) {
  const dist = stats.xpDistribution || {}
  const topUsers = stats.topUsers || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Total XP Awarded"
          value={stats.totalXP?.toLocaleString() ?? '0'}
        />
        <StatCard
          icon={Target}
          label="Average Level"
          value={stats.avgLevel?.toFixed(1) ?? '1.0'}
        />
        <StatCard
          icon={Trophy}
          label="Active Streaks"
          value={String(stats.activeStreaks ?? 0)}
        />
        <StatCard
          icon={Award}
          label="Badges Awarded"
          value={String(stats.badgesAwarded ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            XP Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(dist).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{range} XP</span>
                <span className="font-medium text-gray-900 dark:text-white">{String(count)} users</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top 10 by XP
          </h3>
          <div className="space-y-2">
            {topUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No users yet</p>
            ) : (
              topUsers.map((u: any, i: number) => (
                <div key={u.user_id || `top-${i}`} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {i + 1}. {u.profiles?.full_name || u.profiles?.email || `User ${u.user_id?.slice(0, 8)}...`}
                  </span>
                  <span className="font-medium text-[var(--color-amber)]">{u.total_xp} XP</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Icon className="w-6 h-6 text-[var(--color-amber)]" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ChapterXPTab({ chapters, reload }: { chapters: any[]; reload: () => void }) {
  const [savingId, setSavingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const handleChange = (chapterId: string, value: string) => {
    setDrafts((d) => ({ ...d, [chapterId]: value }))
  }

  const handleApply = async (chapter: any) => {
    const raw = drafts[chapter.id] ?? ''
    const parsed = parseInt(raw || '0', 10)
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Enter a valid non-negative XP value')
      return
    }
    setSavingId(chapter.id)
    try {
      await setChapterXPForAllPages(chapter.id, parsed)
      toast.success(`Set ${parsed} XP on all pages of Chapter ${chapter.chapter_number}`)
      await reload()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update chapter XP')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Set a single XP value and apply it to all pages in a chapter. This updates the <code>xp_award</code> for every page in that chapter.
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chapter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Current XP (avg / min–max)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Set XP per page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {chapters.map((c: any) => {
              const avg = c.avgXP ?? 0
              const min = c.minXP
              const max = c.maxXP
              const draft = drafts[c.id] ?? ''
              return (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Chapter {c.chapter_number}: {c.title}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {c.pageCount ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {c.pageCount > 0 ? (
                      <span>
                        {Math.round(avg)} XP avg
                        {min !== null && max !== null && (
                          <span className="text-gray-500 dark:text-gray-400"> ({min}–{max})</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">No pages</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 items-center">
                      <input
                        type="number"
                        min={0}
                        value={draft}
                        onChange={(e) => handleChange(c.id, e.target.value)}
                        placeholder="e.g. 10"
                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <Button
                        size="sm"
                        disabled={savingId === c.id}
                        onClick={() => handleApply(c)}
                      >
                        Apply
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab({
  users,
  usersTotal,
  usersPage,
  setUsersPage,
  usersSearch,
  setUsersSearch,
  badges,
  loadUsers,
  loadBadges,
  adjustingUser,
  setAdjustingUser,
  awardingUser,
  setAwardingUser,
  editingStreakUser,
  setEditingStreakUser,
}: any) {
  const perPage = 20
  const totalPages = Math.ceil(usersTotal / perPage)

  useEffect(() => {
    if (badges.length === 0) loadBadges()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={usersSearch}
            onChange={(e) => setUsersSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">XP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Streak</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((u: any) => {
              const g = u.user_gamification?.[0]
              return (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{u.full_name || '—'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--color-amber)]">{g?.total_xp ?? 0}</td>
                  <td className="px-6 py-4">{g?.level ?? 1}</td>
                  <td className="px-6 py-4">{g?.current_streak ?? 0} / {g?.longest_streak ?? 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setAdjustingUser(adjustingUser === u.id ? null : u.id)
                          setAwardingUser(null)
                          setEditingStreakUser(null)
                        }}
                      >
                        Adjust XP
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingStreakUser(editingStreakUser === u.id ? null : u.id)
                          setAdjustingUser(null)
                          setAwardingUser(null)
                        }}
                      >
                        Streak
                      </Button>
                      <Button
                        size="sm"
                        variant="calm"
                        onClick={() => {
                          setAwardingUser(awardingUser === u.id ? null : u.id)
                          setAdjustingUser(null)
                          setEditingStreakUser(null)
                        }}
                      >
                        Badges
                      </Button>
                    </div>
                    {editingStreakUser === u.id && (
                      <StreakForm
                        user={u}
                        onClose={() => setEditingStreakUser(null)}
                        onSuccess={() => { loadUsers(); setEditingStreakUser(null) }}
                      />
                    )}
                    {adjustingUser === u.id && (
                      <UserXPForm
                        user={u}
                        onClose={() => setAdjustingUser(null)}
                        onSuccess={() => { loadUsers(); setAdjustingUser(null) }}
                      />
                    )}
                    {awardingUser === u.id && (
                      <UserBadgesForm
                        user={u}
                        badges={badges}
                        onClose={() => setAwardingUser(null)}
                        onSuccess={() => { loadUsers(); setAwardingUser(null) }}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {usersPage} of {totalPages} ({usersTotal} users)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={usersPage <= 1}
              onClick={() => setUsersPage((p: number) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={usersPage >= totalPages}
              onClick={() => setUsersPage((p: number) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function UserXPForm({ user, onClose, onSuccess }: { user: any; onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<'adjust' | 'set'>('adjust')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const g = user.user_gamification?.[0]
  const currentXP = g?.total_xp ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseInt(amount, 10)
    if (isNaN(amt)) {
      toast.error('Enter a valid number')
      return
    }
    setLoading(true)
    try {
      if (mode === 'adjust') {
        await adjustUserXP(user.id, amt, reason || 'Admin adjustment')
      } else {
        await setUserXP(user.id, amt, reason || 'Admin set XP')
      }
      toast.success('XP updated')
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update XP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === 'adjust'} onChange={() => setMode('adjust')} />
            <span className="text-sm">Adjust (+/-)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === 'set'} onChange={() => setMode('set')} />
            <span className="text-sm">Set absolute</span>
          </label>
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {mode === 'adjust' ? 'Amount to add (negative to subtract)' : `New total (current: ${currentXP})`}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={mode === 'adjust' ? 'e.g. 50 or -20' : String(currentXP)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-32"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-full"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>Apply</Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

function StreakForm({ user, onClose, onSuccess }: { user: any; onClose: () => void; onSuccess: () => void }) {
  const g = user.user_gamification?.[0]
  const [currentStreak, setCurrentStreak] = useState(String(g?.current_streak ?? 0))
  const [longestStreak, setLongestStreak] = useState(String(g?.longest_streak ?? 0))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cur = parseInt(currentStreak, 10)
    const lon = parseInt(longestStreak, 10)
    if (isNaN(cur) || isNaN(lon) || cur < 0 || lon < 0) {
      toast.error('Enter valid non-negative numbers')
      return
    }
    setLoading(true)
    try {
      await adjustUserStreak(user.id, cur, lon)
      toast.success('Streak updated')
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update streak')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Current streak</label>
            <input
              type="number"
              min={0}
              value={currentStreak}
              onChange={(e) => setCurrentStreak(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-24"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Longest streak</label>
            <input
              type="number"
              min={0}
              value={longestStreak}
              onChange={(e) => setLongestStreak(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-24"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>Apply</Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

function UserBadgesForm({ user, badges, onClose, onSuccess }: { user: any; badges: any[]; onClose: () => void; onSuccess: () => void }) {
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [awarding, setAwarding] = useState(false)

  useEffect(() => {
    getUserBadges(user.id).then(setUserBadges).finally(() => setLoading(false))
  }, [user.id])

  const handleAward = async (badgeId: number) => {
    setAwarding(true)
    try {
      await awardBadge(user.id, badgeId)
      toast.success('Badge awarded')
      const list = await getUserBadges(user.id)
      setUserBadges(list)
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to award badge')
    } finally {
      setAwarding(false)
    }
  }

  const handleRevoke = async (badgeId: number) => {
    if (!confirm('Revoke this badge?')) return
    setAwarding(true)
    try {
      await revokeBadge(user.id, badgeId)
      toast.success('Badge revoked')
      const list = await getUserBadges(user.id)
      setUserBadges(list)
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to revoke badge')
    } finally {
      setAwarding(false)
    }
  }

  const earnedIds = userBadges.map((ub: any) => ub.badge_id ?? ub.badges?.id).filter(Boolean)
  const available = badges.filter((b: any) => !earnedIds.includes(b.id))

  if (loading) return <div className="mt-4 p-4 text-sm text-gray-500">Loading...</div>

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Earned badges</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {userBadges.length === 0 ? (
          <span className="text-sm text-gray-500">None</span>
        ) : (
          userBadges.map((ub: any) => {
            const b = ub.badges || ub
            return (
              <span
                key={ub.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded text-sm"
              >
                {b.icon || '🏅'} {b.name || `Badge ${b.id}`}
                <button
                  type="button"
                  onClick={() => handleRevoke(b.id)}
                  disabled={awarding}
                  className="text-red-600 hover:text-red-700 ml-1"
                >
                  ×
                </button>
              </span>
            )
          })
        )}
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Award badge</p>
      <div className="flex flex-wrap gap-2">
        {available.length === 0 ? (
          <span className="text-sm text-gray-500">All badges earned</span>
        ) : (
          available.map((b: any) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleAward(b.id)}
              disabled={awarding}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {b.icon || '🏅'} {b.name || `Badge ${b.id}`}
            </button>
          ))
        )}
      </div>
      <Button type="button" size="sm" variant="ghost" onClick={onClose} className="mt-3">
        Close
      </Button>
    </div>
  )
}

function LogsTab({
  logs,
  logsTotal,
  logsPage,
  setLogsPage,
  logsFilters,
  setLogsFilters,
  loadLogs,
}: any) {
  const perPage = 20
  const totalPages = Math.ceil(logsTotal / perPage)

  const handleDelete = async (logId: string) => {
    if (!confirm('Delete this XP log entry?')) return
    try {
      await deleteXPLog(logId)
      toast.success('Log deleted')
      loadLogs()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="User ID"
          value={logsFilters.userId}
          onChange={(e) => setLogsFilters((f: any) => ({ ...f, userId: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-48"
        />
        <select
          value={logsFilters.reason}
          onChange={(e) => setLogsFilters((f: any) => ({ ...f, reason: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All reasons</option>
          <option value="manual_adjustment">Manual adjustment</option>
          <option value="page_complete">Page complete</option>
          <option value="chapter_complete">Chapter complete</option>
          <option value="streak_bonus">Streak bonus</option>
        </select>
        <input
          type="date"
          value={logsFilters.dateFrom}
          onChange={(e) => setLogsFilters((f: any) => ({ ...f, dateFrom: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
        <input
          type="date"
          value={logsFilters.dateTo}
          onChange={(e) => setLogsFilters((f: any) => ({ ...f, dateTo: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
        <Button size="sm" onClick={loadLogs}>Filter</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.profiles?.full_name || log.profiles?.email || log.user_id?.slice(0, 8) + '...'}
                    </p>
                    <p className="text-xs text-gray-500">{log.profiles?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{log.reason}</td>
                <td className="px-6 py-4">
                  <span className={log.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {log.amount >= 0 ? '+' : ''}{log.amount}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(log.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {logsPage} of {totalPages} ({logsTotal} logs)
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled={logsPage <= 1} onClick={() => setLogsPage((p: number) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" disabled={logsPage >= totalPages} onClick={() => setLogsPage((p: number) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function BadgesTab({
  badges,
  showBadgeForm,
  setShowBadgeForm,
  editingBadge,
  setEditingBadge,
  loadBadges,
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Badge definitions</h3>
        <Button onClick={() => { setEditingBadge(null); setShowBadgeForm(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          New Badge
        </Button>
      </div>

      {(showBadgeForm || editingBadge) && (
        <BadgeForm
          badge={editingBadge}
          onClose={() => { setShowBadgeForm(false); setEditingBadge(null) }}
          onSuccess={() => { loadBadges(); setShowBadgeForm(false); setEditingBadge(null) }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b: any) => (
          <div
            key={b.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-start justify-between"
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl">
                {b.icon || '🏅'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{b.name || `Badge ${b.id}`}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{b.description || '—'}</p>
                <p className="text-xs text-gray-500 mt-2">Awarded {b.timesAwarded ?? 0} times</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingBadge(b); setShowBadgeForm(true) }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Delete badge "${b.name || b.id}"?`)) return
                  try {
                    await deleteBadge(b.id)
                    toast.success('Badge deleted')
                    loadBadges()
                  } catch (e: any) {
                    toast.error(e?.message || 'Failed to delete')
                  }
                }}
                className="p-2 text-red-500 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BadgeForm({
  badge,
  onClose,
  onSuccess,
}: {
  badge: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState(badge?.name ?? '')
  const [description, setDescription] = useState(badge?.description ?? '')
  const [icon, setIcon] = useState(badge?.icon ?? '🏅')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { name, description, icon }
      if (badge?.id) {
        await updateBadge(badge.id, data)
        toast.success('Badge updated')
      } else {
        await createBadge(data)
        toast.success('Badge created')
      }
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save badge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {badge ? 'Edit Badge' : 'Create Badge'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🏅"
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{badge ? 'Update' : 'Create'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
