'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  getUserEngagementStats,
  getChapterAnalytics,
  getProgressMetrics,
} from '@/app/actions/admin'
import Button from '@/components/ui/Button'
import { Download, TrendingUp, Users, BookOpen, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  const [engagement, setEngagement] = useState<any>(null)
  const [chapterStats, setChapterStats] = useState<any[]>([])
  const [progressMetrics, setProgressMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [engagementData, chapterData, progressData] = await Promise.all([
        getUserEngagementStats(),
        getChapterAnalytics(),
        getProgressMetrics(),
      ])
      setEngagement(engagementData)
      setChapterStats(chapterData)
      setProgressMetrics(progressData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
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

  // OPTIMIZED: Memoize sorting operations
  const topChapters = useMemo(() => {
    return [...chapterStats]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 10)
  }, [chapterStats])

  const bottomChapters = useMemo(() => {
    return [...chapterStats]
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 10)
  }, [chapterStats])

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Platform insights and metrics
            </p>
          </div>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* User Engagement */}
      {engagement && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            User Engagement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">DAU</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {engagement.dau}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Daily Active Users
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">WAU</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {engagement.wau}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Weekly Active Users
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">MAU</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {engagement.mau}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Monthly Active Users
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-amber-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {engagement.totalUsers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                All registered users
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Metrics */}
      {progressMetrics && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Progress Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Users with Progress</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {progressMetrics.usersWithProgress}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {((progressMetrics.usersWithProgress / progressMetrics.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Chapters</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {progressMetrics.avgChaptersCompleted}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Per active user
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {((progressMetrics.usersWithProgress / progressMetrics.totalUsers) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Users who started
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Chapters */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Performing Chapters
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Chapter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topChapters.map((chapter: any) => (
                  <tr key={chapter.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Ch {chapter.chapter_number}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {chapter.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${chapter.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                          {chapter.completionRate.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {chapter.totalCompleted} / {chapter.totalAttempts} users
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chapters Needing Attention */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Chapters Needing Attention
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Chapter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bottomChapters.map((chapter: any) => (
                  <tr key={chapter.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Ch {chapter.chapter_number}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {chapter.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${chapter.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                          {chapter.completionRate.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {chapter.totalCompleted} / {chapter.totalAttempts} users
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
