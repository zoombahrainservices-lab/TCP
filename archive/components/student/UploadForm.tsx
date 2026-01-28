'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface UploadFormProps {
  onUpload: (type: 'audio' | 'image' | 'text', fileOrText: File | string) => Promise<void>
}

export default function UploadForm({ onUpload }: UploadFormProps) {
  const [uploadType, setUploadType] = useState<'audio' | 'image' | 'text'>('audio')
  const [textContent, setTextContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (uploadType === 'text') {
      if (textContent.length < 50) {
        setError('Text content must be at least 50 characters')
        return
      }
      setUploading(true)
      try {
        await onUpload('text', textContent)
      } catch (err) {
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    } else {
      if (!file) {
        setError('Please select a file')
        return
      }
      setUploading(true)
      try {
        await onUpload(uploadType, file)
      } catch (err) {
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUploadType('audio')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
              uploadType === 'audio'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            🎤 Audio
          </button>
          <button
            type="button"
            onClick={() => setUploadType('image')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
              uploadType === 'image'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            📷 Image
          </button>
          <button
            type="button"
            onClick={() => setUploadType('text')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
              uploadType === 'text'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            📝 Text
          </button>
        </div>
      </div>

      {uploadType === 'text' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            placeholder="Write your response here (minimum 50 characters)"
            required
          />
          <p className="text-sm text-gray-500 mt-1">{textContent.length} characters</p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {uploadType === 'audio' ? 'Audio' : 'Image'} File
          </label>
          <input
            type="file"
            accept={uploadType === 'audio' ? 'audio/*' : 'image/*'}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {file && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" fullWidth disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Proof'}
      </Button>
    </form>
  )
}
