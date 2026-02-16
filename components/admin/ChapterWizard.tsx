'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react'

interface ChapterWizardProps {
  isOpen: boolean
  parts: Array<{ id: string; title: string }>
  onClose: () => void
  onCreate: (data: {
    basicInfo: {
      title: string
      subtitle: string
      slug: string
      part_id: string
      chapter_number: number
    }
    selectedSteps: string[]
    useTemplates: boolean
  }) => Promise<void>
}

const STEP_TYPES = [
  { id: 'read', name: 'Reading', description: 'Main content and stories', icon: '📖', required: true },
  { id: 'self_check', name: 'Self-Check', description: 'Assessment questions', icon: '✅', required: false },
  { id: 'framework', name: 'Framework', description: 'Core concepts and structure', icon: '⚡', required: false },
  { id: 'techniques', name: 'Techniques', description: 'Practical methods', icon: '💡', required: false },
  { id: 'resolution', name: 'Resolution', description: 'Identity and proof', icon: '🎯', required: false },
  { id: 'follow_through', name: 'Follow-Through', description: 'Action plans', icon: '📅', required: false },
]

export default function ChapterWizard({ isOpen, parts, onClose, onCreate }: ChapterWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [creating, setCreating] = useState(false)

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    subtitle: '',
    slug: '',
    part_id: '',
    chapter_number: 1,
  })

  // Step 2: Select Steps
  const [selectedSteps, setSelectedSteps] = useState<string[]>(['read'])

  // Step 3: Templates
  const [useTemplates, setUseTemplates] = useState(true)

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      await onCreate({
        basicInfo,
        selectedSteps,
        useTemplates,
      })
      // Reset form
      setCurrentStep(1)
      setBasicInfo({ title: '', subtitle: '', slug: '', part_id: '', chapter_number: 1 })
      setSelectedSteps(['read'])
      setUseTemplates(true)
      onClose()
    } catch (error) {
      console.error('Error creating chapter:', error)
    } finally {
      setCreating(false)
    }
  }

  const toggleStep = (stepId: string) => {
    if (stepId === 'read') return // Reading is always required
    
    if (selectedSteps.includes(stepId)) {
      setSelectedSteps(selectedSteps.filter(id => id !== stepId))
    } else {
      setSelectedSteps([...selectedSteps, stepId])
    }
  }

  const isStep1Valid = basicInfo.title && basicInfo.slug && basicInfo.part_id
  const isStep2Valid = selectedSteps.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create New Chapter
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step {currentStep} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step <= currentStep
                    ? 'bg-[var(--color-amber)]'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={basicInfo.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setBasicInfo({
                      ...basicInfo,
                      title,
                      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                  placeholder="The Stage Star with Silent Struggles"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={basicInfo.subtitle}
                  onChange={(e) => setBasicInfo({ ...basicInfo, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                  placeholder="Reclaiming your attention in the age of infinite scroll"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={basicInfo.slug}
                  onChange={(e) => setBasicInfo({ ...basicInfo, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                  placeholder="stage-star-silent-struggles"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  URL-friendly identifier (auto-generated from title)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Part *
                </label>
                <select
                  value={basicInfo.part_id}
                  onChange={(e) => setBasicInfo({ ...basicInfo, part_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                  required
                >
                  <option value="">Select a part...</option>
                  {parts.map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chapter Number *
                </label>
                <input
                  type="number"
                  value={basicInfo.chapter_number}
                  onChange={(e) => setBasicInfo({ ...basicInfo, chapter_number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                  min="1"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Select Steps */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Choose Chapter Steps
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select which sections this chapter will include. You can always add or remove steps later.
              </p>

              <div className="space-y-3">
                {STEP_TYPES.map((stepType) => (
                  <div
                    key={stepType.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSteps.includes(stepType.id)
                        ? 'border-[var(--color-amber)] bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${stepType.required ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={() => !stepType.required && toggleStep(stepType.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{stepType.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {stepType.name}
                          </h4>
                          {stepType.required && (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 rounded text-xs font-medium">
                              Required
                            </span>
                          )}
                          {selectedSteps.includes(stepType.id) && (
                            <Check className="w-5 h-5 text-[var(--color-amber)] ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {stepType.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Templates */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Review & Create
              </h3>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chapter Title
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {basicInfo.title}
                  </p>
                </div>
                {basicInfo.subtitle && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subtitle
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {basicInfo.subtitle}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Steps Included
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSteps.map((stepId) => {
                      const stepType = STEP_TYPES.find(s => s.id === stepId)
                      return (
                        <span
                          key={stepId}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                        >
                          {stepType?.icon} {stepType?.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTemplates}
                    onChange={(e) => setUseTemplates(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-[var(--color-amber)] focus:ring-[var(--color-amber)]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Add starter pages from templates
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Automatically create initial pages for each step using templates. You can customize them later.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={creating}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={creating}
            className="ml-auto"
          >
            Cancel
          </Button>
          {currentStep < 3 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Chapter'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
