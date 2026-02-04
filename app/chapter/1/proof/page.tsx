'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeSectionBlock } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'

type ResolutionType = 'text' | 'image' | 'audio' | 'video'

type ProofDraft = {
  id: number
  type: ResolutionType
  title: string
  notes: string
  file?: File
  previewUrl?: string
}

export default function ResolutionPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<ProofDraft[]>([
    {
      id: 1,
      type: 'text',
      title: '',
      notes: ''
    }
  ])

  const [nextId, setNextId] = useState(2)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTypeChange = (id: number, type: ResolutionType) => {
    setDrafts(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, type, file: undefined, previewUrl: undefined }
          : item
      )
    )
  }

  const handleTitleChange = (id: number, value: string) => {
    setDrafts(prev => prev.map(item => (item.id === id ? { ...item, title: value } : item)))
  }

  const handleNotesChange = (id: number, value: string) => {
    setDrafts(prev => prev.map(item => (item.id === id ? { ...item, notes: value } : item)))
  }

  const handleFileChange = (id: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const file = fileList[0]
    const previewUrl = URL.createObjectURL(file)

    setDrafts(prev =>
      prev.map(item =>
        item.id === id ? { ...item, file, previewUrl } : item
      )
    )
  }

  const addDraft = () => {
    setDrafts(prev => [
      ...prev,
      {
        id: nextId,
        type: 'text',
        title: '',
        notes: ''
      }
    ])
    setNextId(id => id + 1)
  }

  const removeDraft = (id: number) => {
    setDrafts(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev))
  }

  const fileAccept = (type: ResolutionType) => {
    if (type === 'image') return 'image/*'
    if (type === 'audio') return 'audio/*'
    if (type === 'video') return 'video/*'
    return undefined
  }

  const handleCompleteResolution = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      // Complete resolution/proof section
      const result = await completeSectionBlock(1, 'proof')
      
      console.log('[XP] Resolution section completion result:', result)
      
      if (result.success) {
        const xp = result.xpResult?.xpAwarded ?? 0
        if (xp > 0) {
          showXPNotification(xp, 'Resolution Complete!', { reasonCode: result.reasonCode })
        } else if (result.reasonCode === 'repeat_completion') {
          showXPNotification(0, '', { reasonCode: 'repeat_completion' })
        }
      }
      
      // Navigate to follow-through
      router.push('/chapter/1/follow-through')
    } catch (error) {
      console.error('[XP] Error completing resolution:', error)
      router.push('/chapter/1/follow-through')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-full bg-[var(--color-offwhite)] dark:bg-[#142A4A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header block (matches screenshot) */}
        <div className="relative rounded-3xl bg-gradient-to-r from-white to-[#fff3d9] dark:from-[#0f2038] dark:to-[#142A4A] border border-gray-200/70 dark:border-gray-700/70 px-6 sm:px-8 py-6 sm:py-8 mb-6 overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-charcoal)] dark:text-white mb-3">
              Resolution
            </h1>
            <p className="text-[var(--color-gray)] dark:text-gray-300 text-base sm:text-lg leading-relaxed">
              Show your real-life <span className="font-bold text-[var(--color-charcoal)] dark:text-white">comeback and progress</span> here!
              Log conversations, tiny risks you took, screenshots of progress, and more. Each example is proof that you&apos;re living what you&apos;re learning.
            </p>
          </div>

          {/* Right-side illustration (inline SVG so it always exists) */}
          <div className="hidden sm:block absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 opacity-95">
            <svg width="170" height="120" viewBox="0 0 170 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="78" y="18" width="78" height="92" rx="18" fill="#EAF6FF"/>
              <rect x="86" y="26" width="62" height="76" rx="14" fill="#FFFFFF"/>
              <rect x="92" y="38" width="50" height="6" rx="3" fill="#D8E7F4"/>
              <rect x="92" y="52" width="42" height="6" rx="3" fill="#D8E7F4"/>
              <rect x="92" y="66" width="48" height="6" rx="3" fill="#D8E7F4"/>
              <rect x="92" y="80" width="36" height="6" rx="3" fill="#D8E7F4"/>
              <path d="M67 88c8-18 22-27 41-27" stroke="#F7B418" strokeWidth="10" strokeLinecap="round"/>
              <path d="M58 95l19-10" stroke="#FF6A38" strokeWidth="10" strokeLinecap="round"/>
              <circle cx="63" cy="89" r="10" fill="#FFE6A6"/>
            </svg>
          </div>
        </div>

        {/* Main card (Ready to Log Your Comeback?) */}
        <div className="space-y-4">
          {drafts.map((item, idx) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
              {/* Card header strip */}
              <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#E8F4F8] to-[#F3F8FF] dark:from-[#173748] dark:to-[#142A4A] border-b border-gray-200/70 dark:border-gray-700/70 flex items-start gap-3">
                <div className="mt-0.5 w-9 h-9 rounded-xl bg-[#ffd93d]/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-[var(--color-charcoal)] dark:text-white leading-tight">
                    Ready to Log Your Comeback?
                  </h2>
                  <p className="text-sm text-[var(--color-gray)] dark:text-gray-300">
                    What proof do you want to show today?
                  </p>
                </div>
              </div>

              {/* Form body */}
              <div className="px-5 sm:px-6 py-5 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-1 gap-4">
                  {/* Title row with select */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#f7b418]/15 text-[#f7b418] flex items-center justify-center">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 20h9" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-charcoal)] dark:text-white">
                          Title
                        </span>
                      </div>

                      <select
                        value={item.type}
                        onChange={(e) => handleTypeChange(item.id, e.target.value as ResolutionType)}
                        className="text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-[var(--color-charcoal)] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f7b418]"
                      >
                        <option value="text">Text note</option>
                        <option value="image">Image</option>
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <input
                      value={item.title}
                      onChange={(e) => handleTitleChange(item.id, e.target.value)}
                      placeholder="e.g. Talked to my debate coach about my phone habits"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-[var(--color-charcoal)] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f7b418]"
                    />
                  </div>

                  {/* What happened */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-bold text-[var(--color-charcoal)] dark:text-white">
                        What Happened?
                      </span>
                      {drafts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDraft(item.id)}
                          className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-red-500 transition"
                          aria-label="Remove draft"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {item.type === 'text' ? (
                      <textarea
                        value={item.notes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        rows={4}
                        placeholder="Describe what you did, how it went, and what you learned"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-[var(--color-charcoal)] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f7b418] resize-none"
                      />
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept={fileAccept(item.type)}
                          onChange={(e) => handleFileChange(item.id, e.target.files)}
                          className="block w-full text-xs sm:text-sm text-gray-700 dark:text-gray-200 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#f7b418] file:text-[var(--color-charcoal)] hover:file:bg-[#e5a616] cursor-pointer"
                        />
                        <textarea
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          rows={3}
                          placeholder="Add a short note about what this shows"
                          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-[var(--color-charcoal)] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f7b418] resize-none"
                        />
                        {item.previewUrl && item.type === 'image' && (
                          <img
                            src={item.previewUrl}
                            alt={item.title || 'Uploaded image'}
                            className="max-h-64 rounded-xl border border-gray-200 dark:border-gray-700 object-contain bg-black/5"
                          />
                        )}
                        {item.previewUrl && item.type === 'audio' && (
                          <audio controls src={item.previewUrl} className="w-full" />
                        )}
                        {item.previewUrl && item.type === 'video' && (
                          <video controls src={item.previewUrl} className="w-full max-h-72 rounded-xl bg-black object-contain" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add Entry button row */}
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        // Keep the UI exactly like the screenshot: clicking Add Entry adds another blank proof card.
                        // (Saving to DB can come later.)
                        if (idx === drafts.length - 1) addDraft()
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f7b418] hover:bg-[#e5a616] text-[var(--color-charcoal)] font-black text-sm shadow-sm transition"
                    >
                      <span className="text-lg leading-none">+</span>
                      Add Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* + Add Another Proof (link-style like screenshot) */}
          <button
            type="button"
            onClick={addDraft}
            className="text-sm font-semibold text-[var(--color-charcoal)] dark:text-white hover:opacity-80 transition inline-flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Add Another Proof
          </button>

          {/* Need Inspiration card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#E8F4F8] to-[#F3F8FF] dark:from-[#173748] dark:to-[#142A4A] px-5 sm:px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffd93d]/25 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-[var(--color-charcoal)] dark:text-white mb-1">
                  Need Inspiration?
                </h3>
                <p className="text-sm text-[var(--color-gray)] dark:text-gray-300">
                  Replay a conversation, try a small challenge, or share your reflections! Everything adds up.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[var(--color-charcoal)] dark:text-white">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    Conversation Log
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[var(--color-charcoal)] dark:text-white">
                    <span className="text-sm">✉️</span>
                    Screenshot
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[var(--color-charcoal)] dark:text-white">
                    <span className="text-sm">✏️</span>
                    Start Small
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[var(--color-charcoal)] dark:text-white">
                    <span className="text-sm">🏳️</span>
                    Take a Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save & Continue Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleCompleteResolution}
              disabled={isProcessing}
              className="px-8 py-4 bg-[#673067] hover:bg-[#573057] text-white rounded-xl font-bold text-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Saving...' : 'Save & Continue to Follow-through →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
