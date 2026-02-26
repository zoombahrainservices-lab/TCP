'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import BlockRenderer from '@/components/content/BlockRenderer'
import { updatePage } from '@/app/actions/admin'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const ContentEditor = dynamic(() => import('@/components/admin/ContentEditor'), { ssr: false })

export default function PageContentEditorPage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = params.id as string
  const pageId = params.pageId as string

  const [page, setPage] = useState<any>(null)
  const [chapter, setChapter] = useState<any>(null)
  const [step, setStep] = useState<any>(null)
  const [pageTitle, setPageTitle] = useState('')
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

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

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePage(pageId, { title: pageTitle, content })
      toast.success('Content saved successfully')
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
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

  if (!page) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Page not found</p>
          <Link href={`/admin/chapters/${chapterId}`} className="text-[var(--color-amber)] hover:underline mt-4 inline-block">
            Back to Chapter
          </Link>
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
            <Link
              href={`/admin/chapters/${chapterId}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
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
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
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
