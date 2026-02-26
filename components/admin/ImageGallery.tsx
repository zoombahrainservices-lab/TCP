'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Image from 'next/image'

interface ImageGalleryProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage?: (url: string) => void
  onSelectMultiple?: (urls: string[]) => void
  allowMultiple?: boolean
  currentImageUrl?: string
}

export default function ImageGallery({
  isOpen,
  onClose,
  onSelectImage,
  onSelectMultiple,
  allowMultiple = false,
  currentImageUrl,
}: ImageGalleryProps) {
  const [images, setImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen])

  const loadImages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/gallery')
      const data = await response.json()
      if (data.images) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Failed to load gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (url: string) => {
    if (allowMultiple) {
      if (selectedImages.includes(url)) {
        setSelectedImages(selectedImages.filter(u => u !== url))
      } else {
        setSelectedImages([...selectedImages, url])
      }
    } else {
      if (onSelectImage) {
        onSelectImage(url)
        onClose()
      }
    }
  }

  const handleConfirmMultiple = () => {
    if (onSelectMultiple && selectedImages.length > 0) {
      onSelectMultiple(selectedImages)
      setSelectedImages([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Image Gallery
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-amber)]"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
              <p>No images in gallery yet. Upload your first image!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className={`relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedImages.includes(url) || url === currentImageUrl
                      ? 'border-[var(--color-amber)] ring-2 ring-[var(--color-amber)]/20'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleSelect(url)}
                >
                  <Image
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  {(selectedImages.includes(url) || url === currentImageUrl) && (
                    <div className="absolute inset-0 bg-[var(--color-amber)]/20 flex items-center justify-center">
                      <div className="bg-[var(--color-amber)] text-white rounded-full p-2">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {allowMultiple && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedImages.length} image(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmMultiple}
                disabled={selectedImages.length === 0}
              >
                Select {selectedImages.length > 0 && `(${selectedImages.length})`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
