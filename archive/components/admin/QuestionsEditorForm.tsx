'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createAdminClient } from '@/lib/supabase/admin'

interface QuestionsEditorFormProps {
  chapter: any
}

export default function QuestionsEditorForm({ chapter }: QuestionsEditorFormProps) {
  const router = useRouter()
  const [beforeQuestions, setBeforeQuestions] = useState<string[]>(
    (chapter.before_questions as any[] || []).map((q: any) => q.question || q)
  )
  const [afterQuestions, setAfterQuestions] = useState<string[]>(
    (chapter.after_questions as any[] || []).map((q: any) => q.question || q)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addBeforeQuestion = () => {
    setBeforeQuestions([...beforeQuestions, ''])
  }

  const removeBeforeQuestion = (index: number) => {
    setBeforeQuestions(beforeQuestions.filter((_, i) => i !== index))
  }

  const updateBeforeQuestion = (index: number, value: string) => {
    const updated = [...beforeQuestions]
    updated[index] = value
    setBeforeQuestions(updated)
  }

  const addAfterQuestion = () => {
    setAfterQuestions([...afterQuestions, ''])
  }

  const removeAfterQuestion = (index: number) => {
    setAfterQuestions(afterQuestions.filter((_, i) => i !== index))
  }

  const updateAfterQuestion = (index: number, value: string) => {
    const updated = [...afterQuestions]
    updated[index] = value
    setAfterQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const adminClient = createAdminClient()

      const { error: updateError } = await adminClient
        .from('chapters')
        .update({
          before_questions: beforeQuestions.filter(q => q.trim()).map(q => ({ question: q })),
          after_questions: afterQuestions.filter(q => q.trim()).map(q => ({ question: q })),
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapter.id)

      if (updateError) throw updateError

      router.push('/admin/questions')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save questions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Before Questions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Before Self-Check Questions</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addBeforeQuestion}>
            + Add Question
          </Button>
        </div>
        
        <div className="space-y-3">
          {beforeQuestions.length === 0 ? (
            <p className="text-gray-500 text-sm">No questions added yet</p>
          ) : (
            beforeQuestions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => updateBeforeQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeBeforeQuestion(index)}
                  className="flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* After Questions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">After Self-Check Questions</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addAfterQuestion}>
            + Add Question
          </Button>
        </div>
        
        <div className="space-y-3">
          {afterQuestions.length === 0 ? (
            <p className="text-gray-500 text-sm">No questions added yet</p>
          ) : (
            afterQuestions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => updateAfterQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeAfterQuestion(index)}
                  className="flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Questions'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/questions')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
