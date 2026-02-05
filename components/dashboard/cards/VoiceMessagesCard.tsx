'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Card from '../ui/Card'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

type VoiceMessageRow = {
  id: string
  user_id: string
  storage_path: string
  content_type: string
  created_at: string
  duration_ms: number | null
  chat_id: string | null
}

type RecorderState = 'idle' | 'recording' | 'preview' | 'sending'

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

export default function VoiceMessagesCard() {
  const supabase = useMemo(() => createClient(), [])

  const [recState, setRecState] = useState<RecorderState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const [messages, setMessages] = useState<VoiceMessageRow[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewMimeType, setPreviewMimeType] = useState<string>('')
  const [previewDurationMs, setPreviewDurationMs] = useState<number | null>(null)

  const [playingId, setPlayingId] = useState<string | null>(null)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const startedAtRef = useRef<number>(0)

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true)
    setError(null)
    try {
      const { data, error: qErr } = await supabase
        .from('voice_messages')
        .select('id,user_id,storage_path,content_type,created_at,duration_ms,chat_id')
        .order('created_at', { ascending: false })
        .limit(25)

      if (qErr) throw qErr
      setMessages((data ?? []) as VoiceMessageRow[])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load voice messages')
    } finally {
      setLoadingMessages(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (playingUrl) URL.revokeObjectURL(playingUrl)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setInfo(null)

    if (recState === 'recording' || recState === 'sending') return
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone recording is not supported in this browser.')
      return
    }
    if (typeof MediaRecorder === 'undefined') {
      setError('MediaRecorder is not available in this browser.')
      return
    }

    // cleanup any old preview
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewBlob(null)
    setPreviewUrl(null)
    setPreviewMimeType('')
    setPreviewDurationMs(null)

    // stop any previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      startedAtRef.current = Date.now()

      const mimeType = pickBestMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const stoppedAt = Date.now()
        const duration = Math.max(0, stoppedAt - startedAtRef.current)
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'application/octet-stream' })

        const url = URL.createObjectURL(blob)
        setPreviewBlob(blob)
        setPreviewUrl(url)
        setPreviewMimeType(blob.type || recorder.mimeType || mimeType || '')
        setPreviewDurationMs(duration)
        setRecState('preview')

        // release mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }
      }

      recorderRef.current = recorder
      recorder.start()
      setRecState('recording')
      setInfo('Recording… click Stop when you’re done.')
    } catch (e: any) {
      setError(e?.message ?? 'Failed to start recording')
    }
  }, [previewUrl, recState])

  const stopRecording = useCallback(() => {
    setError(null)
    setInfo(null)
    if (recState !== 'recording') return
    try {
      // Stop mic immediately so the browser tab recording icon turns off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      recorderRef.current?.stop()
      recorderRef.current = null
      setRecState('idle') // will move to preview in onstop
    } catch (e: any) {
      setError(e?.message ?? 'Failed to stop recording')
    }
  }, [recState])

  const sendVoiceMessage = useCallback(async () => {
    if (!previewBlob) return
    if (recState === 'sending') return
    setRecState('sending')
    setError(null)
    setInfo(null)

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userData.user
      if (!user) throw new Error('You must be signed in to send voice messages.')

      const contentType = previewMimeType || previewBlob.type || 'application/octet-stream'
      const ext = extForMime(contentType)
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`

      const { data: upData, error: upErr } = await supabase.storage
        .from('voice-messages')
        .upload(filePath, previewBlob, {
          contentType,
          upsert: false,
        })
      if (upErr) throw upErr

      const { error: insErr } = await supabase.from('voice_messages').insert({
        user_id: user.id,
        storage_path: upData.path,
        content_type: contentType,
        duration_ms: previewDurationMs,
      })
      if (insErr) throw insErr

      setInfo('Voice message sent.')
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewBlob(null)
      setPreviewUrl(null)
      setPreviewMimeType('')
      setPreviewDurationMs(null)
      setRecState('idle')
      await fetchMessages()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send voice message')
      setRecState('preview')
    }
  }, [fetchMessages, previewBlob, previewDurationMs, previewMimeType, previewUrl, recState, supabase])

  const playMessage = useCallback(
    async (m: VoiceMessageRow) => {
      setError(null)
      setInfo(null)
      setPlayingId(m.id)
      try {
        const { data, error: urlErr } = await supabase.storage
          .from('voice-messages')
          .createSignedUrl(m.storage_path, 60)
        if (urlErr) throw urlErr

        setPlayingUrl(data.signedUrl)
      } catch (e: any) {
        setPlayingId(null)
        setPlayingUrl(null)
        setError(e?.message ?? 'Failed to load audio URL')
      }
    },
    [supabase]
  )

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 ring-1 ring-blue-300/30">
              <span className="text-2xl">🎙️</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Voice messages</h2>
              <p className="text-sm text-slate-500">Record, send, and play back audio.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recState !== 'recording' ? (
              <Button variant="calm" onClick={startRecording} disabled={recState === 'sending'}>
                Record
              </Button>
            ) : (
              <Button variant="danger" onClick={stopRecording}>
                Stop
              </Button>
            )}
          </div>
        </div>

        {(error || info) && (
          <div className={`mt-4 rounded-xl border p-4 ${error ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
            <div className={`text-sm font-semibold ${error ? 'text-red-800' : 'text-blue-800'}`}>{error ?? info}</div>
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-700">Preview</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl)
                    setPreviewBlob(null)
                    setPreviewUrl(null)
                    setPreviewMimeType('')
                    setPreviewDurationMs(null)
                    setRecState('idle')
                  }}
                  disabled={recState === 'sending'}
                >
                  Discard
                </Button>
                <Button variant="success" onClick={sendVoiceMessage} disabled={recState === 'sending'}>
                  {recState === 'sending' ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <audio controls src={previewUrl} className="w-full" />
              <div className="mt-2 text-xs text-slate-500">
                {previewMimeType ? <span className="mr-3">Type: {previewMimeType}</span> : null}
                {previewDurationMs != null ? <span>Duration: {Math.round(previewDurationMs / 100) / 10}s</span> : null}
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-800">Recent</div>
            <button
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              onClick={fetchMessages}
              disabled={loadingMessages}
            >
              {loadingMessages ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {messages.length === 0 && !loadingMessages ? (
              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60 text-sm text-slate-500">
                No voice messages yet.
              </div>
            ) : null}

            {messages.map(m => {
              const created = new Date(m.created_at)
              const isPlaying = playingId === m.id && !!playingUrl
              return (
                <div key={m.id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">
                        {created.toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {m.duration_ms != null ? `${Math.round(m.duration_ms / 100) / 10}s` : '—'} · {m.content_type}
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => playMessage(m)}>
                      Play
                    </Button>
                  </div>

                  {isPlaying ? (
                    <div className="mt-3">
                      <audio controls autoPlay src={playingUrl} className="w-full" />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

