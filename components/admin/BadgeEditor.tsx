'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { X } from 'lucide-react'

interface BadgeEditorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  initialData?: any
}

export default function BadgeEditor({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: BadgeEditorProps) {
  const [formData, setFormData] = useState({
    badge_key: initialData?.badge_key || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    icon: initialData?.icon || '🏆',
    requirement_type: initialData?.requirement_type || 'chapter_complete',
    requirement_value: initialData?.requirement_value || 1,
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error saving badge:', error)
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
            {initialData ? 'Edit Badge' : 'Create New Badge'}
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
              Badge Key
            </label>
            <input
              type="text"
              value={formData.badge_key}
              onChange={(e) => setFormData({ ...formData, badge_key: e.target.value })}
              placeholder="e.g., first_chapter"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={!!initialData}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Unique identifier (cannot be changed after creation)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., First Steps"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Complete your first chapter"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🏆"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl text-center"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirement Type
            </label>
            <select
              value={formData.requirement_type}
              onChange={(e) => setFormData({ ...formData, requirement_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="chapter_complete">Chapters Completed</option>
              <option value="streak">Streak Days</option>
              <option value="xp_total">Total XP</option>
              <option value="level">Level Reached</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirement Value
            </label>
            <input
              type="number"
              value={formData.requirement_value}
              onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Number required to earn this badge
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
              {loading ? 'Saving...' : initialData ? 'Update Badge' : 'Create Badge'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
