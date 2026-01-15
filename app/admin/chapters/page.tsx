import { requireAuth } from '@/lib/auth/guards'
import { getAllChapters } from '@/app/actions/admin'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default async function ChaptersPage() {
  await requireAuth('admin')
  const chapters = await getAllChapters()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Chapters</h1>
          <p className="text-gray-600">{chapters.length} of 30 chapters created</p>
        </div>
        <Link href="/admin/chapters/new">
          <Button>+ Create Chapter</Button>
        </Link>
      </div>

      {chapters.length === 0 ? (
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
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter: any) => (
            <Card key={chapter.id} padding="sm">
              <Link href={`/admin/chapters/${chapter.id}`}>
                <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer">
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant="info">Day {chapter.day_number}</Badge>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                      {chapter.subtitle && (
                        <p className="text-sm text-gray-600">{chapter.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
