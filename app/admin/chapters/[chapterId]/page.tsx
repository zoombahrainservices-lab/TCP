'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getChapter, updateChapter, deleteChapter } from '@/app/actions/admin'
import ChapterEditorForm from '@/components/admin/ChapterEditorForm'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EditChapterPage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = parseInt(params.chapterId as string)

  const [chapter, setChapter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadChapter() {
      try {
        const data = await getChapter(chapterId)
        setChapter(data)
      } catch (error) {
        console.error('Failed to load chapter:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChapter()
  }, [chapterId])

  const handleSubmit = async (data: any) => {
    const result = await updateChapter(chapterId, data)
    
    if (result.success) {
      router.push('/admin/chapters')
    }
    
    return result
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    const result = await deleteChapter(chapterId)
    
    if (result.success) {
      router.push('/admin/chapters')
    } else {
      alert(result.error || 'Failed to delete chapter')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 text-lg mb-4">Chapter not found</p>
        <Button onClick={() => router.push('/admin/chapters')}>Back to Chapters</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin/chapters" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Chapters
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Chapter</h1>
            <p className="text-gray-600">Day {chapter.day_number}: {chapter.title}</p>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Chapter'}
          </Button>
        </div>
      </div>

      <ChapterEditorForm
        initialData={chapter}
        onSubmit={handleSubmit}
        submitLabel="Update Chapter"
      />
    </div>
  )
}
