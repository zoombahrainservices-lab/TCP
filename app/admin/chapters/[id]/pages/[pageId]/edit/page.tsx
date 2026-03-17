'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Eye, ChevronLeft, ChevronRight, Plus, Copy } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import BlockRenderer from '@/components/content/BlockRenderer'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { updatePage, createPage, duplicatePage } from '@/app/actions/admin'
import { validateBlocks } from '@/lib/blocks/validator'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const ContentEditor = dynamic(() => import('@/components/admin/ContentEditor'), { ssr: false })

export default function PageContentEditorPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const chapterId = params.id as string
  const pageId = params.pageId as string

  // OPTIMIZED: Use React Query for single consolidated fetch
  const { data, isLoading } = useQuery({
    queryKey: ['admin-page-full', pageId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/pages/${pageId}/full`)
      if (!res.ok) throw new Error('Failed to load page')
      return res.json()
    },
    staleTime: 30000,
  })

  const [page, setPage] = useState<any>(null)
  const [chapter, setChapter] = useState<any>(null)
  const [step, setStep] = useState<any>(null)
  const [prevPage, setPrevPage] = useState<any>(null)
  const [nextPage, setNextPage] = useState<any>(null)
  const [pageTitle, setPageTitle] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [titleStyle, setTitleStyle] = useState<{ color?: string; fontSize?: string; fontWeight?: string }>({})
  const [content, setContent] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [addPageLoading, setAddPageLoading] = useState(false)
  const [duplicatePageLoading, setDuplicatePageLoading] = useState(false)

  const from = searchParams.get('from')
  const returnUrlParam = searchParams.get('returnUrl')

  // Initialize state when data loads
  useEffect(() => {
    if (!data) return

    setPage(data.page)
    setChapter(data.chapter)
    setStep(data.step)
    setPrevPage(data.prevPage)
    setNextPage(data.nextPage)
    setPageTitle(data.page.title || '')
    setHeroImageUrl(data.page.hero_image_url || '')
    
    // Title style: prefer page_meta block in content (works without DB column), else title_style column
    const firstBlock = data.page.content?.[0]
    const fromPageMeta = firstBlock?.type === 'page_meta' && firstBlock?.title_style
    setTitleStyle(fromPageMeta ? (firstBlock.title_style || {}) : (data.page.title_style && typeof data.page.title_style === 'object' ? data.page.title_style : {}))
    setContent(data.page.content || [])
    
    console.log('Loaded page content:', data.page.content)
  }, [data])

  const handleBack = () => {
    if (returnUrlParam) {
      // Prefer explicit returnUrl when provided (e.g. from reading page or steps with expand)
      router.push(returnUrlParam)
      return
    }

    if (from === 'steps') {
      // Return to steps tab with same step expanded and same page in URL so we scroll to it
      const expand = step?.id ? `&expand=${step.id}` : ''
      const pageParam = page?.id ? `&page=${page.id}` : ''
      router.push(`/admin/chapters/${chapterId}?tab=steps${expand}${pageParam}`)
      return
    }

    if (from === 'reading' && chapter?.slug) {
      // Go to the step that contains this page, not always the first step
      const stepSlug = step?.slug ?? 'reading'
      router.push(`/read/${chapter.slug}/${stepSlug}`)
      return
    }

    // Fallback: go to chapter editor
    router.push(`/admin/chapters/${chapterId}`)
  }

  const handleNavigateToPage = (targetPageId: string) => {
    // Preserve current query params for context
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (returnUrlParam) params.set('returnUrl', returnUrlParam)
    
    const queryString = params.toString()
    router.push(`/admin/chapters/${chapterId}/pages/${targetPageId}/edit${queryString ? `?${queryString}` : ''}`)
  }

  const handleAddNewPage = async () => {
    if (!step?.id || !page) return
    setAddPageLoading(true)
    try {
      const result = await createPage(step.id, {
        title: 'New Page',
        slug: 'new-page',
        order_index: (page.order_index ?? 0) + 1,
        content: [],
        estimated_minutes: 5,
        xp_award: 10,
      })
      if (result.success && result.page) {
        toast.success('Page created')
        handleNavigateToPage(result.page.id)
      } else {
        toast.error('Failed to add page')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add page')
    } finally {
      setAddPageLoading(false)
    }
  }

  const handleDuplicatePage = async () => {
    if (!page?.id) return
    setDuplicatePageLoading(true)
    try {
      const result = await duplicatePage(page.id)
      if (result.success && result.page) {
        toast.success('Page duplicated')
        handleNavigateToPage(result.page.id)
      } else {
        toast.error('Failed to duplicate page')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to duplicate page')
    } finally {
      setDuplicatePageLoading(false)
    }
  }

  /**
   * Normalize content so it is plain JSON-serializable and framework_intro blocks
   * have required fields. Prevents server-action serialization and DB validation issues.
   * Also normalizes scale_questions so validation passes (scale + question ids).
   */
  const prepareContentForSave = (raw: any[]): any[] => {
    const normalized = raw.map((block: any) => {
      if (!block || typeof block !== 'object') return block
      if (block.type === 'framework_intro') {
        const letters = Array.isArray(block.letters)
          ? block.letters.map((item: any) => ({
              letter: typeof item?.letter === 'string' ? item.letter : '',
              meaning: typeof item?.meaning === 'string' ? item.meaning : '',
              ...(typeof item?.color === 'string' ? { color: item.color } : {}),
            }))
          : [{ letter: 'S', meaning: 'Surface the Pattern' }]
        const hasLetters = letters.length > 0 && letters.some((item: { letter: string; meaning: string }) => item.letter || item.meaning)
        return {
          type: 'framework_intro',
          frameworkCode: typeof block.frameworkCode === 'string' ? block.frameworkCode : 'SPARK',
          title: typeof block.title === 'string' ? block.title : 'Framework Title',
          description: typeof block.description === 'string' ? block.description : 'Framework description',
          letters: hasLetters ? letters : [{ letter: 'S', meaning: 'Surface the Pattern' }],
          ...(typeof block.accentColor === 'string' ? { accentColor: block.accentColor } : {}),
        }
      }
      if (block.type === 'scale_questions') {
        const questions = Array.isArray(block.questions) ? block.questions : []
        const scale = block.scale && typeof block.scale === 'object'
          ? {
              min: typeof block.scale.min === 'number' ? block.scale.min : 1,
              max: typeof block.scale.max === 'number' ? block.scale.max : 5,
              minLabel: typeof block.scale.minLabel === 'string' ? block.scale.minLabel : 'Not at all',
              maxLabel: typeof block.scale.maxLabel === 'string' ? block.scale.maxLabel : 'Completely',
            }
          : { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Completely' }
        return {
          type: 'scale_questions',
          id: typeof block.id === 'string' && block.id.trim() ? block.id : 'scale_questions',
          ...(block.title != null && { title: block.title }),
          ...(block.description != null && { description: block.description }),
          ...(block.questionNumbering && { questionNumbering: block.questionNumbering }),
          questions: questions.map((q: any, i: number) => ({
            id: (q && typeof q.id === 'string' && q.id.trim()) ? q.id : `q${i}`,
            text: (q && typeof q.text === 'string') ? q.text : 'Question',
            ...(q && typeof q.number === 'number' && { number: q.number }),
          })),
          scale,
          ...(block.scoring && typeof block.scoring === 'object' && { scoring: block.scoring }),
        }
      }
      return block
    })
    return JSON.parse(JSON.stringify(normalized))
  }

  const savePage = async (contentToSave: any[]) => {
    setSaving(true)
    try {
      // Embed title_style in content as page_meta block so it persists without needing title_style column
      const pageMetaBlock = {
        type: 'page_meta',
        title_style: {
          ...(titleStyle.color && { color: titleStyle.color }),
          fontSize: titleStyle.fontSize || 'lg',
          fontWeight: titleStyle.fontWeight || 'bold',
        },
      }
      const contentWithoutMeta = contentToSave.filter((b: any) => b?.type !== 'page_meta')
      const contentWithMeta = [pageMetaBlock, ...contentWithoutMeta]

      const prepared = prepareContentForSave(contentWithMeta)
      const validation = validateBlocks(prepared)
      if (!validation.valid) {
        toast.error(`Validation failed: ${validation.errors.join('; ')}`)
        setSaving(false)
        return
      }

      const payload: { title: string; content: any[]; hero_image_url?: string | null } = {
        title: pageTitle,
        content: prepared,
        hero_image_url: heroImageUrl || null,
      }

      console.log('[SavePage] Saving content blocks:', prepared.length, 'blocks')
      console.log('[SavePage] Content preview:', JSON.stringify(prepared.slice(0, 3), null, 2))

      await updatePage(pageId, payload)
      
      // Invalidate React Query cache to force refetch
      await queryClient.invalidateQueries({ queryKey: ['admin-page-full', pageId] })
      
      // Also refresh the router to ensure all data is fresh
      router.refresh()
      
      toast.success('Content saved successfully')
      console.log('[SavePage] Save complete, cache invalidated')
    } catch (error: any) {
      console.error('Error saving:', error)
      const message = error?.message ?? (typeof error === 'string' ? error : 'Failed to save content')
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    await savePage(content)
  }

  const handleMigrateImages = async () => {
    if (!confirm('Migrate all external images in this page to Supabase bucket?\n\nThis will:\n1. Download all external images\n2. Upload them to your bucket\n3. Update image URLs\n4. Set first image as hero image (if none set)\n\nThis cannot be undone.')) {
      return
    }

    setMigrating(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/migrate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          content,
          chapterSlug: chapter?.slug || 'general',
          stepSlug: step?.slug || 'content',
          pageOrder: page?.order_index || 0
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Migration failed')
      }

      // Update content with migrated URLs
      setContent(result.updatedContent)

      // If no hero image set and we have migrated images, use the first one
      if (!heroImageUrl && result.migratedImages.length > 0) {
        const firstMigratedImage = result.migratedImages[0]
        setHeroImageUrl(firstMigratedImage.newUrl)
        
        // Save hero image immediately
        await updatePage(pageId, { 
          hero_image_url: firstMigratedImage.newUrl,
          content: result.updatedContent 
        })
      } else {
        // Just save the updated content
        await savePage(result.updatedContent)
      }

      toast.success(
        `✓ Migrated ${result.summary.total} image(s)${result.summary.failed > 0 ? ` (${result.summary.failed} failed)` : ''}`,
        { duration: 5000 }
      )

      if (result.errors.length > 0) {
        console.error('Migration errors:', result.errors)
        toast.error(`Failed to migrate ${result.errors.length} image(s). Check console for details.`)
      }

      // Reload page to show updated content
      window.location.reload()

    } catch (error: any) {
      console.error('Migration error:', error)
      toast.error(error.message || 'Failed to migrate images')
    } finally {
      setMigrating(false)
    }
  }

  // Check if page has any external images that can be migrated
  const hasExternalImages = content.some(block => 
    block?.type === 'image' && 
    block.src && 
    typeof block.src === 'string' &&
    !block.src.includes('supabase.co') &&
    !block.src.startsWith('/') &&
    !block.src.startsWith('./')
  )

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)]"></div>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Page not found</p>
          <button
            onClick={handleBack}
            className="text-[var(--color-amber)] hover:underline mt-4 inline-block"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header - same color/design as Page Title section */}
      <div className="flex-shrink-0 border-b border-amber-200 dark:border-amber-800 p-4 lg:p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1c1917] dark:text-amber-50">
                {page.title || 'Untitled Page'}
              </h1>
              <p className="text-sm text-amber-700/90 dark:text-amber-300/80 mt-1">
                {page.slug} • {(page.content || []).length} blocks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Page Navigation */}
            <div className="flex items-center gap-1 mr-2 border-r border-amber-300 dark:border-amber-700 pr-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => prevPage && handleNavigateToPage(prevPage.id)}
                disabled={!prevPage}
                title={prevPage ? `Previous: ${prevPage.title || prevPage.slug}` : 'No previous page'}
                className="px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-amber-700 dark:text-amber-300 px-2 whitespace-nowrap">
                Page {page.order_index + 1}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => nextPage && handleNavigateToPage(nextPage.id)}
                disabled={!nextPage}
                title={nextPage ? `Next: ${nextPage.title || nextPage.slug}` : 'No next page'}
                className="px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {!nextPage && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddNewPage}
                disabled={addPageLoading}
                title="Add a new page after this one"
                className="mr-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                {addPageLoading ? 'Adding...' : 'Add new page'}
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDuplicatePage}
              disabled={duplicatePageLoading}
              title="Duplicate this page with the same content"
            >
              <Copy className="w-4 h-4 mr-2" />
              {duplicatePageLoading ? 'Duplicating...' : 'Duplicate page'}
            </Button>
            
            {hasExternalImages && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMigrateImages}
                disabled={migrating || saving}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {migrating ? 'Migrating...' : 'Migrate Images'}
              </Button>
            )}
            <Button
              variant={previewMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {previewMode ? (
          <div className="h-full overflow-y-auto p-8 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Preview</h2>
              {pageTitle && (
                <h1 className="text-3xl md:text-4xl font-bold text-[#2a2416] dark:text-white mb-6">
                  {pageTitle}
                </h1>
              )}
              {content.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No content blocks yet</p>
              ) : (
                <div className="space-y-6">
                  {content.map((block, index) => (
                    <BlockRenderer key={index} block={block} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Page Title Editor - Above Content Blocks */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20">
              <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Page Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200 mb-2">
                    Page Title (shown to users)
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="Enter page title..."
                    className="w-full px-5 py-4 text-2xl font-bold tracking-tight border-2 border-amber-200 dark:border-amber-800 rounded-xl bg-white dark:bg-gray-900 text-[#1c1917] dark:text-amber-50 placeholder:text-gray-400 dark:placeholder:text-amber-900/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:border-amber-400 dark:focus:ring-amber-600 dark:focus:border-amber-600 shadow-sm"
                  />
                  <p className="mt-2.5 text-sm text-amber-700/90 dark:text-amber-300/80">
                    This title appears at the top of the page for users. It's separate from content blocks below.
                  </p>
                </div>

                {/* Right: Page Title Style */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200 mb-3">
                    Page Title Style (on the reading page)
                  </label>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <span className="block text-xs text-amber-700 dark:text-amber-300 mb-1">Color</span>
                      <select
                        value={titleStyle.color ?? ''}
                        onChange={(e) => setTitleStyle((s) => ({ ...s, color: e.target.value || undefined }))}
                        className="px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900 text-[#1c1917] dark:text-amber-50 text-sm"
                      >
                        <option value="">Default (theme)</option>
                        <option value="#1c1917">Dark</option>
                        <option value="#c2410c">Orange</option>
                        <option value="#1e40af">Blue</option>
                        <option value="#166534">Green</option>
                        <option value="#7c2d12">Brown</option>
                      </select>
                    </div>
                    <div>
                      <span className="block text-xs text-amber-700 dark:text-amber-300 mb-1">Size</span>
                      <select
                        value={titleStyle.fontSize ?? 'lg'}
                        onChange={(e) => setTitleStyle((s) => ({ ...s, fontSize: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900 text-[#1c1917] dark:text-amber-50 text-sm"
                      >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra large</option>
                      </select>
                    </div>
                    <div>
                      <span className="block text-xs text-amber-700 dark:text-amber-300 mb-1">Weight</span>
                      <select
                        value={titleStyle.fontWeight ?? 'bold'}
                        onChange={(e) => setTitleStyle((s) => ({ ...s, fontWeight: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900 text-[#1c1917] dark:text-amber-50 text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-amber-700/90 dark:text-amber-300/80">
                    Controls how the heading looks when users view this page (color, size, bold).
                  </p>
                </div>
              </div>
            </div>

            {/* Content Blocks Editor */}
            <div className="flex-1 overflow-hidden">
              <ContentEditor 
                content={content} 
                onChange={setContent}
                chapterSlug={chapter?.slug || 'general'}
                stepSlug={step?.slug || 'content'}
                pageOrder={page?.order_index || 0}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
