'use client'

import { useState } from 'react'
import { saveYourTurnResponse } from '@/app/actions/yourTurn'
import type { YourTurnResponseItem } from '@/app/actions/yourTurn'

type Props = {
  chapterId: number
  promptKey: string
  promptText: string
  /** Single saved response for this Your Turn (one per prompt). */
  initialResponse?: YourTurnResponseItem | null
  onResponseSubmitted?: () => void
  autoFocus?: boolean
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  } catch {
    return iso
  }
}

export function YourTurnInput({
  chapterId,
  promptKey,
  promptText,
  initialResponse = null,
  onResponseSubmitted,
  autoFocus = false
}: Props) {
  const [text, setText] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setSaveStatus('saving')
    try {
      await saveYourTurnResponse(chapterId, promptKey, trimmed, promptText)
      setText('')
      setSaveStatus('saved')
      onResponseSubmitted?.()
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
    }
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-700">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">✏️</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2">
            Your Turn
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            {promptText}
          </p>

          {/* Single saved response for this Your Turn */}
          {initialResponse && (
            <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-gray-800/80 p-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">
                Your response
              </p>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">
                {initialResponse.responseText}
              </p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {formatDate(initialResponse.submittedAt)}
              </p>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your response and click Submit..."
            rows={4}
            autoFocus={autoFocus}
            className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-amber-700 dark:text-amber-300">
              {text.length} characters
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveStatus === 'saving' || !text.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Submit'}
            </button>
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600 dark:text-green-400">✓ Saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-red-600 dark:text-red-400">Save failed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
