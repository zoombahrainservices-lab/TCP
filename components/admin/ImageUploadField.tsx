'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FolderOpen } from 'lucide-react'
import Button from '@/components/ui/Button'
import ImageGallery from './ImageGallery'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface ImageUploadFieldProps {
  label: string
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  accept?: string
  helperText?: string
  required?: boolean
  chapterSlug?: string
  stepSlug?: string
  pageOrder?: number
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  multiple = false,
  accept = 'image/*',
  helperText,
  required = false,
  chapterSlug = 'uploads',
  stepSlug = 'general',
  pageOrder = 0,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentValue = Array.isArray(value) ? value : value ? [value] : []

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('chapterSlug', chapterSlug)
        formData.append('stepSlug', stepSlug)
        formData.append('pageOrder', pageOrder.toString())

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const { url } = await response.json()
        uploadedUrls.push(url)
      }

      if (multiple) {
        onChange([...currentValue, ...uploadedUrls])
      } else {
        onChange(uploadedUrls[0])
      }

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleRemove = (indexOrUrl: number | string) => {
    if (multiple) {
      const index = typeof indexOrUrl === 'number' ? indexOrUrl : currentValue.indexOf(indexOrUrl)
      const newValue = currentValue.filter((_, i) => i !== index)
      onChange(newValue)
    } else {
      onChange('')
    }
  }

  const handleGallerySelect = (urls: string | string[]) => {
    if (multiple && Array.isArray(urls)) {
      onChange([...currentValue, ...urls])
    } else if (Array.isArray(urls)) {
      onChange(urls[0])
    } else {
      onChange(urls)
    }
    setShowGallery(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Current Images */}
      {currentValue.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          {currentValue.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt={`${label} ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {(multiple || currentValue.length === 0) && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragOver
              ? 'border-[var(--color-amber)] bg-amber-50 dark:bg-amber-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-[var(--color-amber)]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop {multiple ? 'images' : 'an image'} here, or
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowGallery(true)}
                disabled={uploading}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Browse Gallery
              </Button>
            </div>
            {helperText && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {helperText}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Show button to add more when multiple is enabled and has values */}
      {multiple && currentValue.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Add More
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowGallery(true)}
            disabled={uploading}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Browse Gallery
          </Button>
        </div>
      )}

      {/* Image Gallery Modal */}
      <ImageGallery
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelectImage={multiple ? undefined : handleGallerySelect}
        onSelectMultiple={multiple ? handleGallerySelect : undefined}
        allowMultiple={multiple}
        currentImageUrl={multiple ? undefined : currentValue[0]}
      />
    </div>
  )
}
