'use client'

import { useState, useEffect } from 'react'
import { getAllParts, getAllChapters, createPart, updatePart, deletePart, deleteChapter, publishChapter, createChapterWithSteps } from '@/app/actions/admin'
import PartEditor from '@/components/admin/PartEditor'
import ChapterWizard from '@/components/admin/ChapterWizard'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  FileJson,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChaptersPage() {
  const [parts, setParts] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showPartEditor, setShowPartEditor] = useState(false)
  const [showChapterWizard, setShowChapterWizard] = useState(false)
  const [editingPart, setEditingPart] = useState<any>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Use server actions instead of direct client calls
      const [loadedParts, loadedChapters] = await Promise.all([
        getAllParts(),
        getAllChapters(),
      ])
      
      setParts(loadedParts)
      setChapters(loadedChapters)
      
      console.log('=== ADMIN CHAPTERS DEBUG ===')
      console.log('Loaded parts:', loadedParts.length)
      console.log('Parts data:', loadedParts)
      console.log('Loaded chapters:', loadedChapters.length)
      console.log('Chapters data:', loadedChapters)
      
      // Group chapters by part_id for debugging
      const grouped = loadedChapters.reduce((acc: any, ch: any) => {
        const partId = ch.part_id || 'null'
        if (!acc[partId]) acc[partId] = []
        acc[partId].push(ch.title)
        return acc
      }, {})
      console.log('Chapters grouped by part_id:', grouped)
      
      // Expand all parts by default
      const partIds = loadedParts.map((p: any) => p.id)
      console.log('Setting expanded parts:', partIds)
      setExpandedParts(new Set(partIds))
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load chapters')
    } finally {
      setLoading(false)
    }
  }

  const togglePart = (partId: string) => {
    const newExpanded = new Set(expandedParts)
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId)
    } else {
      newExpanded.add(partId)
    }
    setExpandedParts(newExpanded)
  }

  const handleCreatePart = () => {
    setEditingPart(null)
    setShowPartEditor(true)
  }

  const handleEditPart = (part: any) => {
    setEditingPart(part)
    setShowPartEditor(true)
  }

  const handleSavePart = async (data: any) => {
    try {
      if (editingPart) {
        await updatePart(editingPart.id, data)
        toast.success('Part updated successfully')
      } else {
        await createPart(data)
        toast.success('Part created successfully')
      }
      setShowPartEditor(false)
      setEditingPart(null)
      loadData()
    } catch (error) {
      toast.error('Failed to save part')
    }
  }

  const handleDeletePart = (part: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Part',
      message: `Are you sure you want to delete "${part.title}"? All chapters in this part will also be deleted.`,
      onConfirm: async () => {
        try {
          await deletePart(part.id)
          toast.success('Part deleted successfully')
          loadData()
        } catch (error) {
          toast.error('Failed to delete part')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  const handleCreateChapter = async (data: any) => {
    try {
      await createChapterWithSteps(data)
      toast.success('Chapter created successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to create chapter')
      throw error
    }
  }

  const handleDeleteChapter = (chapter: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Chapter',
      message: `Are you sure you want to delete "${chapter.title}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteChapter(chapter.id)
          toast.success('Chapter deleted successfully')
          loadData()
        } catch (error) {
          toast.error('Failed to delete chapter')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  const handleTogglePublish = async (chapter: any) => {
    try {
      await publishChapter(chapter.id, !chapter.is_published)
      toast.success(chapter.is_published ? 'Chapter unpublished' : 'Chapter published')
      loadData()
    } catch (error) {
      toast.error('Failed to update chapter')
    }
  }

  const chaptersByPart = chapters.reduce((acc, chapter) => {
    if (!acc[chapter.part_id]) {
      acc[chapter.part_id] = []
    }
    acc[chapter.part_id].push(chapter)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chapter Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage parts, chapters, steps, and content
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                // Expand all parts
                setExpandedParts(new Set(parts.map((p: any) => p.id)))
                toast.success('All parts expanded')
              }}
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Expand All
            </Button>
            <Button variant="secondary" size="sm">
              <FileJson className="w-4 h-4 mr-2" />
              Import/Export
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCreatePart}>
              <Plus className="w-4 h-4 mr-2" />
              New Part
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowChapterWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Chapter
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Parts</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {parts.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Chapters</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {chapters.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {chapters.filter(c => c.is_published).length}
          </p>
        </div>
      </div>

      {/* Parts and Chapters */}
      <div className="space-y-4">
        {parts.length === 0 && chapters.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No parts or chapters yet. Get started by creating a part.
            </p>
            <Button variant="primary" onClick={handleCreatePart}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Part
            </Button>
          </div>
        ) : parts.length === 0 && chapters.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Chapters Without Parts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {chapters.length} chapters
              </p>
            </div>
            <div className="p-6 space-y-3">
              {chapters.map((chapter: { id: string; chapter_number: number; is_published: boolean; title: string; subtitle?: string }) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[var(--color-amber)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">
                      {chapter.chapter_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        {chapter.is_published ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {chapter.title}
                        </h3>
                      </div>
                      {chapter.subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {chapter.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/chapters/${chapter.id}`}>
                      <Button variant="primary" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(chapter)}
                    >
                      {chapter.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChapter(chapter)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        
        {parts.map((part) => {
          const partChapters = chaptersByPart[part.id] || []
          const isExpanded = expandedParts.has(part.id)
          
          // Debug logging for each part
          console.log(`Part "${part.title}" (${part.id}):`, {
            isExpanded,
            chaptersCount: partChapters.length,
            chapters: partChapters.map((c: any) => c.title)
          })

          return (
            <div
              key={part.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              {/* Part Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePart(part.id)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {part.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {partChapters.length} chapters {isExpanded ? '(expanded)' : '(collapsed - click arrow to expand)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPart(part)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePart(part)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chapters List */}
              {isExpanded && (
                <div className="p-6">
                  {partChapters.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      No chapters in this part yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {partChapters.map((chapter: { id: string; chapter_number: number; is_published: boolean; title: string; subtitle?: string }) => (
                        <div
                          key={chapter.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[var(--color-amber)] transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[var(--color-amber)]">
                                Ch {chapter.chapter_number}
                              </span>
                              {chapter.is_published ? (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                                  Published
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded text-xs">
                                  Draft
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {chapter.title}
                          </h3>
                          
                          {chapter.subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {chapter.subtitle}
                            </p>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Link
                              href={`/admin/chapters/${chapter.id}`}
                              className="flex-1"
                            >
                              <Button variant="primary" size="sm" fullWidth>
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePublish(chapter)}
                            >
                              {chapter.is_published ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChapter(chapter)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        
        {/* Debug: Show all chapters in a list at the bottom */}
        {chapters.length > 0 && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              🔍 Debug: All Chapters in Database ({chapters.length})
            </h3>
            <div className="space-y-2">
              {chapters.map((chapter: any) => (
                <div 
                  key={chapter.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[var(--color-amber)]">Ch {chapter.chapter_number}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{chapter.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Part ID: {chapter.part_id || 'NULL'} | 
                        Published: {chapter.is_published ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/chapters/${chapter.id}`}>
                    <Button variant="primary" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
              💡 If chapters aren't showing above, check if their part_id matches an existing part.
            </p>
          </div>
        )}
      </div>

      {/* Part Editor Modal */}
      <PartEditor
        isOpen={showPartEditor}
        onClose={() => {
          setShowPartEditor(false)
          setEditingPart(null)
        }}
        onSubmit={handleSavePart}
        initialData={editingPart}
      />

      {/* Chapter Wizard */}
      <ChapterWizard
        isOpen={showChapterWizard}
        parts={parts}
        onClose={() => setShowChapterWizard(false)}
        onCreate={handleCreateChapter}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  )
}
