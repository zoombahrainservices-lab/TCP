'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Eye, EyeOff, Trash2, Download, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface BulkActionsToolbarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onPublish?: (ids: string[]) => Promise<void>
  onUnpublish?: (ids: string[]) => Promise<void>
  onDelete?: (ids: string[]) => Promise<void>
  onExport?: (ids: string[]) => Promise<void>
}

export default function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
  onPublish,
  onUnpublish,
  onDelete,
  onExport,
}: BulkActionsToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      await action()
      toast.success(successMessage)
      onClearSelection()
    } catch (error: any) {
      toast.error(error.message || 'Operation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublish = () => {
    if (!onPublish) return
    handleAction(
      () => onPublish(selectedIds),
      `${selectedIds.length} chapter(s) published`
    )
  }

  const handleUnpublish = () => {
    if (!onUnpublish) return
    handleAction(
      () => onUnpublish(selectedIds),
      `${selectedIds.length} chapter(s) unpublished`
    )
  }

  const handleDelete = () => {
    if (!onDelete) return
    
    if (!confirm(`Delete ${selectedIds.length} chapter(s)? This action cannot be undone.`)) {
      return
    }
    
    handleAction(
      () => onDelete(selectedIds),
      `${selectedIds.length} chapter(s) deleted`
    )
  }

  const handleExport = () => {
    if (!onExport) return
    handleAction(
      () => onExport(selectedIds),
      `${selectedIds.length} chapter(s) exported`
    )
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedIds.length} selected
            </span>
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onPublish && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePublish}
                disabled={isProcessing}
              >
                <Eye className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}

            {onUnpublish && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUnpublish}
                disabled={isProcessing}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish
              </Button>
            )}

            {onExport && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={isProcessing}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}

            {onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDelete}
                disabled={isProcessing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
