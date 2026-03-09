'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  getChapterFull,
  updateChapter, 
  createStep, 
  updateStep, 
  deleteStep, 
  createPage, 
  updatePage, 
  deletePage, 
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
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'
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
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const chapterId = params.id as string
  
  // Pagination state for returning to chapters list
  const returnPage = searchParams.get('returnPage')

  // OPTIMIZED: Single server action = 1 POST instead of 6
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-chapter', chapterId],
    queryFn: () => getChapterFull(chapterId),
    staleTime: 60000, // Fresh for 60s
    enabled: !!chapterId,
  })

  // Derive state from query data
  const chapter = data?.chapter
  const parts = data?.parts ?? []
  const steps = data?.steps ?? []
  const pages = data?.pages ?? {}

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  
  // OPTIMIZED: Get initial tab from URL or default to 'steps' (most common use case)
  const initialTab = (searchParams.get('tab') as 'settings' | 'steps' | 'content') || 'steps'
  const [activeTab, setActiveTab] = useState<'settings' | 'steps' | 'content'>(initialTab)
  
  // When returning from page editor: expand the step and switch to Steps tab so user is on the Nth page
  useEffect(() => {
    const expandStepId = searchParams.get('expand')
    const pageIdToScroll = searchParams.get('page')
    if (expandStepId && steps.some(s => s.id === expandStepId)) {
      setExpandedSteps(prev => new Set(prev).add(expandStepId))
      setActiveTab('steps') // ensure we're on Steps tab when we have expand
    }
    // Scroll the edited page row into view after step is expanded and DOM updated
    // Use instant scroll (auto) so smooth scroll doesn't steal the first click
    if (pageIdToScroll && expandStepId && steps.some(s => s.id === expandStepId)) {
      const timer = setTimeout(() => {
        const el = document.querySelector(`[data-page-id="${pageIdToScroll}"]`)
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'nearest' })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [searchParams, steps])
  
  const [editingStep, setEditingStep] = useState<any>(null)
  const [showStepSettings, setShowStepSettings] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [currentStepForTemplate, setCurrentStepForTemplate] = useState<string | null>(null)
  const [publishValidation, setPublishValidation] = useState<{
    valid: boolean
    errors: string[]
    dummyEligible?: boolean
    dummyIssues?: string[]
  } | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  
  // OPTIMIZED: Track pending operations for loading indicators
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set())

  // OPTIMIZED: Update URL when tab changes (for back button support)
  const handleTabChange = useCallback((newTab: 'settings' | 'steps' | 'content') => {
    setActiveTab(newTab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', newTab)
    window.history.replaceState({}, '', url.toString())
  }, [])

  // Helper functions for tracking operations
  const addPendingOperation = useCallback((id: string) => {
    setPendingOperations(prev => new Set(prev).add(id))
  }, [])

  const removePendingOperation = useCallback((id: string) => {
    setPendingOperations(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

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

  // Initialize formData when chapter data loads
  useEffect(() => {
    if (chapter) {
      setFormData({
        ...chapter,
        framework_letters: (chapter.framework_letters || []).join(', '),
        framework_letter_images: chapter.framework_letter_images || [],
      })
    }
  }, [chapter])

  // OPTIMIZED: Selective refresh = invalidate so useQuery refetches
  const refreshPages = useCallback(async (_stepId: string) => {
    queryClient.invalidateQueries({ queryKey: ['admin-chapter', chapterId] })
  }, [queryClient, chapterId])

  const refreshSteps = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['admin-chapter', chapterId] })
  }, [queryClient, chapterId])

  const refreshChapter = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['admin-chapter', chapterId] })
  }, [queryClient, chapterId])

  // OPTIMIZED: Memoized toggleStep callback
  const toggleStep = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(stepId)) {
        newExpanded.delete(stepId)
      } else {
        newExpanded.add(stepId)
      }
      return newExpanded
    })
  }, [])
  
  // OPTIMIZED: Optimistic page creation with instant UI update
  const handleCreatePage = useCallback(async (stepId: string) => {
    const title = prompt('Enter page title:')
    if (!title) return
    
    const tempId = `temp-${Date.now()}`
    
    // OPTIMISTIC UPDATE via query mutation
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      const newPage = {
        id: tempId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: (old.pages[stepId] || []).length,
        estimated_minutes: 5,
        xp_award: 10,
        content: [],
        step_id: stepId,
        chunk_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isPending: true,
      }
      return {
        ...old,
        pages: {
          ...old.pages,
          [stepId]: [...(old.pages[stepId] || []), newPage]
        }
      }
    })
    
    // Track pending operation
    addPendingOperation(tempId)
    
    try {
      // Background server call
      const result = await createPage(stepId, {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: (pages[stepId] || []).length,
        estimated_minutes: 5,
        xp_award: 10,
        content: [],
      })
      
      // Replace temp with real data
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: {
            ...old.pages,
            [stepId]: old.pages[stepId].map((p: any) => 
              p.id === tempId ? result.page : p
            )
          }
        }
      })
      
      toast.success('Page created successfully')
    } catch (error) {
      // ROLLBACK: Remove temp page on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: {
            ...old.pages,
            [stepId]: old.pages[stepId].filter((p: any) => p.id !== tempId)
          }
        }
      })
      toast.error('Failed to create page')
      console.error('Error creating page:', error)
    } finally {
      removePendingOperation(tempId)
    }
  }, [pages, chapterId, queryClient, addPendingOperation, removePendingOperation])
  
  // OPTIMIZED: Optimistic page deletion with instant UI update
  const handleDeletePage = useCallback(async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return
    
    // Find the step containing this page
    let targetStepId: string | null = null
    let removedPage: any = null
    
    for (const [stepId, stepPages] of Object.entries(pages)) {
      const page = stepPages.find(p => p.id === pageId)
      if (page) {
        targetStepId = stepId
        removedPage = page
        break
      }
    }
    
    if (!targetStepId || !removedPage) return
    
    // OPTIMISTIC UPDATE: Instantly remove from UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      return {
        ...old,
        pages: {
          ...old.pages,
          [targetStepId!]: old.pages[targetStepId!].filter((p: any) => p.id !== pageId)
        }
      }
    })
    
    try {
      // Background server call
      await deletePage(pageId)
      toast.success('Page deleted successfully')
    } catch (error) {
      // ROLLBACK: Restore page on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: {
            ...old.pages,
            [targetStepId!]: [...old.pages[targetStepId!], removedPage].sort((a: any, b: any) => a.order_index - b.order_index)
          }
        }
      })
      toast.error('Failed to delete page')
      console.error('Error deleting page:', error)
    }
  }, [pages, chapterId, queryClient])

  const handleSaveChapter = useCallback(async () => {
    setSaving(true)
    try {
      const idToUse = chapter?.id ?? chapterId
      if (!idToUse) {
        toast.error('Chapter not loaded. Please refresh and try again.')
        return
      }
      // Convert framework_letters string to array
      const dataToSave = {
        ...formData,
        framework_letters: formData.framework_letters
          ? formData.framework_letters.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      }
      await updateChapter(idToUse, dataToSave)
      toast.success('Chapter saved successfully')
      refreshChapter()
    } catch (error: any) {
      console.error('Error saving chapter:', error)
      const message = (error?.message && String(error.message)) || 'Failed to save chapter'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }, [formData, chapterId, chapter?.id, refreshChapter])

  // OPTIMIZED: Optimistic step creation
  const handleCreateStep = useCallback(async () => {
    const stepType = prompt('Enter step type (read, self_check, framework, techniques, resolution, follow_through):')
    if (!stepType) return

    const title = prompt('Enter step title:')
    if (!title) return

    const tempId = `temp-${Date.now()}`
    
    // OPTIMISTIC UPDATE: Instantly add to UI via query
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      const newStep = {
        id: tempId,
        step_type: stepType,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: old.steps.length,
        is_required: true,
        chapter_id: chapterId,
        unlock_rule: null,
        hero_image_url: null,
        created_at: new Date().toISOString(),
      }
      return {
        ...old,
        steps: [...old.steps, newStep],
        pages: { ...old.pages, [tempId]: [] }
      }
    })

    try {
      const result = await createStep(chapterId, {
        step_type: stepType,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: steps.length,
        is_required: true,
      })
      
      // Replace temp with real data
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        const newPages = { ...old.pages }
        if (result.step.id !== tempId) {
          newPages[result.step.id] = old.pages[tempId] || []
          delete newPages[tempId]
        }
        return {
          ...old,
          steps: old.steps.map((s: any) => s.id === tempId ? result.step : s),
          pages: newPages
        }
      })
      
      toast.success('Step created successfully')
    } catch (error) {
      // ROLLBACK: Remove temp step on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        const newPages = { ...old.pages }
        delete newPages[tempId]
        return {
          ...old,
          steps: old.steps.filter((s: any) => s.id !== tempId),
          pages: newPages
        }
      })
      toast.error('Failed to create step')
      console.error('Error creating step:', error)
    }
  }, [steps, chapterId, queryClient])

  // OPTIMIZED: Optimistic step deletion
  const handleDeleteStep = useCallback(async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return

    const removedStep = steps.find(s => s.id === stepId)
    const removedPages = pages[stepId] || []
    
    if (!removedStep) return

    // OPTIMISTIC UPDATE: Instantly remove from UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      const newPages = { ...old.pages }
      delete newPages[stepId]
      return {
        ...old,
        steps: old.steps.filter((s: any) => s.id !== stepId),
        pages: newPages
      }
    })

    try {
      await deleteStep(stepId)
      toast.success('Step deleted successfully')
    } catch (error) {
      // ROLLBACK: Restore step and pages on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          steps: [...old.steps, removedStep].sort((a: any, b: any) => a.order_index - b.order_index),
          pages: { ...old.pages, [stepId]: removedPages }
        }
      })
      toast.error('Failed to delete step')
      console.error('Error deleting step:', error)
    }
  }, [steps, pages, chapterId, queryClient])

  const handleEnsureRequiredSteps = useCallback(async () => {
    try {
      const result = await adminEnsureRequiredSteps(chapterId)
      if (result.createdCount > 0) {
        toast.success(`Created ${result.createdCount} missing step(s)`)
      } else {
        toast.success('All required steps already exist')
      }
      // OPTIMIZED: Only refresh steps, not everything
      refreshSteps()
    } catch (error) {
      toast.error('Failed to ensure required steps')
    }
  }, [chapterId, refreshSteps])

  // OPTIMIZED: Optimistic page metadata update
  const handleUpdatePageMeta = useCallback(async (pageId: string, updateData: any) => {
    // Find the step containing this page
    let targetStepId: string | null = null
    let originalPage: any = null
    
    for (const [stepId, stepPages] of Object.entries(pages)) {
      const page = stepPages.find(p => p.id === pageId)
      if (page) {
        targetStepId = stepId
        originalPage = page
        break
      }
    }
    
    if (!targetStepId || !originalPage) return
    
    // OPTIMISTIC UPDATE: Instantly update in UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      return {
        ...old,
        pages: {
          ...old.pages,
          [targetStepId!]: old.pages[targetStepId!].map((p: any) =>
            p.id === pageId ? { ...p, ...updateData } : p
          )
        }
      }
    })
    
    try {
      await updatePage(pageId, updateData)
      toast.success('Page metadata updated')
    } catch (error) {
      // ROLLBACK: Restore original data on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: {
            ...old.pages,
            [targetStepId!]: old.pages[targetStepId!].map((p: any) =>
              p.id === pageId ? originalPage : p
            )
          }
        }
      })
      toast.error('Failed to update page metadata')
      console.error('Error updating page metadata:', error)
    }
  }, [pages, chapterId, queryClient])

  const handleValidateForPublish = useCallback(async () => {
    try {
      const validation = await validateChapterForPublish(chapterId)
      setPublishValidation(validation)
      setShowPublishModal(true)
    } catch (error) {
      toast.error('Failed to validate chapter')
    }
  }, [chapterId])

  const handlePublish = useCallback(async () => {
    try {
      await publishChapter(chapterId, true)
      toast.success('Chapter published successfully')
      setShowPublishModal(false)
      // OPTIMIZED: Only refresh chapter data
      refreshChapter()
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish chapter')
    }
  }, [chapterId, refreshChapter])

  const handlePublishWithDummy = useCallback(async () => {
    try {
      await publishChapter(chapterId, true, { allowDummyContent: true })
      toast.success('Chapter published with dummy content placeholders')
      setShowPublishModal(false)
      refreshChapter()
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish chapter with dummy content')
    }
  }, [chapterId, refreshChapter])

  const handleUnpublish = useCallback(async () => {
    if (!confirm('Unpublish this chapter? Users will no longer see it.')) return
    try {
      await publishChapter(chapterId, false)
      toast.success('Chapter unpublished')
      // OPTIMIZED: Only refresh chapter data
      refreshChapter()
    } catch (error) {
      toast.error('Failed to unpublish chapter')
    }
  }, [chapterId, refreshChapter])

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

  // OPTIMIZED: Optimistic step settings update
  const handleSaveStepSettings = useCallback(async (data: { title: string; slug: string; is_required: boolean; hero_image_url?: string }) => {
    if (!editingStep) return

    const originalStep = steps.find(s => s.id === editingStep.id)
    if (!originalStep) return

    // OPTIMISTIC UPDATE: Instantly update in UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      return {
        ...old,
        steps: old.steps.map((s: any) => 
          s.id === editingStep.id ? { ...s, ...data } : s
        )
      }
    })

    try {
      await updateStep(editingStep.id, data)
      if (data.is_required !== editingStep.is_required) {
        await toggleStepRequired(editingStep.id, data.is_required)
      }
      toast.success('Step updated successfully')
      setShowStepSettings(false)
      setEditingStep(null)
    } catch (error) {
      // ROLLBACK: Restore original step on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          steps: old.steps.map((s: any) => 
            s.id === editingStep.id ? originalStep : s
          )
        }
      })
      toast.error('Failed to update step')
      console.error('Error updating step:', error)
    }
  }, [editingStep, steps, chapterId, queryClient])

  // OPTIMIZED: Optimistic step reordering
  const handleStepMoveUp = useCallback(async (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    if (stepIndex <= 0) return

    const originalSteps = [...steps]
    const newOrder = [...steps]
    const temp = newOrder[stepIndex]
    newOrder[stepIndex] = newOrder[stepIndex - 1]
    newOrder[stepIndex - 1] = temp

    const orderUpdates = newOrder.map((step, index) => ({
      id: step.id,
      order_index: index
    }))

    // OPTIMISTIC UPDATE: Instantly reorder in UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      return { ...old, steps: newOrder }
    })

    try {
      await reorderSteps(chapterId, orderUpdates)
      toast.success('Step reordered')
    } catch (error) {
      // ROLLBACK: Restore original order on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return { ...old, steps: originalSteps }
      })
      toast.error('Failed to reorder step')
      console.error('Error reordering step:', error)
    }
  }, [steps, chapterId, queryClient])

  // OPTIMIZED: Optimistic step reordering (down)
  const handleStepMoveDown = useCallback(async (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    if (stepIndex >= steps.length - 1) return

    const originalSteps = [...steps]
    const newOrder = [...steps]
    const temp = newOrder[stepIndex]
    newOrder[stepIndex] = newOrder[stepIndex + 1]
    newOrder[stepIndex + 1] = temp

    const orderUpdates = newOrder.map((step, index) => ({
      id: step.id,
      order_index: index
    }))

    // OPTIMISTIC UPDATE: Instantly reorder in UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      return { ...old, steps: newOrder }
    })

    try {
      await reorderSteps(chapterId, orderUpdates)
      toast.success('Step reordered')
    } catch (error) {
      // ROLLBACK: Restore original order on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return { ...old, steps: originalSteps }
      })
      toast.error('Failed to reorder step')
      console.error('Error reordering step:', error)
    }
  }, [steps, chapterId, queryClient])

  // OPTIMIZED: Optimistic page reordering
  const handlePageMoveUp = useCallback(async (stepId: string, pageId: string) => {
    const stepPages = pages[stepId] || []
    const pageIndex = stepPages.findIndex(p => p.id === pageId)
    if (pageIndex <= 0) return

    const originalPages = { ...pages }
    const newOrder = [...stepPages]
    const temp = newOrder[pageIndex]
    newOrder[pageIndex] = newOrder[pageIndex - 1]
    newOrder[pageIndex - 1] = temp

    const orderUpdates = newOrder.map((page, index) => ({
      id: page.id,
      order_index: index
    }))

    // OPTIMISTIC UPDATE: Instantly reorder in UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      return {
        ...old,
        pages: { ...old.pages, [stepId]: newOrder }
      }
    })

    try {
      await reorderPages(stepId, orderUpdates)
      toast.success('Page reordered')
    } catch (error) {
      // ROLLBACK: Restore original order on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return { ...old, pages: originalPages }
      })
      toast.error('Failed to reorder page')
      console.error('Error reordering page:', error)
    }
  }, [pages, chapterId, queryClient])

  // OPTIMIZED: Optimistic page reordering (down)
  const handlePageMoveDown = useCallback(async (stepId: string, pageId: string) => {
    const stepPages = pages[stepId] || []
    const pageIndex = stepPages.findIndex(p => p.id === pageId)
    if (pageIndex >= stepPages.length - 1) return

    const originalPages = { ...pages }
    const newOrder = [...stepPages]
    const temp = newOrder[pageIndex]
    newOrder[pageIndex] = newOrder[pageIndex + 1]
    newOrder[pageIndex + 1] = temp

    const orderUpdates = newOrder.map((page, index) => ({
      id: page.id,
      order_index: index
    }))

    // OPTIMISTIC UPDATE: Instantly reorder in UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      return {
        ...old,
        pages: { ...old.pages, [stepId]: newOrder }
      }
    })

    try {
      await reorderPages(stepId, orderUpdates)
      toast.success('Page reordered')
    } catch (error) {
      // ROLLBACK: Restore original order on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return { ...old, pages: originalPages }
      })
      toast.error('Failed to reorder page')
      console.error('Error reordering page:', error)
    }
  }, [pages, chapterId, queryClient])

  const handleAddFromTemplate = useCallback((stepId: string) => {
    setCurrentStepForTemplate(stepId)
    setShowTemplateSelector(true)
  }, [])

  const handleApplyTemplate = useCallback(async (templateBlocks: any[]) => {
    if (!currentStepForTemplate) return

    const title = prompt('Enter page title:')
    if (!title) return

    const tempId = `temp-${Date.now()}`
    
    // OPTIMISTIC UPDATE: Instantly add to UI
    queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
      if (!old) return old
      const newPage = {
        id: tempId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: (old.pages[currentStepForTemplate] || []).length,
        estimated_minutes: 5,
        xp_award: 10,
        content: templateBlocks,
        step_id: currentStepForTemplate,
        chunk_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return {
        ...old,
        pages: {
          ...old.pages,
          [currentStepForTemplate]: [...(old.pages[currentStepForTemplate] || []), newPage]
        }
      }
    })

    try {
      const result = await createPage(currentStepForTemplate, {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        order_index: (pages[currentStepForTemplate] || []).length,
        estimated_minutes: 5,
        xp_award: 10,
        content: templateBlocks,
      })
      
      // Replace temp with real data
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: {
            ...old.pages,
            [currentStepForTemplate]: old.pages[currentStepForTemplate].map((p: any) => 
              p.id === tempId ? result.page : p
            )
          }
        }
      })
      
      toast.success('Page created from template')
    } catch (error) {
      // ROLLBACK: Remove temp page on error
      queryClient.setQueryData(['admin-chapter', chapterId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: {
            ...old.pages,
            [currentStepForTemplate]: old.pages[currentStepForTemplate].filter((p: any) => p.id !== tempId)
          }
        }
      })
      toast.error('Failed to create page')
      console.error('Error creating page from template:', error)
    }
  }, [currentStepForTemplate, pages, chapterId, queryClient])

  // OPTIMIZED: Stable callback creators for StepCard props (prevent re-renders)
  const createToggleCallback = useCallback((stepId: string) => () => toggleStep(stepId), [toggleStep])
  const createAddPageCallback = useCallback((stepId: string) => () => handleCreatePage(stepId), [handleCreatePage])
  const createAddFromTemplateCallback = useCallback((stepId: string) => () => handleAddFromTemplate(stepId), [handleAddFromTemplate])
  const createEditStepCallback = useCallback((step: any) => () => handleEditStep(step), [handleEditStep])
  const createDeleteStepCallback = useCallback((stepId: string) => () => handleDeleteStep(stepId), [handleDeleteStep])
  const createStepMoveUpCallback = useCallback((stepId: string) => () => handleStepMoveUp(stepId), [handleStepMoveUp])
  const createStepMoveDownCallback = useCallback((stepId: string) => () => handleStepMoveDown(stepId), [handleStepMoveDown])
  const createPageMoveUpCallback = useCallback((stepId: string) => (pageId: string) => handlePageMoveUp(stepId, pageId), [handlePageMoveUp])
  const createPageMoveDownCallback = useCallback((stepId: string) => (pageId: string) => handlePageMoveDown(stepId, pageId), [handlePageMoveDown])

  // Skeleton loader for chapter editor
  if (isLoading) {
    return (
      <AdminErrorBoundary fallbackMessage="An error occurred while loading this chapter.">
        <div className="p-6 lg:p-8">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-8 animate-pulse">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminErrorBoundary>
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
    <AdminErrorBoundary fallbackMessage="An error occurred while editing this chapter. Your changes may have been saved.">
      <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={returnPage ? `/admin/chapters?page=${returnPage}` : '/admin/chapters'}
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
              onClick={() => handleTabChange(tab as any)}
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
                value={formData.chapter_number ?? ''}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10)
                  setFormData({ ...formData, chapter_number: Number.isNaN(n) ? 1 : n })
                }}
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
                Order Index
              </label>
              <input
                type="number"
                value={formData.order_index ?? ''}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10)
                  setFormData({ ...formData, order_index: Number.isNaN(n) ? 0 : n })
                }}
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
                  onToggle={createToggleCallback(step.id)}
                  onAddPage={createAddPageCallback(step.id)}
                  onAddFromTemplate={createAddFromTemplateCallback(step.id)}
                  onEditStep={createEditStepCallback(step)}
                  onDeleteStep={createDeleteStepCallback(step.id)}
                  onDeletePage={handleDeletePage}
                  onUpdatePage={handleUpdatePageMeta}
                  onMoveUp={createStepMoveUpCallback(step.id)}
                  onMoveDown={createStepMoveDownCallback(step.id)}
                  onPageMoveUp={createPageMoveUpCallback(step.id)}
                  onPageMoveDown={createPageMoveDownCallback(step.id)}
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
                  onToggle={createToggleCallback(step.id)}
                  onAddPage={createAddPageCallback(step.id)}
                  onAddFromTemplate={createAddFromTemplateCallback(step.id)}
                  onEditStep={createEditStepCallback(step)}
                  onDeleteStep={createDeleteStepCallback(step.id)}
                  onDeletePage={handleDeletePage}
                  onUpdatePage={handleUpdatePageMeta}
                  onMoveUp={createStepMoveUpCallback(step.id)}
                  onMoveDown={createStepMoveDownCallback(step.id)}
                  onPageMoveUp={createPageMoveUpCallback(step.id)}
                  onPageMoveDown={createPageMoveDownCallback(step.id)}
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
                  {publishValidation.dummyEligible && (
                    <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        Continue with dummy content?
                      </h3>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        You can publish now with auto-generated placeholder blocks (Coming soon), or close this dialog and add real content before publishing.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowPublishModal(false)}
                >
                  {publishValidation.valid ? 'Close' : 'Add Content Then Publish Later'}
                </Button>
                {publishValidation.valid && (
                  <Button
                    variant="primary"
                    onClick={handlePublish}
                  >
                    Publish Now
                  </Button>
                )}
                {!publishValidation.valid && publishValidation.dummyEligible && (
                  <Button
                    variant="primary"
                    onClick={handlePublishWithDummy}
                  >
                    Continue with Dummy Content
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminErrorBoundary>
  )
}
