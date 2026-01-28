'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { deleteChapter } from '@/app/actions/admin'

interface ChaptersListProps {
  chapters: any[]
}

export default function ChaptersList({ chapters }: ChaptersListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (chapterId: number | string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(String(chapterId))
    try {
      await deleteChapter(typeof chapterId === 'number' ? chapterId : parseInt(chapterId, 10))
      router.refresh()
    } catch (error) {
      alert('Failed to delete chapter')
    } finally {
      setDeleting(null)
    }
  }

  if (chapters.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No chapters yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first chapter to get started
          </p>
          <Link href="/admin/chapters/new">
            <Button>Create First Chapter</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter: any) => (
        <Card key={chapter.id} padding="sm">
          <div className="flex items-center justify-between p-2">
            <Link href={`/admin/chapters/${chapter.id}`} className="flex items-center gap-4 flex-1 hover:bg-gray-50 p-2 rounded">
              <Badge variant="info">Day {chapter.day_number}</Badge>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                {chapter.subtitle && (
                  <p className="text-sm text-gray-600">{chapter.subtitle}</p>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-2 ml-4">
              <Link href={`/admin/chapters/${chapter.id}`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(chapter.id, chapter.title)}
                disabled={deleting === chapter.id}
                className="text-red-600 hover:bg-red-50"
              >
                {deleting === chapter.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
