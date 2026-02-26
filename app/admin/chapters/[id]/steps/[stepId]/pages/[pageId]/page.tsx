'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Palette, Type, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import BlockRenderer from '@/components/content/BlockRenderer'
import { updatePage } from '@/app/actions/admin'
import toast from 'react-hot-toast'

// Block Editor Palette Component
import dynamic from 'next/dynamic'
const ContentEditor = dynamic(() => import('@/components/admin/ContentEditor'), { ssr: false })

export default function PageEditorPage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = params.id as string
  const stepId = params.stepId as string
  const pageId = params.pageId as string

  const [page, setPage] = useState<any>(null)
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadPage()
  }, [pageId])

  const loadPage = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`)
      const data = await response.json()
      
      if (data) {
        setPage(data)
        setContent(data.content || [])
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
      await updatePage(pageId, { content })
      toast.success('Content saved successfully')
    } catch (error) {
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
                {page.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {page.slug}
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
              <div className="space-y-6">
                {content.map((block, index) => (
                  <BlockRenderer key={index} block={block} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ContentEditor content={content} onChange={setContent} />
        )}
      </div>
    </div>
  )
}
