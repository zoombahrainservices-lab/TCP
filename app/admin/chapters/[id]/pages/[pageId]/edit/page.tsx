'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import BlockRenderer from '@/components/content/BlockRenderer'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { updatePage } from '@/app/actions/admin'
import { validateBlocks } from '@/lib/blocks/validator'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const ContentEditor = dynamic(() => import('@/components/admin/ContentEditor'), { ssr: false })

export default function PageContentEditorPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const chapterId = params.id as string
  const pageId = params.pageId as string

  const [page, setPage] = useState<any>(null)
  const [chapter, setChapter] = useState<any>(null)
  const [step, setStep] = useState<any>(null)
  const [pageTitle, setPageTitle] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const from = searchParams.get('from')
  const returnUrlParam = searchParams.get('returnUrl')

  const handleBack = () => {
    if (returnUrlParam) {
      // Prefer explicit returnUrl when provided
      router.push(returnUrlParam)
      return
    }

    if (from === 'steps') {
      router.push(`/admin/chapters/${chapterId}?tab=steps`)
      return
    }

    if (from === 'reading' && chapter?.slug) {
      router.push(`/read/${chapter.slug}/reading`)
      return
    }

    // Fallback: go to chapter editor
    router.push(`/admin/chapters/${chapterId}`)
  }

  useEffect(() => {
    loadPage()
    loadChapter()
  }, [pageId, chapterId])

  const loadChapter = async () => {
    try {
      const response = await fetch(`/api/admin/chapters/${chapterId}`)
      const data = await response.json()
      if (data && !data.error) {
        setChapter(data)
      }
    } catch (error) {
      console.error('Error loading chapter:', error)
    }
  }

  const loadPage = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`)
      const data = await response.json()
      
      if (data && !data.error) {
        setPage(data)
        setPageTitle(data.title || '')
        setHeroImageUrl(data.hero_image_url || '')
        setContent(data.content || [])
        
        // Fetch step info if we have step_id
        if (data.step_id) {
          const stepResponse = await fetch(`/api/admin/steps/${data.step_id}`)
          const stepData = await stepResponse.json()
          if (stepData && !stepData.error) {
            setStep(stepData)
          }
        }
        
        console.log('Loaded page content:', data.content)
      } else {
        toast.error(data.error || 'Failed to load page')
      }
    } catch (error) {
      console.error('Error loading page:', error)
      toast.error('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Normalize content so it is plain JSON-serializable and framework_intro blocks
   * have required fields. Prevents server-action serialization and DB validation issues.
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
      return block
    })
    return JSON.parse(JSON.stringify(normalized))
  }

  const savePage = async (contentToSave: any[]) => {
    setSaving(true)
    try {
      const prepared = prepareContentForSave(contentToSave)
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

      await updatePage(pageId, payload)
      toast.success('Content saved successfully')
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
      await loadPage()

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

  if (loading) {
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
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {page.title || 'Untitled Page'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {page.slug} • {(page.content || []).length} blocks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Title (shown to users)
                </label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Enter page title..."
                  className="w-full px-4 py-3 text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This title appears at the top of the page for users. It's separate from content blocks below.
                </p>
              </div>

              {/* Hero Image Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Hero Image (Main Left-Side Image)
                </label>
                
                {/* Hero Image Preview - Large */}
                {heroImageUrl && (
                  <div className="mb-4">
                    <div className="relative w-full max-w-2xl aspect-[4/3] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img
                        src={heroImageUrl}
                        alt="Hero image preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      👆 This is how the main image will appear on the left side of the page
                    </p>
                  </div>
                )}
                
                {/* Upload/Change Hero Image */}
                <ImageUploadField
                  label={heroImageUrl ? "Change Hero Image" : "Upload Hero Image"}
                  value={heroImageUrl}
                  onChange={(url) => setHeroImageUrl(typeof url === 'string' ? url : url[0] || '')}
                  chapterSlug={chapter?.slug || 'general'}
                  stepSlug={step?.slug || 'content'}
                  pageOrder={page?.order_index || 0}
                  helperText="Main image shown on the left side of the page. Leave empty to use first image block from content."
                />
                
                <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  💡 <strong>Tip:</strong> For smaller inline images within text (right side), use the "Image" block in content below.
                </p>
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
                onSaveContent={async (updatedContent) => {
                  // Update local state immediately so the UI matches
                  // the just-saved version, then persist to the server.
                  setContent(updatedContent)
                  await savePage(updatedContent)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
