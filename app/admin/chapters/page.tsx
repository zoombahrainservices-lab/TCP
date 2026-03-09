'use client'

import { useRef, useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'
import { deleteChapter, getChapterFull, createChapterWithSteps } from '@/app/actions/admin'
import ChapterWizard from '@/components/admin/ChapterWizard'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [wizardOpen, setWizardOpen] = useState(false)
  
  // Pagination state (currently showing all, ready for pagination)
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ['admin-chapters'],
    queryFn: async () => {
      const res = await fetch('/api/admin/chapters')
      if (!res.ok) throw new Error('Failed to load chapters')
      return res.json()
    },
    staleTime: 30000, // Fresh for 30s
  })

  // Fetch parts for the wizard
  const { data: parts = [] } = useQuery({
    queryKey: ['admin-parts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/parts')
      if (!res.ok) return []
      return res.json()
    },
    staleTime: 60000,
  })

  // Debounced prefetch: only after 400ms hover so we don't flood on mouse move
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefetchedIdsRef = useRef<Set<string>>(new Set())

  const handlePrefetchChapter = useCallback((chapterId: string) => {
    if (prefetchedIdsRef.current.has(chapterId)) return
    if (prefetchTimeoutRef.current) clearTimeout(prefetchTimeoutRef.current)
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchTimeoutRef.current = null
      prefetchedIdsRef.current.add(chapterId)
      queryClient.prefetchQuery({
        queryKey: ['admin-chapter', chapterId],
        queryFn: () => getChapterFull(chapterId),
        staleTime: 60000,
      })
    }, 400)
  }, [queryClient])

  const handlePrefetchCancel = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
      prefetchTimeoutRef.current = null
    }
  }, [])

  const handleDelete = async (chapterId: string, chapterNumber: number) => {
    if (!confirm(`Delete Chapter ${chapterNumber}? This cannot be undone.`)) return

    try {
      await deleteChapter(chapterId)
      toast.success('Chapter deleted successfully')
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-chapters'] })
    } catch (error) {
      toast.error('Failed to delete chapter')
    }
  }

  const handleCreateChapter = async (data: any) => {
    try {
      const result = await createChapterWithSteps(data)
      toast.success('Chapter created successfully!')
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-chapters'] })
      // Navigate to the new chapter
      router.push(`/admin/chapters/${result.chapter.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create chapter')
      throw error
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
        <Button variant="primary" onClick={() => setWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Chapter
        </Button>
      </div>

      {/* Chapters Grid with Skeleton Loading */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading && chapters.length === 0 ? (
          // Show skeletons only if no cached data
          <>
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
          </>
        ) : chapters.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No chapters yet. Click "New Chapter" to create one.
            </p>
            <Button variant="primary" onClick={() => setWizardOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Chapter
            </Button>
          </div>
        ) : (
          chapters.map((chapter: any) => (
            <div
              key={chapter.id}
              onMouseEnter={() => handlePrefetchChapter(chapter.id)}
              onMouseLeave={handlePrefetchCancel}
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
                <Link href={`/admin/chapters/${chapter.id}${currentPage > 1 ? `?returnPage=${currentPage}` : ''}`}>
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

      {/* Chapter Creation Wizard */}
      <ChapterWizard
        isOpen={wizardOpen}
        parts={parts}
        onClose={() => setWizardOpen(false)}
        onCreate={handleCreateChapter}
      />
    </div>
  )
}
