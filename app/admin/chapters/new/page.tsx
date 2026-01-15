'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createChapter } from '@/app/actions/admin'
import ChapterEditorForm from '@/components/admin/ChapterEditorForm'

export default function NewChapterPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    const result = await createChapter(data)
    
    if (result.success) {
      router.push('/admin/chapters')
    }
    
    return result
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin/chapters" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Chapters
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Chapter</h1>
        <p className="text-gray-600">Add a new day to the 30-day curriculum</p>
      </div>

      <ChapterEditorForm
        onSubmit={handleSubmit}
        submitLabel="Create Chapter"
      />
    </div>
  )
}
