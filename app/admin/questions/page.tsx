import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default async function AdminQuestionsPage() {
  const adminClient = createAdminClient()
  
  const { data: chapters } = await adminClient
    .from('chapters')
    .select('id, day_number, title, before_questions, after_questions')
    .order('day_number', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Questions</h1>
        <p className="text-gray-600">Edit self-check questions for each chapter</p>
      </div>

      <div className="space-y-6">
        {chapters && chapters.length > 0 ? (
          chapters.map((chapter) => {
            const beforeQuestions = chapter.before_questions as any[] || []
            const afterQuestions = chapter.after_questions as any[] || []
            
            return (
              <Card key={chapter.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Day {chapter.day_number}: {chapter.title}
                    </h3>
                  </div>
                  <Link href={`/admin/questions/${chapter.id}`}>
                    <Button variant="secondary" size="sm">Edit Questions</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before Questions */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      Before Self-Check Questions
                      <Badge variant="default" size="sm">{beforeQuestions.length}</Badge>
                    </h4>
                    {beforeQuestions.length === 0 ? (
                      <p className="text-sm text-gray-500">No questions added</p>
                    ) : (
                      <ol className="space-y-2 list-decimal list-inside">
                        {beforeQuestions.map((q: any, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700">
                            {q.question || q}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  {/* After Questions */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      After Self-Check Questions
                      <Badge variant="default" size="sm">{afterQuestions.length}</Badge>
                    </h4>
                    {afterQuestions.length === 0 ? (
                      <p className="text-sm text-gray-500">No questions added</p>
                    ) : (
                      <ol className="space-y-2 list-decimal list-inside">
                        {afterQuestions.map((q: any, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700">
                            {q.question || q}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No chapters found. Create chapters first in{' '}
              <Link href="/admin/chapters" className="text-blue-600 hover:underline">
                Manage Chapters
              </Link>
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
