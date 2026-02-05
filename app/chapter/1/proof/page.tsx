'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeSectionBlock } from '@/app/actions/chapters'
import { showXPNotification } from '@/components/gamification/XPNotification'
import { createClient } from '@/lib/supabase/client'
import { saveIdentityResolutionForChapter1, type IdentityResolutionData } from '@/app/actions/identity'

type ResolutionType = 'text' | 'image' | 'audio' | 'video'

type ProofDraft = {
  id: number
  type: ResolutionType
  title: string
  notes: string
  file?: File
  previewUrl?: string
  durationMs?: number
}

function pickBestMimeType(): string | undefined {
  if (typeof window === 'undefined') return undefined
  if (typeof MediaRecorder === 'undefined') return undefined

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4', // Safari sometimes
  ]

  for (const t of candidates) {
    if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)) return t
  }
  return undefined
}

function extForMime(mimeType: string): string {
  const t = mimeType.toLowerCase()
  if (t.includes('webm')) return 'webm'
  if (t.includes('ogg')) return 'ogg'
  if (t.includes('mp4')) return 'm4a'
  return 'dat'
}

export default function ResolutionPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
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
  const [saveError, setSaveError] = useState<string | null>(null)

  const recordingDraftIdRef = useRef<number | null>(null)
  const [recordingDraftId, setRecordingDraftId] = useState<number | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const startedAtRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      // Cleanup object URLs + mic stream on unmount
      setDrafts(prev => {
        prev.forEach(d => {
          if (d.previewUrl && d.previewUrl.startsWith('blob:')) URL.revokeObjectURL(d.previewUrl)
        })
        return prev
      })
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTypeChange = (id: number, type: ResolutionType) => {
    setDrafts(prev =>
      prev.map(item =>
        item.id === id
          ? (() => {
              if (item.previewUrl && item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
              return { ...item, type, file: undefined, previewUrl: undefined, durationMs: undefined }
            })()
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
        item.id === id
          ? (() => {
              if (item.previewUrl && item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
              return { ...item, file, previewUrl, durationMs: undefined }
            })()
          : item
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

  const startAudioRecording = async (draftId: number) => {
    setSaveError(null)

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setSaveError('Microphone recording is not supported in this browser.')
      return
    }
    if (typeof MediaRecorder === 'undefined') {
      setSaveError('MediaRecorder is not available in this browser.')
      return
    }
    if (recordingDraftIdRef.current != null) return

    // Stop any previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      startedAtRef.current = Date.now()
      recordingDraftIdRef.current = draftId
      setRecordingDraftId(draftId)

      const mimeType = pickBestMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const stoppedAt = Date.now()
        const durationMs = Math.max(0, stoppedAt - startedAtRef.current)
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'application/octet-stream',
        })

        const blobUrl = URL.createObjectURL(blob)
        const contentType = blob.type || recorder.mimeType || mimeType || 'application/octet-stream'
        const ext = extForMime(contentType)
        const file = new File([blob], `recording-${Date.now()}.${ext}`, { type: contentType })

        const targetId = recordingDraftIdRef.current
        recordingDraftIdRef.current = null
        setRecordingDraftId(null)
        recorderRef.current = null

        // Release mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }

        if (targetId == null) return

        setDrafts(prev =>
          prev.map(item => {
            if (item.id !== targetId) return item
            if (item.previewUrl && item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
            return { ...item, file, previewUrl: blobUrl, durationMs }
          })
        )
      }

      recorder.start()
    } catch (error: any) {
      recordingDraftIdRef.current = null
      setRecordingDraftId(null)
      setSaveError(error?.message ?? 'Could not start microphone recording.')
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }

  const stopAudioRecording = () => {
    setSaveError(null)
    try {
      // Stop mic immediately so the browser tab recording icon turns off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      recorderRef.current?.stop()
    } catch (error: any) {
      setSaveError(error?.message ?? 'Could not stop recording.')
      recordingDraftIdRef.current = null
      setRecordingDraftId(null)
      recorderRef.current = null
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }

  const handleCompleteResolution = async () => {
    if (isProcessing) return
    if (recordingDraftIdRef.current != null) {
      setSaveError('Stop recording before saving.')
      return
    }
    
    setIsProcessing(true)
    setSaveError(null)
    try {
      // Save identity resolution (chapter 1) using the first text proof, if present
      const firstTextDraft = drafts.find(d => d.type === 'text' && d.notes.trim().length > 0)
      if (firstTextDraft) {
        const identityPayload: IdentityResolutionData = {
          identity: firstTextDraft.notes.trim(),
          value1: '',
          value2: '',
          value3: '',
          commitment: '',
          daily1: '',
          daily2: '',
          daily3: '',
          noLonger: '',
          why: '',
        }
        try {
          await saveIdentityResolutionForChapter1(identityPayload)
        } catch (err) {
          console.error('[Identity] Failed to save identityResolution:', err)
          // Don’t block the rest of the resolution flow if this fails
        }
      }

      // Save audio proofs as artifacts (optional; does not block XP if none)
      const audioDrafts = drafts.filter(d => d.type === 'audio' && d.file)
      if (audioDrafts.length > 0) {
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        const user = userData.user
        if (!user) throw new Error('You must be signed in to save audio proof.')

        for (const d of audioDrafts) {
          const file = d.file!
          const contentType = file.type || 'application/octet-stream'
          const ext = extForMime(contentType)
          const storagePath = `${user.id}/proof-${crypto.randomUUID()}.${ext}`

          const { data: upData, error: upErr } = await supabase.storage
            .from('voice-messages')
            .upload(storagePath, file, { contentType, upsert: false })
          if (upErr) throw upErr

          const artifactPayload = {
            user_id: user.id,
            chapter_id: 1,
            type: 'proof',
            data: {
              resolutionType: 'audio',
              title: d.title,
              notes: d.notes,
              durationMs: d.durationMs ?? null,
              storage: {
                bucket: 'voice-messages',
                path: upData.path,
              },
              contentType,
            },
          }

          const { error: artErr } = await supabase.from('artifacts').insert(artifactPayload)
          if (artErr) throw artErr
        }
      }

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
      // If the error is from saving proof, keep the user here to retry.
      const msg = (error as any)?.message ?? 'Failed to save your proof. Please try again.'
      setSaveError(msg)
      setIsProcessing(false)
      return
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-full bg-[var(--color-offwhite)] dark:bg-[#142A4A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page heading */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-charcoal)] dark:text-white">
            Resolution
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-300">
            Show your real-life comeback and progress here. Use the identity example below, then log your proof.
          </p>
        </div>

          {/* Identity + proof UI */}
        <div className="space-y-6">
          {saveError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 sm:px-6 py-4 text-sm font-semibold text-red-800">
              {saveError}
            </div>
          )}

          {/* 1st card: Identity (heading: identityResolution) */}
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md overflow-hidden">
            <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-[#E8F4F8] to-[#F3F8FF] dark:from-[#173748] dark:to-[#142A4A] border-b border-gray-200/70 dark:border-gray-700/70 flex items-start gap-3">
              <div className="mt-0.5 w-10 h-10 rounded-xl bg-[#34d399]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌱</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-[var(--color-charcoal)] dark:text-white leading-tight mb-1">
                  identityResolution
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-300">
                  This is your anchor statement for Chapter 1. Use it as inspiration for one of your proof entries
                  below.
                </p>
                <div className="mt-3 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-amber-100/80 dark:border-amber-500/40 px-4 py-3 shadow-sm">
                  <p className="text-sm sm:text-base text-[var(--color-charcoal)] dark:text-gray-100">
                    <span className="font-bold">Example:&nbsp;</span>
                    <span className="font-semibold">
                      My focus is [MY GOAL] and I&apos;m committed to achieving it. I take responsibility for my progress
                      by doing [SPECIFIC ACTION] consistently. I&apos;m removing [DISTRACTIONS / EXCUSES] and staying
                      disciplined. I know results come from effort. I feel [DETERMINED / FOCUSED] moving forward.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* 2nd card: Write your response */}
          {drafts.map((item, idx) => (
            <div key={item.id} className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
              {/* Card header strip */}
              <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-[#FFFDF5] via-[#FFF8E7] to-[#FFEED0] dark:from-[#2A2416] dark:via-[#2A2416] dark:to-[#3A301A] border-b border-amber-100/70 dark:border-amber-500/40 flex items-start gap-3">
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-[#ffd93d]/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--color-charcoal)] dark:text-white leading-tight">
                    Write your response here.
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--color-gray)] dark:text-gray-300">
                    Use this space to write what your identity actually looks like in real life.
                  </p>
                </div>
              </div>

              {/* Form body */}
              <div className="px-6 sm:px-8 py-7 bg-[#FFFDF5] dark:bg-[#2A2416]">
                <div className="grid grid-cols-1 gap-5">
                  {/* Proof field */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-bold text-[var(--color-charcoal)] dark:text-white">
                        Proof
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
                        placeholder="Write your identity statement here"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-[var(--color-charcoal)] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f7b418] resize-none"
                      />
                    ) : (
                      <div className="space-y-3">
                        {item.type === 'audio' && (
                          <div className="flex flex-wrap items-center gap-2">
                            {recordingDraftId === item.id ? (
                              <button
                                type="button"
                                onClick={stopAudioRecording}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-sm transition"
                              >
                                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                                Stop recording
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startAudioRecording(item.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0073ba] hover:bg-[#0567a5] text-white font-black text-sm shadow-sm transition"
                              >
                                <span className="text-lg leading-none">🎙️</span>
                                Record audio
                              </button>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              or upload an audio file below
                            </span>
                          </div>
                        )}
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
                          placeholder="Add a short note about what this proof shows"
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
                          <div className="space-y-1">
                            <audio controls src={item.previewUrl} className="w-full" />
                            {item.durationMs != null && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Duration: {Math.round(item.durationMs / 100) / 10}s
                              </div>
                            )}
                          </div>
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

          {/* Save & Continue Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleCompleteResolution}
              disabled={isProcessing || recordingDraftId != null}
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
