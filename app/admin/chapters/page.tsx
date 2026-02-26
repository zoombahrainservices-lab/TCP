'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { deleteChapter } from '@/app/actions/admin'
import toast from 'react-hot-toast'

export default function ChaptersListPage() {
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChapters()
  }, [])

  const loadChapters = async () => {
    setLoading(true)
    try {
      const data = await fetch('/api/admin/chapters').then(res => res.json())
      setChapters(data || [])
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
      loadChapters()
    } catch (error) {
      toast.error('Failed to delete chapter')
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

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 gap-4">
        {chapters.map((chapter) => (
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
        ))}
      </div>
    </div>
  )
}
