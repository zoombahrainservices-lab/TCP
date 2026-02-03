'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type ResolutionType = 'text' | 'image' | 'audio' | 'video'

interface ResolutionEntry {
  id: number
  type: ResolutionType
  title: string
  content: string
  file?: File
  previewUrl?: string
}

export default function ResolutionPage() {
  const [entries, setEntries] = useState<ResolutionEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<ResolutionEntry>({
    id: 0,
    type: 'text',
    title: '',
    content: ''
  })
  const [nextId, setNextId] = useState(1)

  const handleAddEntry = () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      return // Don't add empty entries
    }

    setEntries(prev => [...prev, { ...currentEntry, id: nextId }])
    setNextId(prev => prev + 1)
    
    // Reset current entry
    setCurrentEntry({
      id: 0,
      type: 'text',
      title: '',
      content: ''
    })
  }

  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    
    const file = fileList[0]
    const previewUrl = URL.createObjectURL(file)
    
    setCurrentEntry(prev => ({ ...prev, file, previewUrl }))
  }

  const fileAccept = (type: ResolutionType) => {
    if (type === 'image') return 'image/*'
    if (type === 'audio') return 'audio/*'
    if (type === 'video') return 'video/*'
    return undefined
  }

  const inspirationBadges = [
    { icon: '💬', label: 'Conversation Log', color: 'bg-green-100 text-green-700 border-green-200' },
    { icon: '📸', label: 'Screenshot', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { icon: '✏️', label: 'Start Small', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { icon: '🏁', label: 'Take a Risk', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  ]

  return (
    <div className="min-h-full bg-[var(--color-offwhite)] dark:bg-[#142A4A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
        
        {/* Header with Illustration */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-charcoal)] dark:text-white mb-3">
              Resolution
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-gray)] dark:text-gray-300 leading-relaxed max-w-2xl">
              Show your real-life <span className="font-bold text-[var(--color-charcoal)] dark:text-white">comeback and progress</span> here!
              Log conversations, tiny risks you took, screenshots of progress, and more. Each example is proof that you&apos;re living what you&apos;re learning.
            </p>
          </div>
          
          {/* Illustration */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 relative flex-shrink-0">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Notebook/Checklist */}
              <rect x="40" y="30" width="120" height="140" rx="8" fill="#FFF8E7" stroke="#f7b418" strokeWidth="3"/>
              
              {/* Lines/Checkboxes */}
              <rect x="55" y="50" width="12" height="12" rx="2" fill="white" stroke="#f7b418" strokeWidth="2"/>
              <line x1="75" y1="56" x2="135" y2="56" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
              
              <rect x="55" y="75" width="12" height="12" rx="2" fill="#f7b418" stroke="#f7b418" strokeWidth="2"/>
              <path d="M58 81 L61 84 L64 78" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="75" y1="81" x2="135" y2="81" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
              
              <rect x="55" y="100" width="12" height="12" rx="2" fill="white" stroke="#f7b418" strokeWidth="2"/>
              <line x1="75" y1="106" x2="135" y2="106" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
              
              <rect x="55" y="125" width="12" height="12" rx="2" fill="#f7b418" stroke="#f7b418" strokeWidth="2"/>
              <path d="M58 131 L61 134 L64 128" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="75" y1="131" x2="135" y2="131" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Pencil */}
              <g transform="translate(140, 150) rotate(-45)">
                <rect x="0" y="0" width="8" height="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                <polygon points="0,40 8,40 4,48" fill="#78350f"/>
                <rect x="0" y="-4" width="8" height="4" fill="#fef3c7"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Ready to Log Your Comeback Card */}
        <div className="bg-[#E8F4F8] dark:bg-[#1a3a4a] rounded-2xl p-3 sm:p-4 border border-[#b8dce8] dark:border-[#2a4a5a] space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#ffd93d]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-xl">💡</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--color-charcoal)] dark:text-white mb-0.5">
                Ready to Log Your Comeback?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-gray)] dark:text-gray-300">
                What proof do you want to show today?
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-900/50 rounded-xl p-3 sm:p-4 space-y-3">
            {/* Title and Type Row */}
            <div className="flex items-start gap-2">
              <span className="text-base mt-1.5">⭐</span>
              <div className="flex-1 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-charcoal)] dark:text-white mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={currentEntry.title}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Talked to my debate coach about my phone habits"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--color-charcoal)] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f7b418]"
                  />
                </div>

                <div>
                  <select
                    value={currentEntry.type}
                    onChange={(e) => setCurrentEntry(prev => ({ 
                      ...prev, 
                      type: e.target.value as ResolutionType,
                      file: undefined,
                      previewUrl: undefined
                    }))}
                    className="w-full sm:w-auto px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--color-charcoal)] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f7b418]"
                  >
                    <option value="text">Text note</option>
                    <option value="image">Image / screenshot</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {currentEntry.type === 'text' ? (
              <div>
                <label className="block text-xs font-bold text-[var(--color-charcoal)] dark:text-white mb-1">
                  What Happened?
                </label>
                <textarea
                  value={currentEntry.content}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                  rows={2}
                  placeholder="Describe what you did, how it went, and what you learned"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--color-charcoal)] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f7b418] resize-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-charcoal)] dark:text-white mb-1">
                    Upload {currentEntry.type}
                  </label>
                  <input
                    type="file"
                    accept={fileAccept(currentEntry.type)}
                    onChange={(e) => handleFileChange(e.target.files)}
                    className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f7b418] file:text-[var(--color-charcoal)] hover:file:bg-[#e5a616] cursor-pointer"
                  />
                </div>
                
                {currentEntry.previewUrl && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Preview</p>
                    {currentEntry.type === 'image' && (
                      <img
                        src={currentEntry.previewUrl}
                        alt="Preview"
                        className="max-h-24 rounded border border-gray-200 dark:border-gray-700"
                      />
                    )}
                    {currentEntry.type === 'audio' && (
                      <audio controls src={currentEntry.previewUrl} className="w-full h-8" />
                    )}
                    {currentEntry.type === 'video' && (
                      <video controls src={currentEntry.previewUrl} className="w-full max-h-32 rounded bg-black" />
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--color-charcoal)] dark:text-white mb-1">
                    Notes / Context
                  </label>
                  <textarea
                    value={currentEntry.content}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                    rows={2}
                    placeholder="What are we looking at or listening to? Why does it matter?"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--color-charcoal)] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f7b418] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Add Entry Button */}
            <button
              onClick={handleAddEntry}
              disabled={!currentEntry.title.trim() || !currentEntry.content.trim()}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-xs transition ${
                currentEntry.title.trim() && currentEntry.content.trim()
                  ? 'bg-[#f7b418] hover:bg-[#e5a616] text-[var(--color-charcoal)]'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              + Add Entry
            </button>
          </div>
        </div>

        {/* Saved Entries */}
        {entries.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-charcoal)] dark:text-white">
              Your Proof ({entries.length})
            </h3>
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-bold text-[var(--color-charcoal)] dark:text-white">{entry.title}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-[#f7b418]/10 text-[#f7b418] font-semibold">
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-gray)] dark:text-gray-300">{entry.content}</p>
                  {entry.previewUrl && (
                    <div className="mt-3">
                      {entry.type === 'image' && (
                        <img src={entry.previewUrl} alt={entry.title} className="max-h-32 rounded" />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add Another Proof Link */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-[var(--color-charcoal)] dark:text-white font-semibold text-sm flex items-center gap-2 hover:text-[#f7b418] transition"
        >
          <span className="text-lg">+</span> Add Another Proof
        </button>

        {/* Need Inspiration Section */}
        <div className="bg-[#E8F4F8] dark:bg-[#1a3a4a] rounded-2xl p-3 sm:p-4 border border-[#b8dce8] dark:border-[#2a4a5a] space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#ffd93d]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-charcoal)] dark:text-white mb-0.5">
                Need Inspiration?
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-gray)] dark:text-gray-300 mb-2">
                Replay a conversation, try a small challenge, or share your reflections! Everything adds up.
              </p>
              
              <div className="flex flex-wrap gap-1.5">
                {inspirationBadges.map((badge) => (
                  <button
                    key={badge.label}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition hover:scale-105 ${badge.color}`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
