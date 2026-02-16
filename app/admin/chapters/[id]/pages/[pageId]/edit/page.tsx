'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageContentEditor from '@/components/admin/PageContentEditor'
import { getPageWithContent, updatePageContent } from '@/app/actions/admin'
import toast from 'react-hot-toast'

export default function PageEditorPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.pageId as string
  
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadPage()
  }, [pageId])
  
  const loadPage = async () => {
    try {
      const page = await getPageWithContent(pageId)
      setContent(page.content || [])
    } catch (error) {
      console.error('Error loading page:', error)
      toast.error('Failed to load page')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSave = async (newContent: any[]) => {
    await updatePageContent(pageId, newContent)
  }
  
  const handleClose = () => {
    router.back()
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)]"></div>
      </div>
    )
  }
  
  return (
    <PageContentEditor
      initialContent={content}
      pageId={pageId}
      onSave={handleSave}
      onClose={handleClose}
    />
  )
}
