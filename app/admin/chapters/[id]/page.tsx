'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getChapter, 
  getAllParts, 
  getAllStepsForChapter, 
  updateChapter, 
  createStep, 
  updateStep, 
  deleteStep, 
  createPage, 
  updatePage, 
  deletePage, 
  getAllPagesForStep,
  toggleStepRequired,
  reorderSteps,
  reorderPages
} from '@/app/actions/admin'
import Button from '@/components/ui/Button'
import StepCard from '@/components/admin/StepCard'
import StepSettingsModal from '@/components/admin/StepSettingsModal'
import TemplateSelector from '@/components/admin/TemplateSelector'
import { ArrowLeft, Plus, Save, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ChapterEditorPage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = params.id as string

  const [chapter, setChapter] = useState<any>(null)
  const [parts, setParts] = useState<any[]>([])
  const [steps, setSteps] = useState<any[]>([])
  const [pages, setPages] = useState<Record<string, any[]>>({})
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'steps' | 'content'>('settings')
  const [editingStep, setEditingStep] = useState<any>(null)
  const [showStepSettings, setShowStepSettings] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [currentStepForTemplate, setCurrentStepForTemplate] = useState<string | null>(null)

  // Chapter form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    chapter_number: 1,
    part_id: '',
    thumbnail_url: '',
    level_min: 1,
    order_index: 0,
    is_published: false,
  })

  useEffect(() => {
    loadData()
  }, [chapterId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Use server actions instead of direct client calls
      const [chapterData, partsData, stepsData] = await Promise.all([
        getChapter(chapterId),
        getAllParts(),
        getAllStepsForChapter(chapterId),
      ])

      if (chapterData) {
        setChapter(chapterData)
        setFormData(chapterData)
      }
      setParts(partsData || [])
      setSteps(stepsData || [])
      
      // Load pages for each step
      if (stepsData) {
        const pagesData: Record<string, any[]> = {}
        for (const step of stepsData) {
          try {
            const stepPages = await getAllPagesForStep(step.id)
            pagesData[step.id] = stepPages
          } catch (error) {
            console.error(`Error loading pages for step ${step.id}:`, error)
            pagesData[step.id] = []
          }
        }
        setPages(pagesData)
      }
    } catch (error) {
      console.error('Error loading chapter:', error)
      toast.error('Failed to load chapter')
    } finally {
      setLoading(false)
    }
  }
  
  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }
  
  const handleCreatePage = async (stepId: string) => {
    const title = prompt('Enter page title:')
    if (!title) return
    
    try {
      await createPage(stepId, {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: (pages[stepId] || []).length,
        estimated_minutes: 5,
        xp_award: 10,
        content: [],
      })
      toast.success('Page created successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to create page')
    }
  }
  
  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return
    
    try {
      await deletePage(pageId)
      toast.success('Page deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete page')
    }
  }

  const handleSaveChapter = async () => {
    setSaving(true)
    try {
      await updateChapter(chapterId, formData)
      toast.success('Chapter saved successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to save chapter')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateStep = async () => {
    const stepType = prompt('Enter step type (read, self_check, framework, techniques, resolution, follow_through):')
    if (!stepType) return

    const title = prompt('Enter step title:')
    if (!title) return

    try {
      await createStep(chapterId, {
        step_type: stepType,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: steps.length,
        is_required: true,
      })
      toast.success('Step created successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to create step')
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return

    try {
      await deleteStep(stepId)
      toast.success('Step deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete step')
    }
  }

  const handleEditStep = (step: any) => {
    setEditingStep(step)
    setShowStepSettings(true)
  }

  const handleSaveStepSettings = async (data: { title: string; slug: string; is_required: boolean }) => {
    if (!editingStep) return

    try {
      await updateStep(editingStep.id, data)
      if (data.is_required !== editingStep.is_required) {
        await toggleStepRequired(editingStep.id, data.is_required)
      }
      toast.success('Step updated successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to update step')
    }
  }

  const handleStepMoveUp = async (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    if (stepIndex <= 0) return

    const newOrder = [...steps]
    const temp = newOrder[stepIndex]
    newOrder[stepIndex] = newOrder[stepIndex - 1]
    newOrder[stepIndex - 1] = temp

    const orderUpdates = newOrder.map((step, index) => ({
      id: step.id,
      order_index: index
    }))

    try {
      await reorderSteps(chapterId, orderUpdates)
      toast.success('Step reordered')
      loadData()
    } catch (error) {
      toast.error('Failed to reorder step')
    }
  }

  const handleStepMoveDown = async (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    if (stepIndex >= steps.length - 1) return

    const newOrder = [...steps]
    const temp = newOrder[stepIndex]
    newOrder[stepIndex] = newOrder[stepIndex + 1]
    newOrder[stepIndex + 1] = temp

    const orderUpdates = newOrder.map((step, index) => ({
      id: step.id,
      order_index: index
    }))

    try {
      await reorderSteps(chapterId, orderUpdates)
      toast.success('Step reordered')
      loadData()
    } catch (error) {
      toast.error('Failed to reorder step')
    }
  }

  const handlePageMoveUp = async (stepId: string, pageId: string) => {
    const stepPages = pages[stepId] || []
    const pageIndex = stepPages.findIndex(p => p.id === pageId)
    if (pageIndex <= 0) return

    const newOrder = [...stepPages]
    const temp = newOrder[pageIndex]
    newOrder[pageIndex] = newOrder[pageIndex - 1]
    newOrder[pageIndex - 1] = temp

    const orderUpdates = newOrder.map((page, index) => ({
      id: page.id,
      order_index: index
    }))

    try {
      await reorderPages(stepId, orderUpdates)
      toast.success('Page reordered')
      loadData()
    } catch (error) {
      toast.error('Failed to reorder page')
    }
  }

  const handlePageMoveDown = async (stepId: string, pageId: string) => {
    const stepPages = pages[stepId] || []
    const pageIndex = stepPages.findIndex(p => p.id === pageId)
    if (pageIndex >= stepPages.length - 1) return

    const newOrder = [...stepPages]
    const temp = newOrder[pageIndex]
    newOrder[pageIndex] = newOrder[pageIndex + 1]
    newOrder[pageIndex + 1] = temp

    const orderUpdates = newOrder.map((page, index) => ({
      id: page.id,
      order_index: index
    }))

    try {
      await reorderPages(stepId, orderUpdates)
      toast.success('Page reordered')
      loadData()
    } catch (error) {
      toast.error('Failed to reorder page')
    }
  }

  const handleAddFromTemplate = (stepId: string) => {
    setCurrentStepForTemplate(stepId)
    setShowTemplateSelector(true)
  }

  const handleApplyTemplate = async (templateBlocks: any[]) => {
    if (!currentStepForTemplate) return

    const title = prompt('Enter page title:')
    if (!title) return

    try {
      await createPage(currentStepForTemplate, {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: (pages[currentStepForTemplate] || []).length,
        estimated_minutes: 5,
        xp_award: 10,
        content: templateBlocks,
      })
      toast.success('Page created from template')
      loadData()
    } catch (error) {
      toast.error('Failed to create page')
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)]"></div>
        </div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Chapter not found</p>
        </div>
      </div>
    )
  }

  // Validation warnings
  const getValidationWarnings = () => {
    const warnings: string[] = []
    
    // Check for required steps without pages
    const requiredStepsWithoutPages = steps.filter(
      step => step.is_required && (pages[step.id] || []).length === 0
    )
    if (requiredStepsWithoutPages.length > 0) {
      warnings.push(`${requiredStepsWithoutPages.length} required step(s) have no pages`)
    }

    // Check for steps with empty pages
    const stepsWithEmptyPages = steps.filter(step => {
      const stepPages = pages[step.id] || []
      return stepPages.some(page => !page.content || page.content.length === 0)
    })
    if (stepsWithEmptyPages.length > 0) {
      warnings.push(`${stepsWithEmptyPages.length} step(s) have pages with no content blocks`)
    }

    // Check for pages with low XP
    const lowXpPages = Object.values(pages).flat().filter(page => !page.xp_award || page.xp_award < 5)
    if (lowXpPages.length > 0) {
      warnings.push(`${lowXpPages.length} page(s) have low or no XP awards`)
    }

    // Check if chapter is published but has warnings
    if (chapter.is_published && warnings.length > 0) {
      warnings.unshift('⚠️ Chapter is published but has issues')
    }

    return warnings
  }

  const validationWarnings = getValidationWarnings()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/chapters"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chapters
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Chapter {chapter.chapter_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {chapter.title}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleSaveChapter}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Content Warnings
          </h3>
          <ul className="space-y-1">
            {validationWarnings.map((warning, index) => (
              <li key={index} className="text-sm text-amber-800 dark:text-amber-200">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-8">
          {['settings', 'steps', 'content'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize
                ${activeTab === tab
                  ? 'border-[var(--color-amber)] text-[var(--color-amber)]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Chapter Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chapter Number
              </label>
              <input
                type="number"
                value={formData.chapter_number}
                onChange={(e) => setFormData({ ...formData, chapter_number: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Part
              </label>
              <select
                value={formData.part_id}
                onChange={(e) => setFormData({ ...formData, part_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a part</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Level
              </label>
              <input
                type="number"
                value={formData.level_min}
                onChange={(e) => setFormData({ ...formData, level_min: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Index
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail URL
              </label>
              <input
                type="text"
                value={formData.thumbnail_url || ''}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Published
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'steps' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Chapter Steps
            </h2>
            <Button variant="primary" size="sm" onClick={handleCreateStep}>
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>

          {steps.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No steps yet. Click "Add Step" to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium">
                          {step.step_type}
                        </span>
                        {step.is_required && (
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 rounded text-xs font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {step.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/chapters/${chapterId}/steps/${step.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStep(step.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Content Management
          </h2>

          {steps.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No steps yet. Go to the Steps tab to create steps first.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  pages={pages[step.id] || []}
                  chapterId={chapterId}
                  isExpanded={expandedSteps.has(step.id)}
                  canMoveUp={index > 0}
                  canMoveDown={index < steps.length - 1}
                  onToggle={() => toggleStep(step.id)}
                  onAddPage={() => handleCreatePage(step.id)}
                  onAddFromTemplate={() => handleAddFromTemplate(step.id)}
                  onEditStep={() => handleEditStep(step)}
                  onDeleteStep={() => handleDeleteStep(step.id)}
                  onDeletePage={handleDeletePage}
                  onMoveUp={() => handleStepMoveUp(step.id)}
                  onMoveDown={() => handleStepMoveDown(step.id)}
                  onPageMoveUp={(pageId) => handlePageMoveUp(step.id, pageId)}
                  onPageMoveDown={(pageId) => handlePageMoveDown(step.id, pageId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step Settings Modal */}
      <StepSettingsModal
        isOpen={showStepSettings}
        step={editingStep}
        onClose={() => {
          setShowStepSettings(false)
          setEditingStep(null)
        }}
        onSave={handleSaveStepSettings}
      />

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => {
          setShowTemplateSelector(false)
          setCurrentStepForTemplate(null)
        }}
        onSelectTemplate={handleApplyTemplate}
      />
    </div>
  )
}
