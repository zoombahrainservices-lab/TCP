import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import QuestionsEditorForm from '@/components/admin/QuestionsEditorForm'

export default async function EditQuestionsPage({
  params,
}: {
  params: Promise<{ chapterId: string }>
}) {
  const { chapterId } = await params
  const adminClient = createAdminClient()

  const { data: chapter } = await adminClient
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single()

  if (!chapter) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chapter not found</h1>
        <Link href="/admin/questions" className="text-blue-600 hover:underline">
          ← Back to Questions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/questions" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back to Questions
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Questions</h1>
        <p className="text-gray-600">
          Day {chapter.day_number}: {chapter.title}
        </p>
      </div>

      <QuestionsEditorForm chapter={chapter} />
    </div>
  )
}
