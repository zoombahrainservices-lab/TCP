'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import ImageUploadField from './ImageUploadField'
import { X, Save } from 'lucide-react'

interface StepSettingsModalProps {
  isOpen: boolean
  step: {
    id: string
    step_type: string
    title: string
    slug: string
    order_index: number
    is_required: boolean
    hero_image_url?: string | null
  } | null
  chapterSlug?: string
  onClose: () => void
  onSave: (data: {
    title: string
    slug: string
    is_required: boolean
    hero_image_url?: string
  }) => Promise<void>
}

export default function StepSettingsModal({
  isOpen,
  step,
  chapterSlug = 'chapter',
  onClose,
  onSave
}: StepSettingsModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    is_required: true,
    hero_image_url: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (step) {
      setFormData({
        title: step.title,
        slug: step.slug,
        is_required: step.is_required,
        hero_image_url: step.hero_image_url || ''
      })
    }
  }, [step])

  if (!isOpen || !step) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving step:', error)
    } finally {
      setSaving(false)
    }
  }

  const stepTypeNames: Record<string, string> = {
    read: 'Reading',
    self_check: 'Self-Check',
    framework: 'Framework',
    techniques: 'Techniques',
    resolution: 'Resolution',
    follow_through: 'Follow-Through'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Step Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Step Type (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Step Type
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400">
              {stepTypeNames[step.step_type] || step.step_type}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Step type cannot be changed
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
              required
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          {/* Hero Image */}
          <div>
            <ImageUploadField
              label="Hero Image"
              value={formData.hero_image_url}
              onChange={(value) => setFormData({ ...formData, hero_image_url: value as string })}
              helperText="Optional hero image for this step"
              chapterSlug={chapterSlug}
              stepSlug={step?.slug || 'step'}
              pageOrder={0}
            />
          </div>

          {/* Required Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-[var(--color-amber)] focus:ring-[var(--color-amber)]"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Required Step
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Users must complete this step to progress
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
