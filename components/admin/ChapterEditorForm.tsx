'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Question {
  id: string
  question: string
}

interface ChapterEditorFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<{ error?: string; success?: boolean }>
  submitLabel?: string
}

export default function ChapterEditorForm({
  initialData,
  onSubmit,
  submitLabel = 'Save Chapter',
}: ChapterEditorFormProps) {
  const [dayNumber, setDayNumber] = useState(initialData?.day_number || '')
  const [title, setTitle] = useState(initialData?.title || '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [taskDescription, setTaskDescription] = useState(initialData?.task_description || '')
  const [taskDeadlineHours, setTaskDeadlineHours] = useState(initialData?.task_deadline_hours || 24)
  
  const [beforeQuestions, setBeforeQuestions] = useState<Question[]>(
    initialData?.before_questions || [{ id: '1', question: '' }]
  )
  const [afterQuestions, setAfterQuestions] = useState<Question[]>(
    initialData?.after_questions || [{ id: '1', question: '' }]
  )
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddBeforeQuestion = () => {
    setBeforeQuestions([...beforeQuestions, { id: `${Date.now()}`, question: '' }])
  }

  const handleRemoveBeforeQuestion = (id: string) => {
    setBeforeQuestions(beforeQuestions.filter(q => q.id !== id))
  }

  const handleBeforeQuestionChange = (id: string, question: string) => {
    setBeforeQuestions(beforeQuestions.map(q => q.id === id ? { ...q, question } : q))
  }

  const handleAddAfterQuestion = () => {
    setAfterQuestions([...afterQuestions, { id: `${Date.now()}`, question: '' }])
  }

  const handleRemoveAfterQuestion = (id: string) => {
    setAfterQuestions(afterQuestions.filter(q => q.id !== id))
  }

  const handleAfterQuestionChange = (id: string, question: string) => {
    setAfterQuestions(afterQuestions.map(q => q.id === id ? { ...q, question } : q))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!dayNumber || dayNumber < 1 || dayNumber > 30) {
      setError('Day number must be between 1 and 30')
      return
    }
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    
    if (!taskDescription.trim()) {
      setError('Task description is required')
      return
    }
    
    if (beforeQuestions.filter(q => q.question.trim()).length === 0) {
      setError('At least one before question is required')
      return
    }
    
    if (afterQuestions.filter(q => q.question.trim()).length === 0) {
      setError('At least one after question is required')
      return
    }

    setLoading(true)
    
    const result = await onSubmit({
      day_number: parseInt(dayNumber),
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      task_description: taskDescription.trim(),
      task_deadline_hours: parseInt(taskDeadlineHours),
      before_questions: beforeQuestions.filter(q => q.question.trim()),
      after_questions: afterQuestions.filter(q => q.question.trim()),
    })
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success) {
      // Form will be redirected by parent
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input
            label="Day Number (1-30)"
            type="number"
            min="1"
            max="30"
            value={dayNumber}
            onChange={(e) => setDayNumber(e.target.value)}
            required
            disabled={loading}
          />
          
          <Input
            label="Chapter Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
          
          <Input
            label="Subtitle (optional)"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            disabled={loading}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Content</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Content (Markdown supported)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={12}
            required
            disabled={loading}
            placeholder="Use # for headings, ## for subheadings, etc."
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Description</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What task should students complete?
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              disabled={loading}
            />
          </div>
          
          <Input
            label="Task Deadline (hours)"
            type="number"
            min="1"
            max="168"
            value={taskDeadlineHours}
            onChange={(e) => setTaskDeadlineHours(e.target.value)}
            helperText="How many hours students have to complete the task after acknowledging it (default: 24)"
            required
            disabled={loading}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Before Self-Check Questions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Questions students answer before completing the task (1-5 scale)
        </p>
        <div className="space-y-3">
          {beforeQuestions.map((q, index) => (
            <div key={q.id} className="flex gap-2">
              <Input
                type="text"
                value={q.question}
                onChange={(e) => handleBeforeQuestionChange(q.id, e.target.value)}
                placeholder={`Question ${index + 1}`}
                disabled={loading}
              />
              {beforeQuestions.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleRemoveBeforeQuestion(q.id)}
                  disabled={loading}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddBeforeQuestion}
          disabled={loading}
          className="mt-3"
        >
          + Add Question
        </Button>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">After Self-Check Questions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Questions students answer after completing the task (1-5 scale)
        </p>
        <div className="space-y-3">
          {afterQuestions.map((q, index) => (
            <div key={q.id} className="flex gap-2">
              <Input
                type="text"
                value={q.question}
                onChange={(e) => handleAfterQuestionChange(q.id, e.target.value)}
                placeholder={`Question ${index + 1}`}
                disabled={loading}
              />
              {afterQuestions.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleRemoveAfterQuestion(q.id)}
                  disabled={loading}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddAfterQuestion}
          disabled={loading}
          className="mt-3"
        >
          + Add Question
        </Button>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
