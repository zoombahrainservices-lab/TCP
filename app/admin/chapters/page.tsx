import { requireAuth } from '@/lib/auth/guards'
import { getAllChapters } from '@/app/actions/admin'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import ChaptersList from '@/components/admin/ChaptersList'

export default async function ChaptersPage() {
  await requireAuth('admin')
  const chapters = await getAllChapters()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Chapters</h1>
          <p className="text-gray-600">{chapters.length} of 30 chapters created</p>
        </div>
        <Link href="/admin/chapters/new">
          <Button>+ Create Chapter</Button>
        </Link>
      </div>

      <ChaptersList chapters={chapters} />
    </div>
  )
}
