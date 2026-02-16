'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { X } from 'lucide-react'

interface PartEditorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; slug: string; order_index: number }) => Promise<void>
  initialData?: {
    id?: string
    title: string
    slug: string
    order_index: number
  }
}

export default function PartEditor({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: PartEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index || 0)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!initialData) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ title, slug, order_index: orderIndex })
      onClose()
    } catch (error) {
      console.error('Error saving part:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Part' : 'Create New Part'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Foundation"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="foundation"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Index
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Saving...' : initialData ? 'Update Part' : 'Create Part'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
