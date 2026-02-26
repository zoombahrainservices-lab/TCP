'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
  getAllPagesForChapter,
  toggleStepRequired,
  reorderSteps,
  reorderPages,
  adminEnsureRequiredSteps,
  validateChapterForPublish,
  publishChapter
} from '@/app/actions/admin'
import dynamic from 'next/dynamic'
import Button from '@/components/ui/Button'
import StepCard from '@/components/admin/StepCard'
import StepSettingsModal from '@/components/admin/StepSettingsModal'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { ArrowLeft, Plus, Save, Edit, Trash2, Check } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// OPTIMIZED: Lazy load TemplateSelector modal
const TemplateSelector = dynamic(() => import('@/components/admin/TemplateSelector'), {
  ssr: false
})

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
  const [publishValidation, setPublishValidation] = useState<{ valid: boolean; errors: string[] } | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)

  // Chapter form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    chapter_number: 1,
    part_id: '',
    thumbnail_url: '',
    framework_code: '',
    framework_letters: '',
    framework_letter_images: [] as string[],
    hero_image_url: '',
    pdf_url: '',
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
        setFormData({
          ...chapterData,
          framework_letters: (chapterData.framework_letters || []).join(', '),
          framework_letter_images: chapterData.framework_letter_images || [],
        })
      }
      setParts(partsData || [])
      setSteps(stepsData || [])
      
      // OPTIMIZED: Load all pages for the chapter in one query (fixes N+1 pattern)
      if (stepsData && stepsData.length > 0) {
        try {
          const allPages = await getAllPagesForChapter(chapterId)
          const pagesData: Record<string, any[]> = {}
          
          // Group pages by step_id
          allPages.forEach(page => {
            if (!pagesData[page.step_id]) {
              pagesData[page.step_id] = []
            }
            pagesData[page.step_id].push(page)
          })
          
          // Ensure all steps have an entry (even if empty)
          stepsData.forEach(step => {
            if (!pagesData[step.id]) {
              pagesData[step.id] = []
            }
          })
          
          setPages(pagesData)
        } catch (error) {
          console.error('Error loading pages for chapter:', error)
          setPages({})
        }
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
      // Convert framework_letters string to array
      const dataToSave = {
        ...formData,
        framework_letters: formData.framework_letters
          ? formData.framework_letters.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      }
      await updateChapter(chapterId, dataToSave)
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

  const handleEnsureRequiredSteps = async () => {
    try {
      const result = await adminEnsureRequiredSteps(chapterId)
      if (result.createdCount > 0) {
        toast.success(`Created ${result.createdCount} missing step(s)`)
      } else {
        toast.success('All required steps already exist')
      }
      loadData()
    } catch (error) {
      toast.error('Failed to ensure required steps')
    }
  }

  const handleUpdatePageMeta = async (pageId: string, data: any) => {
    try {
      await updatePage(pageId, data)
      toast.success('Page metadata updated')
      loadData()
    } catch (error) {
      toast.error('Failed to update page metadata')
    }
  }

  const handleValidateForPublish = async () => {
    try {
      const validation = await validateChapterForPublish(chapterId)
      setPublishValidation(validation)
      setShowPublishModal(true)
    } catch (error) {
      toast.error('Failed to validate chapter')
    }
  }

  const handlePublish = async () => {
    try {
      await publishChapter(chapterId, true)
      toast.success('Chapter published successfully')
      setShowPublishModal(false)
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish chapter')
    }
  }

  const handleUnpublish = async () => {
    if (!confirm('Unpublish this chapter? Users will no longer see it.')) return
    try {
      await publishChapter(chapterId, false)
      toast.success('Chapter unpublished')
      loadData()
    } catch (error) {
      toast.error('Failed to unpublish chapter')
    }
  }

  // Validation warnings
  // OPTIMIZED: Memoize expensive validation computation
  const validationWarnings = useMemo(() => {
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
    if (chapter?.is_published && warnings.length > 0) {
      warnings.unshift('⚠️ Chapter is published but has issues')
    }

    return warnings
  }, [steps, pages, chapter])

  // OPTIMIZED: Memoize event handlers to prevent child re-renders
  const handleEditStep = useCallback((step: any) => {
    setEditingStep(step)
    setShowStepSettings(true)
  }, [])

  const handleSaveStepSettings = useCallback(async (data: { title: string; slug: string; is_required: boolean; hero_image_url?: string }) => {
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
  }, [editingStep])

  const handleStepMoveUp = useCallback(async (stepId: string) => {
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
  }, [steps, chapterId])

  const handleStepMoveDown = useCallback(async (stepId: string) => {
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
  }, [steps, chapterId])

  const handlePageMoveUp = useCallback(async (stepId: string, pageId: string) => {
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
  }, [pages])

  const handlePageMoveDown = useCallback(async (stepId: string, pageId: string) => {
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
  }, [pages])

  const handleAddFromTemplate = useCallback((stepId: string) => {
    setCurrentStepForTemplate(stepId)
    setShowTemplateSelector(true)
  }, [])

  const handleApplyTemplate = useCallback(async (templateBlocks: any[]) => {
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
  }, [currentStepForTemplate, pages])

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

            <div className="md:col-span-2">
              <ImageUploadField
                label="Thumbnail Image"
                value={formData.thumbnail_url || ''}
                onChange={(value) => setFormData({ ...formData, thumbnail_url: value as string })}
                helperText="Displayed on dashboard cards and chapter list"
                chapterSlug={chapter?.slug || 'chapter'}
                stepSlug="metadata"
                pageOrder={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Framework Code
              </label>
              <input
                type="text"
                value={formData.framework_code || ''}
                onChange={(e) => setFormData({ ...formData, framework_code: e.target.value })}
                placeholder="e.g., SPARK, VOICE"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Framework Letters
              </label>
              <input
                type="text"
                value={formData.framework_letters || ''}
                onChange={(e) => setFormData({ ...formData, framework_letters: e.target.value })}
                placeholder="e.g., S, P, A, R, K"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Comma-separated list of letters
              </p>
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Hero Image"
                value={formData.hero_image_url || ''}
                onChange={(value) => setFormData({ ...formData, hero_image_url: value as string })}
                helperText="Fallback image for reading pages (optional)"
                chapterSlug={chapter?.slug || 'chapter'}
                stepSlug="metadata"
                pageOrder={1}
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Chapter PDF"
                value={formData.pdf_url || ''}
                onChange={(value) => setFormData({ ...formData, pdf_url: value as string })}
                accept="application/pdf,.pdf"
                helperText="Optional PDF download for this chapter"
                chapterSlug={chapter?.slug || 'chapter'}
                stepSlug="metadata"
                pageOrder={2}
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Framework Letter Images"
                value={formData.framework_letter_images}
                onChange={(value) => setFormData({ ...formData, framework_letter_images: value as string[] })}
                multiple
                helperText="Upload images for each framework letter (e.g., S, P, A, R, K images for SPARK)"
                chapterSlug={chapter?.slug || 'chapter'}
                stepSlug="framework"
                pageOrder={0}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                {chapter?.is_published ? (
                  <>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-medium">
                      Published
                    </span>
                    <Button variant="secondary" size="sm" onClick={handleUnpublish}>
                      Unpublish
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                      Draft
                    </span>
                    <Button variant="primary" size="sm" onClick={handleValidateForPublish}>
                      Validate & Publish
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'steps' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Chapter Steps & Pages
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleEnsureRequiredSteps}>
                <Check className="w-4 h-4 mr-2" />
                Ensure Required Steps
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateStep}>
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>

          {steps.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No steps yet. Click "Add Step" to create one.
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
                  onUpdatePage={handleUpdatePageMeta}
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
                  onUpdatePage={handleUpdatePageMeta}
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
        chapterSlug={chapter?.slug || 'chapter'}
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

      {/* Publish Validation Modal */}
      {showPublishModal && publishValidation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {publishValidation.valid ? 'Ready to Publish' : 'Cannot Publish - Validation Errors'}
              </h2>

              {publishValidation.valid ? (
                <div className="mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-100">
                      All validation checks passed. This chapter is ready to be published.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      Validation Errors ({publishValidation.errors.length})
                    </h3>
                    <ul className="space-y-1">
                      {publishValidation.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-800 dark:text-red-200">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowPublishModal(false)}
                >
                  Close
                </Button>
                {publishValidation.valid && (
                  <Button
                    variant="primary"
                    onClick={handlePublish}
                  >
                    Publish Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
