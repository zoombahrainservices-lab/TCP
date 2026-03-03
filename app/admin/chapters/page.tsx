'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { deleteChapter } from '@/app/actions/admin'
import toast from 'react-hot-toast'

// Skeleton loader component
function ChapterCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )
}

export default function ChaptersListPage() {
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadChapters()
  }, [])

  const loadChapters = async () => {
    // Don't show loading for cached data
    const cachedData = sessionStorage.getItem('admin-chapters-cache')
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData)
        setChapters(parsed)
        setLoading(false)
      } catch (e) {
        // Invalid cache, ignore
      }
    }

    try {
      const data = await fetch('/api/admin/chapters').then(res => res.json())
      setChapters(data || [])
      // Cache the data
      sessionStorage.setItem('admin-chapters-cache', JSON.stringify(data || []))
    } catch (error) {
      console.error('Error loading chapters:', error)
      toast.error('Failed to load chapters')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (chapterId: string, chapterNumber: number) => {
    if (!confirm(`Delete Chapter ${chapterNumber}? This cannot be undone.`)) return

    try {
      await deleteChapter(chapterId)
      toast.success('Chapter deleted successfully')
      // Clear cache and reload
      sessionStorage.removeItem('admin-chapters-cache')
      loadChapters()
    } catch (error) {
      toast.error('Failed to delete chapter')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chapters
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all platform chapters
          </p>
        </div>
        <Link href="/admin/chapters/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Chapter
          </Button>
        </Link>
      </div>

      {/* Chapters Grid with Skeleton Loading */}
      <div className="grid grid-cols-1 gap-4">
        {loading && chapters.length === 0 ? (
          // Show skeletons only if no cached data
          <>
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
          </>
        ) : chapters.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No chapters yet. Click "New Chapter" to create one.
            </p>
          </div>
        ) : (
          chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--color-amber)]">
                    {chapter.chapter_number}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {chapter.title}
                    </h3>
                    {chapter.is_published ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs font-medium">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                        Draft
                      </span>
                    )}
                    {chapter.framework_code && (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 rounded text-xs font-medium">
                        {chapter.framework_code}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chapter.subtitle || chapter.slug}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/read/${chapter.slug}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/admin/chapters/${chapter.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(chapter.id, chapter.chapter_number)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
