'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Type,
  Image as ImageIcon,
  List,
  Quote,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Zap,
  Sprout,
  Lightbulb,
  Check,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import BlockRenderer from '@/components/content/BlockRenderer'
import ImageUploadField from '@/components/admin/ImageUploadField'
import RichTextEditor from '@/components/admin/RichTextEditor'

interface ContentEditorProps {
  content: any[]
  onChange: (content: any[]) => void
  chapterSlug?: string
  stepSlug?: string
  pageOrder?: number
}

export default function ContentEditor({ 
  content, 
  onChange, 
  chapterSlug = 'general',
  stepSlug = 'content',
  pageOrder = 0,
}: ContentEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<any>(null)
  
  // Create a ref to hold the save function so we can call it from event listener
  const saveBlockEditRef = useRef<(() => void) | null>(null);

  const DEFAULT_SCALE_SCORE_BANDS = [
    { range: '25+', label: "You're a strong analytical thinker", explanation: 'CLARITY will help you actually be heard.', color: '#ef4444' },
    { range: '18-24', label: 'You naturally spot problems', explanation: 'Work on delivery and timing.', color: '#f59e0b' },
    { range: '10-17', label: 'Critique', explanation: 'You balance critique with appreciation fairly well.', color: '#0073ba' },
    { range: '1-9', label: 'Building Confidence', explanation: 'You may need to speak up more about the issues you notice.', color: '#22c55e' },
  ]
  const [showBlockPalette, setShowBlockPalette] = useState(false)

  const blockTypes = [
    { type: 'heading', icon: Type, label: 'Heading' },
    { type: 'paragraph', icon: Edit2, label: 'Paragraph' },
    { type: 'story', icon: Edit2, label: 'Story Text' },
    { type: 'inline_image', icon: ImageIcon, label: 'Inline Image' },
    { type: 'list', icon: List, label: 'List' },
    { type: 'quote', icon: Quote, label: 'Quote' },
    { type: 'callout', icon: AlertCircle, label: 'Callout' },
    { type: 'checklist', icon: List, label: 'Checklist' },
    { type: 'prompt', icon: Edit2, label: 'Input Prompt' },
    { type: 'mcq', icon: List, label: 'Multiple Choice (MCQ)' },
    { type: 'framework_intro', icon: Zap, label: 'Framework Intro' },
    { type: 'identity_resolution_guidance', icon: Sprout, label: 'Resolution: Identity Guidance' },
    { type: 'resolution_proof', icon: Lightbulb, label: 'Resolution: Proof' },
    { type: 'self_check_intro', icon: Lightbulb, label: 'Self-Check Intro' },
    { type: 'self_check_result', icon: Check, label: 'Self-Check Result' },
  ]

  const handleAddBlock = (type: string) => {
    let newBlock: any = { type }
    
    switch (type) {
      case 'heading':
        newBlock = { type: 'heading', level: 2, text: 'New Heading' }
        break
      case 'paragraph':
        newBlock = { type: 'paragraph', text: 'New paragraph text...' }
        break
      case 'story':
        newBlock = { type: 'story', text: 'Story content...\nAdd dialogue with quotes for indentation.' }
        break
      case 'inline_image':
        newBlock = { type: 'inline_image', src: '', alt: '', caption: '' }
        break
      case 'list':
        newBlock = { type: 'list', style: 'bullets', items: ['Item 1', 'Item 2'] }
        break
      case 'quote':
        newBlock = { type: 'quote', text: 'Quote text...', author: '' }
        break
      case 'callout':
        newBlock = { type: 'callout', variant: 'tip', title: 'Tip', text: 'Callout text...' }
        break
      case 'checklist':
        newBlock = {
          type: 'checklist',
          id: `checklist_${Date.now()}`,
          title: 'Your Checklist',
          items: [
            { id: 'item_1', text: 'First action item' },
            { id: 'item_2', text: 'Second action item' },
          ],
          appearance: {
            itemBgColor: '#f7e6ef',
            checkboxColor: '#cc2e6f',
          },
        }
        break
      case 'prompt':
        newBlock = { 
          type: 'prompt', 
          id: `prompt_${Date.now()}`, 
          label: 'Your question here', 
          description: '',
          input: 'textarea', 
          placeholder: 'Enter your response...',
          required: false
        }
        break
      case 'mcq':
        newBlock = { 
          type: 'mcq', 
          id: `mcq_${Date.now()}`, 
          title: 'Multiple Choice Assessment',
          description: '',
          questions: [
            {
              id: 'q1',
              text: 'Question 1',
              options: [
                { id: 'a', text: 'Option A' },
                { id: 'b', text: 'Option B' },
                { id: 'c', text: 'Option C' },
                { id: 'd', text: 'Option D' }
              ],
              correctOptionId: ''
            }
          ],
          scoring: {
            showResults: false,
            bands: []
          }
        }
        break
      case 'framework_intro':
        newBlock = {
          type: 'framework_intro',
          frameworkCode: 'SPARK',
          title: 'Framework Title',
          description: 'Framework description',
          letters: [
            { letter: 'S', meaning: 'Surface the Pattern' },
            { letter: 'P', meaning: 'Pinpoint the Why' },
            { letter: 'A', meaning: 'Anchor to Identity' },
            { letter: 'R', meaning: 'Rebuild with Micro-Commitments' },
            { letter: 'K', meaning: 'Kindle Community' }
          ],
          accentColor: '#f7b418'
        }
        break
      case 'identity_resolution_guidance':
        newBlock = {
          type: 'identity_resolution_guidance',
          title: 'identityResolution',
          subtitle: 'This is your anchor statement. Use it as inspiration for one of your proof entries below.',
          exampleText: 'Example: My focus is [MY GOAL] and I\'m committed to achieving it. I take responsibility for my progress by doing [SPECIFIC ACTION] consistently.'
        }
        break
      case 'resolution_proof':
        newBlock = {
          type: 'resolution_proof',
          id: `resolution_proof_${Date.now()}`,
          title: 'Write your response here.',
          subtitle: 'Use this space to write what your identity actually looks like in real life.',
          label: 'Proof',
          placeholder: 'Write your identity statement here'
        }
        break
      case 'self_check_intro':
        newBlock = {
          type: 'self_check_intro',
          title: 'Self-Check',
          subtitle: 'Take a quick snapshot of where you are in this chapter.',
          body1:
            'This check is just for you. Answer based on how things feel right now, not how you wish they were.',
          body2:
            "It\'s not a test or a grade. It\'s a baseline for this chapter so you can see your progress as you move through the lessons.",
          highlightTitle: "You'll rate 5 statements from 1 to 7.",
          highlightBody:
            "Takes about a minute. Your score shows which zone you\'re in and what to focus on next.",
        }
        break
      case 'self_check_result':
        newBlock = {
          type: 'self_check_result',
          assessmentType: 'scale',
          title: 'Self-Check Results',
          subtitle: 'This is your starting point for this chapter—not your ending point.',
          scoreBandsTitle: 'Score Bands Explained',
          scoreBands: DEFAULT_SCALE_SCORE_BANDS,
          buttonText: 'Continue to Framework →',
        }
        break
    }
    
    onChange([...content, newBlock])
    setShowBlockPalette(false)
  }

  const handleEditBlock = (index: number) => {
    setEditingIndex(index)
    const base = { ...content[index] }

    // If this is a self-check result block and it has no saved bands yet,
    // initialize with the 4 default bands so the admin can edit them directly.
    if (base?.type === 'self_check_result') {
      const existingBands = Array.isArray(base.scoreBands) ? base.scoreBands : []
      if (existingBands.length === 0) {
        base.assessmentType = base.assessmentType || 'scale'
        base.scoreBandsTitle = base.scoreBandsTitle || 'Score Bands Explained'
        base.scoreBands = DEFAULT_SCALE_SCORE_BANDS
        base.buttonText = base.buttonText || 'Continue to Framework →'
      }
    }

    setEditingData(base)
  }

  const normalizeBlock = (block: any) => {
    let dataToSave = block

    // Normalize scale_questions so block always has valid scale and question ids
    if (block?.type === 'scale_questions') {
      const questions = Array.isArray(block.questions) ? block.questions : []
      const usedQuestionIds = new Set<string>()
      dataToSave = {
        ...block,
        id: (block.id && String(block.id).trim()) ? block.id : 'scale_questions',
        ...(block.questionNumbering && { questionNumbering: block.questionNumbering }),
        scale: block.scale && typeof block.scale === 'object' ? {
          min: typeof block.scale.min === 'number' ? block.scale.min : 1,
          max: typeof block.scale.max === 'number' ? block.scale.max : 5,
          minLabel: String(block.scale.minLabel ?? 'Not at all'),
          maxLabel: String(block.scale.maxLabel ?? 'Completely'),
        } : { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Completely' },
        questions: questions.map((q: any, i: number) => {
          const baseId = (q?.id && String(q.id).trim()) ? String(q.id).trim() : `q${i + 1}`
          let id = baseId
          let suffix = 2
          while (usedQuestionIds.has(id)) {
            id = `${baseId}_${suffix}`
            suffix += 1
          }
          usedQuestionIds.add(id)
          return {
            id,
            text: (q?.text != null) ? String(q.text) : 'Question',
            ...(typeof q?.number === 'number' && { number: q.number }),
          }
        }),
      }
    }

    if (block?.type === 'yes_no_check') {
      const statements = Array.isArray(block.statements) ? block.statements : []
      const usedIds = new Set<string>()
      dataToSave = {
        ...block,
        id: (block.id && String(block.id).trim()) ? block.id : `yes_no_${Date.now()}`,
        ...(block.title && { title: block.title }),
        statements: statements.map((s: any, i: number) => {
          const baseId =
            s?.id && String(s.id).trim()
              ? String(s.id).trim()
              : `s${i + 1}`
          let safeId = baseId
          let suffix = 2
          while (usedIds.has(safeId)) {
            safeId = `${baseId}_${suffix}`
            suffix += 1
          }
          usedIds.add(safeId)
          return {
            id: safeId,
            text: String(s?.text ?? ''),
          }
        }),
        ...(block.scoring && typeof block.scoring === 'object' && { scoring: block.scoring }),
      }
    }

    // Normalize MCQ so block always has valid question and option ids
    if (block?.type === 'mcq') {
      const questions = Array.isArray(block.questions) ? block.questions : []
      dataToSave = {
        ...block,
        id: (block.id && String(block.id).trim()) ? block.id : 'mcq',
        ...(block.title && { title: block.title }),
        ...(block.description && { description: block.description }),
        questions: questions.map((q: any, i: number) => ({
          id: (q?.id && String(q.id).trim()) ? q.id : `q${i}`,
          text: (q?.text != null) ? String(q.text) : 'Question',
          options: Array.isArray(q?.options) ? q.options.map((opt: any, j: number) => ({
            id: (opt?.id && String(opt.id).trim()) ? opt.id : `opt${j}`,
            text: (opt?.text != null) ? String(opt.text) : `Option ${j + 1}`,
          })) : [],
          ...(q?.correctOptionId && String(q.correctOptionId).trim() && { correctOptionId: String(q.correctOptionId).trim() }),
        })),
        ...(block.scoring && typeof block.scoring === 'object' && { scoring: block.scoring }),
      }
    }

    if (block?.type === 'checklist') {
      const items = Array.isArray(block.items) ? block.items : []
      dataToSave = {
        ...block,
        id: (block.id && String(block.id).trim()) ? block.id : `checklist_${Date.now()}`,
        items: items.map((item: any, i: number) => ({
          id: (item?.id && String(item.id).trim()) ? item.id : `item_${i + 1}`,
          text: String(item?.text ?? ''),
          ...(item?.checked !== undefined && { checked: Boolean(item.checked) }),
        })),
      }
    }

    return dataToSave
  }

  // Save edited block data back to content array
  const handleSaveBlockEdit = useCallback(() => {
    if (editingIndex === null || !editingData) {
      return;
    }
    
    const newContent = [...content]
    const normalizedBlock = normalizeBlock(editingData);
    newContent[editingIndex] = normalizedBlock;
    
    onChange(newContent)
    
    setEditingIndex(null)
    setEditingData(null)
  }, [content, editingIndex, editingData, onChange, normalizeBlock])
  
  // Store the save function in ref so event listener can access it
  useEffect(() => {
    saveBlockEditRef.current = handleSaveBlockEdit;
  }, [handleSaveBlockEdit]);
  
  // Listen for force-save events from parent
  useEffect(() => {
    const handleForceSave = (event: Event) => {
      const customEvent = event as CustomEvent<{ onSaved?: (latestContent: any[]) => void }>
      const onSaved = customEvent.detail?.onSaved

      if (editingIndex !== null && editingData) {
        const newContent = [...content]
        const normalizedBlock = normalizeBlock(editingData)
        newContent[editingIndex] = normalizedBlock

        onChange(newContent)
        setEditingIndex(null)
        setEditingData(null)

        onSaved?.(newContent)
        return
      }

      onSaved?.(content)
    };
    
    window.addEventListener('force-save-content-editor', handleForceSave);
    return () => window.removeEventListener('force-save-content-editor', handleForceSave);
  }, [content, editingData, editingIndex, normalizeBlock, onChange]);

  const handleDeleteBlock = (index: number) => {
    if (confirm('Delete this block?')) {
      onChange(content.filter((_, i) => i !== index))
    }
  }

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= content.length) return
    
    const newContent = [...content]
    const temp = newContent[index]
    newContent[index] = newContent[newIndex]
    newContent[newIndex] = temp
    onChange(newContent)
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Sidebar: Hero Image + Block Palette */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Hero Image Section - Compact */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto max-h-[50vh]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Hero Image</h3>
          
          {/* Show first image block preview if it exists */}
          {content && content.length > 0 && content[0]?.type === 'image' && content[0]?.src ? (
            <div className="mb-3">
              <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                <img
                  src={content[0].src}
                  alt={content[0].alt || "Hero image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                {/* Delete button */}
                <button
                  onClick={() => {
                    const newContent = content.filter((_, index) => index !== 0);
                    onChange(newContent);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove hero image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <ImageUploadField
                label="Change"
                value={content[0].src}
                onChange={(url) => {
                  const imageUrl = typeof url === 'string' ? url : url[0] || '';
                  if (imageUrl) {
                    const newContent = [...content];
                    newContent[0] = { ...newContent[0], src: imageUrl };
                    onChange(newContent);
                  }
                }}
                chapterSlug={chapterSlug}
                stepSlug={stepSlug}
                pageOrder={pageOrder}
                helperText=""
                hideCurrentPreview
              />
            </div>
          ) : (
            <div className="mb-3">
              <ImageUploadField
                label="Upload Hero Image"
                value=""
                onChange={(url) => {
                  const imageUrl = typeof url === 'string' ? url : url[0] || '';
                  if (imageUrl) {
                    const newContent = [...content];
                    newContent.unshift({
                      type: 'image',
                      src: imageUrl,
                      alt: 'Hero image',
                      caption: ''
                    });
                    onChange(newContent);
                  }
                }}
                chapterSlug={chapterSlug}
                stepSlug={stepSlug}
                pageOrder={pageOrder}
                helperText="Main left-side image"
              />
            </div>
          )}
        </div>

        {/* Block Palette */}
        <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Add Block</h3>
        <div className="space-y-2">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.type}
              onClick={() => handleAddBlock(blockType.type)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <blockType.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{blockType.label}</span>
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Right: Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No content blocks yet. Add a block from the left panel.
              </p>
            </div>
          ) : (
            content.map((block, index) => {
              // Hero image is only shown in left sidebar; do not show first image block in content list
              if (index === 0 && block?.type === 'image') return null;
              // page_meta holds title style; managed in Page Title Style section, do not show
              if (block?.type === 'page_meta') return null;
              return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium">
                    {block.type}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveBlock(index, 'down')}
                      disabled={index === content.length - 1}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditBlock(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(index)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                {editingIndex === index ? (
                  <div className="space-y-4">
                    {/* Block-specific fields */}
                    {block.type === 'heading' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Heading Level
                          </label>
                          <select
                            value={editingData?.level || 2}
                            onChange={(e) => setEditingData({ ...editingData, level: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value={1}>H1 - Main Title</option>
                            <option value={2}>H2 - Section</option>
                            <option value={3}>H3 - Subsection</option>
                            <option value={4}>H4 - Minor Heading</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Heading Text
                          </label>
                          <input
                            type="text"
                            value={editingData?.text || ''}
                            onChange={(e) => setEditingData({ ...editingData, text: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Enter heading text"
                          />
                        </div>
                      </>
                    )}
                    
                    {block.type === 'paragraph' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Paragraph Text
                        </label>
                        <RichTextEditor
                          content={editingData?.text || ''}
                          onChange={(html) => {
                            const updatedBlock = { ...editingData, text: html }
                            setEditingData(updatedBlock)
                            // Live-sync this block into the page content so the
                            // top-right Save button always has the latest text.
                            const newContent = [...content]
                            newContent[index] = updatedBlock
                            onChange(newContent)
                          }}
                          placeholder="Enter paragraph text..."
                          minHeight="150px"
                        />
                      </div>
                    )}

                    {block.type === 'story' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Story Text
                        </label>
                        <RichTextEditor
                          content={editingData?.text || ''}
                          onChange={(html) => {
                            const updatedBlock = { ...editingData, text: html }
                            setEditingData(updatedBlock)
                            // Live-sync this block into the page content so the
                            // top-right Save button always has the latest text.
                            const newContent = [...content]
                            newContent[index] = updatedBlock
                            onChange(newContent)
                          }}
                          placeholder="Enter story text..."
                          minHeight="250px"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          💡 Select any word or phrase to change its color, size, or style
                        </p>
                      </div>
                    )}
                    
                    {block.type === 'image' && (
                      <>
                        {/* Current Image Preview */}
                        {editingData?.src && editingData.src.trim() !== '' && (
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Current Hero Image
                            </label>
                            <div className="relative w-full max-w-md aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                              <img
                                src={editingData.src}
                                alt={editingData.alt || 'Preview'}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {editingData.src}
                            </p>
                          </div>
                        )}

                        <ImageUploadField
                          label={editingData?.src && editingData.src.trim() !== '' ? "Replace Hero Image" : "Add Hero Image"}
                          value={editingData?.src || ''}
                          onChange={(url) => setEditingData({ ...editingData, src: typeof url === 'string' ? url : url[0] || '' })}
                          helperText="Upload an image or select from gallery - will appear on left side"
                          chapterSlug={chapterSlug}
                          stepSlug={stepSlug}
                          pageOrder={pageOrder}
                        />
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Alt Text (for accessibility)
                          </label>
                          <input
                            type="text"
                            value={editingData?.alt || ''}
                            onChange={(e) => setEditingData({ ...editingData, alt: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Describe the image"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Caption (optional)
                          </label>
                          <input
                            type="text"
                            value={editingData?.caption || ''}
                            onChange={(e) => setEditingData({ ...editingData, caption: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Image caption"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'inline_image' && (
                      <>
                        {/* Preview when image is set */}
                        {editingData?.src && editingData.src.trim() !== '' && (
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Current Inline Image
                            </label>
                            <div className="relative w-full max-w-md aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                              <img
                                src={editingData.src}
                                alt={editingData.alt || 'Preview'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <ImageUploadField
                          label={editingData?.src && editingData.src.trim() !== '' ? "Change Image" : "Upload Image"}
                          value={editingData?.src || ''}
                          onChange={(url) => setEditingData({ ...editingData, src: typeof url === 'string' ? url : url[0] || '' })}
                          chapterSlug={chapterSlug}
                          stepSlug={stepSlug}
                          pageOrder={pageOrder}
                          helperText="Displays inline in the content (right side). Drag and drop or choose from gallery."
                          hideCurrentPreview
                        />
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Alt Text (for accessibility)
                          </label>
                          <input
                            type="text"
                            value={editingData?.alt || ''}
                            onChange={(e) => setEditingData({ ...editingData, alt: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Describe the image"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Caption (optional)
                          </label>
                          <input
                            type="text"
                            value={editingData?.caption || ''}
                            onChange={(e) => setEditingData({ ...editingData, caption: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Image caption"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'quote' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quote Text
                          </label>
                          <RichTextEditor
                            content={editingData?.text || ''}
                            onChange={(html) => {
                              const updatedBlock = { ...editingData, text: html }
                              setEditingData(updatedBlock)
                              const newContent = [...content]
                              newContent[index] = updatedBlock
                              onChange(newContent)
                            }}
                            placeholder="Quote text..."
                            minHeight="120px"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Author (optional)
                          </label>
                          <input
                            type="text"
                            value={editingData?.author || ''}
                            onChange={(e) => setEditingData({ ...editingData, author: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Author name"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Background Color
                            </label>
                            <input
                              type="color"
                              value={editingData?.bgColor || '#fef3c7'}
                              onChange={(e) => setEditingData({ ...editingData, bgColor: e.target.value })}
                              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Border Color
                            </label>
                            <input
                              type="color"
                              value={editingData?.borderColor || '#ff6a38'}
                              onChange={(e) => setEditingData({ ...editingData, borderColor: e.target.value })}
                              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Text Color
                            </label>
                            <input
                              type="color"
                              value={editingData?.color || '#2a2416'}
                              onChange={(e) => setEditingData({ ...editingData, color: e.target.value })}
                              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Text Size
                          </label>
                          <select
                            value={editingData?.fontSize || 'default'}
                            onChange={(e) => {
                              const value = e.target.value
                              const next = { ...editingData }
                              if (value === 'default') {
                                // Remove custom size so default style applies
                                delete next.fontSize
                              } else {
                                // Store semantic size key; QuoteBlock maps this to classes
                                next.fontSize = value
                              }
                              setEditingData(next)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                          >
                            <option value="default">Default</option>
                            <option value="small">Small</option>
                            <option value="xsmall">Extra small</option>
                            <option value="large">Large</option>
                          </select>
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            Use <span className="font-semibold">Extra small</span> if you want the quote text to be smaller than the normal size.
                          </p>
                        </div>
                      </>
                    )}

                    {block.type === 'list' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            List Style
                          </label>
                          <select
                            value={editingData?.style || 'bullets'}
                            onChange={(e) => setEditingData({ ...editingData, style: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="bullets">Bullets</option>
                            <option value="numbers">Numbers</option>
                            <option value="checks">Checkmarks</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            List Items (one per line)
                          </label>
                          <textarea
                            value={(editingData?.items || []).join('\n')}
                            onChange={(e) => setEditingData({ ...editingData, items: e.target.value.split('\n').filter(i => i.trim()) })}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                            placeholder="Item 1&#10;Item 2&#10;Item 3"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'callout' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Callout Type
                          </label>
                          <select
                            value={editingData?.variant || 'tip'}
                            onChange={(e) => setEditingData({ ...editingData, variant: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="tip">Tip (Green)</option>
                            <option value="science">Science (Blue)</option>
                            <option value="warning">Warning (Yellow)</option>
                            <option value="example">Example (Purple)</option>
                            <option value="truth">Truth (Orange)</option>
                            <option value="research">Research (Indigo)</option>
                            <option value="danger">Danger (Red)</option>
                            <option value="success">Success (Green)</option>
                            <option value="info">Info (Gray)</option>
                            <option value="custom">Custom (Color Picker)</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Background Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingData?.bgColor || '#f5f3ff'}
                                onChange={(e) => setEditingData({ ...editingData, bgColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                value={editingData?.bgColor || ''}
                                onChange={(e) => setEditingData({ ...editingData, bgColor: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-xs"
                                placeholder="#f5f3ff"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Border Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingData?.borderColor || '#8b5cf6'}
                                onChange={(e) => setEditingData({ ...editingData, borderColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                value={editingData?.borderColor || ''}
                                onChange={(e) => setEditingData({ ...editingData, borderColor: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-xs"
                                placeholder="#8b5cf6"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Text Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingData?.textColor || '#4c1d95'}
                                onChange={(e) => setEditingData({ ...editingData, textColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                value={editingData?.textColor || ''}
                                onChange={(e) => setEditingData({ ...editingData, textColor: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-xs"
                                placeholder="#4c1d95"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Icon Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingData?.iconColor || '#7c3aed'}
                                onChange={(e) => setEditingData({ ...editingData, iconColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                value={editingData?.iconColor || ''}
                                onChange={(e) => setEditingData({ ...editingData, iconColor: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-xs"
                                placeholder="#7c3aed"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setEditingData({
                                ...editingData,
                                variant: 'custom',
                                bgColor: '#f3e8ff',
                                borderColor: '#a855f7',
                                textColor: '#4c1d95',
                                iconColor: '#9333ea',
                              })
                            }
                          >
                            Quick Purple
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const { bgColor, borderColor, textColor, iconColor, ...rest } = editingData || {}
                              setEditingData(rest)
                            }}
                          >
                            Reset Custom Colors
                          </Button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Callout title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Text
                          </label>
                          <RichTextEditor
                            content={editingData?.text || ''}
                            onChange={(html) => {
                              const updatedBlock = { ...editingData, text: html }
                              setEditingData(updatedBlock)
                              const newContent = [...content]
                              newContent[index] = updatedBlock
                              onChange(newContent)
                            }}
                            placeholder="Callout text..."
                            minHeight="120px"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'checklist' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Checklist Title (optional)
                          </label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="YOUR COMMITMENT"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Checklist Items
                          </label>
                          <div className="space-y-2">
                            {(editingData?.items || []).map((item: any, itemIdx: number) => (
                              <div key={item.id || itemIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item?.text || ''}
                                  onChange={(e) => {
                                    const nextItems = [...(editingData?.items || [])]
                                    nextItems[itemIdx] = { ...item, text: e.target.value }
                                    setEditingData({ ...editingData, items: nextItems })
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                                  placeholder={`Item ${itemIdx + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextItems = (editingData?.items || []).filter((_: any, i: number) => i !== itemIdx)
                                    setEditingData({ ...editingData, items: nextItems })
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextItems = [
                                ...(editingData?.items || []),
                                {
                                  id: `item_${(editingData?.items?.length || 0) + 1}`,
                                  text: 'New checklist item',
                                },
                              ]
                              setEditingData({ ...editingData, items: nextItems })
                            }}
                            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-amber)] hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <Plus className="w-4 h-4" />
                            Add item
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Row Background
                            </label>
                            <input
                              type="color"
                              value={editingData?.appearance?.itemBgColor || '#f7e6ef'}
                              onChange={(e) => setEditingData({
                                ...editingData,
                                appearance: { ...(editingData?.appearance || {}), itemBgColor: e.target.value },
                              })}
                              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Checkbox Color
                            </label>
                            <input
                              type="color"
                              value={editingData?.appearance?.checkboxColor || '#cc2e6f'}
                              onChange={(e) => setEditingData({
                                ...editingData,
                                appearance: { ...(editingData?.appearance || {}), checkboxColor: e.target.value },
                              })}
                              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {block.type === 'scale_questions' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Block ID</label>
                          <input
                            type="text"
                            value={editingData?.id || ''}
                            onChange={(e) => setEditingData({ ...editingData, id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                            placeholder="e.g., self_assessment"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title (optional)</label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Self-Assessment"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                          <input
                            type="text"
                            value={editingData?.description || ''}
                            onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Rate yourself on the following..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Scale min</label>
                            <input
                              type="number"
                              value={editingData?.scale?.min ?? 1}
                              onChange={(e) => setEditingData({
                                ...editingData,
                                scale: { ...(editingData?.scale || { min: 1, max: 5, minLabel: '', maxLabel: '' }), min: parseInt(e.target.value) || 1 },
                              })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Scale max</label>
                            <input
                              type="number"
                              value={editingData?.scale?.max ?? 5}
                              onChange={(e) => setEditingData({
                                ...editingData,
                                scale: { ...(editingData?.scale || { min: 1, max: 5, minLabel: '', maxLabel: '' }), max: parseInt(e.target.value) || 5 },
                              })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Scale left label</label>
                          <input
                            type="text"
                            value={editingData?.scale?.minLabel ?? ''}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              scale: { ...(editingData?.scale || { min: 1, max: 5, minLabel: '', maxLabel: '' }), minLabel: e.target.value },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Not at all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Scale right label</label>
                          <input
                            type="text"
                            value={editingData?.scale?.maxLabel ?? ''}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              scale: { ...(editingData?.scale || { min: 1, max: 5, minLabel: '', maxLabel: '' }), maxLabel: e.target.value },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Completely"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Question numbering</label>
                          <select
                            value={editingData?.questionNumbering ?? 'auto'}
                            onChange={(e) => setEditingData({ ...editingData, questionNumbering: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="auto">Auto (1, 2, 3...)</option>
                            <option value="none">None (no number prefix)</option>
                            <option value="custom">Custom (set number per question, e.g. 11, 22)</option>
                          </select>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Auto avoids double numbering; use Custom for numbers like 11, 22.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Questions</label>
                          <div className="space-y-3">
                            {(editingData?.questions || []).map((q: any, qIdx: number) => (
                              <div key={qIdx} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                {editingData?.questionNumbering === 'custom' && (
                                  <input
                                    type="number"
                                    value={q.number ?? ''}
                                    onChange={(e) => {
                                      const newQuestions = [...(editingData?.questions || [])];
                                      const v = e.target.value;
                                      newQuestions[qIdx] = { ...q, number: v === '' ? undefined : parseInt(v, 10) };
                                      setEditingData({ ...editingData, questions: newQuestions });
                                    }}
                                    className="w-14 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                                    placeholder="11"
                                    title="Display number (e.g. 11, 22)"
                                  />
                                )}
                                <input
                                  type="text"
                                  value={q.text ?? ''}
                                  onChange={(e) => {
                                    const newQuestions = [...(editingData?.questions || [])];
                                    newQuestions[qIdx] = { ...q, text: e.target.value };
                                    setEditingData({ ...editingData, questions: newQuestions });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                                  placeholder="Question text"
                                />
                                <input
                                  type="text"
                                  value={q.id ?? ''}
                                  onChange={(e) => {
                                    const newQuestions = [...(editingData?.questions || [])];
                                    newQuestions[qIdx] = { ...q, id: e.target.value };
                                    setEditingData({ ...editingData, questions: newQuestions });
                                  }}
                                  className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-xs"
                                  placeholder="id"
                                  title="Question ID"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQuestions = (editingData?.questions || []).filter((_: any, i: number) => i !== qIdx);
                                    setEditingData({ ...editingData, questions: newQuestions });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0"
                                  title="Delete question"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = [...(editingData?.questions || []), { id: `q${(editingData?.questions?.length ?? 0)}`, text: 'New question' }];
                              setEditingData({ ...editingData, questions: newQuestions });
                            }}
                            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-amber)] hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <Plus className="w-4 h-4" />
                            Add question
                          </button>
                        </div>
                      </>
                    )}

                    {block.type === 'yes_no_check' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Block Title (optional)
                          </label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Baseline Assessment"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Yes/No Statements
                          </label>
                          <div className="space-y-2">
                            {(editingData?.statements || []).map((stmt: any, stmtIdx: number) => (
                              <div key={stmt.id || stmtIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={stmt?.text || ''}
                                  onChange={(e) => {
                                    const nextStatements = [...(editingData?.statements || [])]
                                    nextStatements[stmtIdx] = { ...stmt, text: e.target.value }
                                    setEditingData({ ...editingData, statements: nextStatements })
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                                  placeholder={`Statement ${stmtIdx + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatements = (editingData?.statements || []).filter((_: any, i: number) => i !== stmtIdx)
                                    setEditingData({ ...editingData, statements: nextStatements })
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Delete statement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatements = [
                                ...(editingData?.statements || []),
                                {
                                  id: `s${(editingData?.statements?.length || 0) + 1}`,
                                  text: 'New yes/no statement',
                                },
                              ]
                              setEditingData({ ...editingData, statements: nextStatements })
                            }}
                            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-amber)] hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <Plus className="w-4 h-4" />
                            Add statement
                          </button>
                        </div>
                      </>
                    )}

                    {block.type === 'mcq' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Block ID</label>
                          <input
                            type="text"
                            value={editingData?.id || ''}
                            onChange={(e) => setEditingData({ ...editingData, id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                            placeholder="e.g., quiz_assessment"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title (optional)</label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Knowledge Check"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                          <input
                            type="text"
                            value={editingData?.description || ''}
                            onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Answer each question to the best of your ability..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Questions</label>
                          <div className="space-y-4">
                            {(editingData?.questions || []).map((q: any, qIdx: number) => (
                              <div key={qIdx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3">
                                <div className="flex gap-2 items-start">
                                  <input
                                    type="text"
                                    value={q.text ?? ''}
                                    onChange={(e) => {
                                      const newQuestions = [...(editingData?.questions || [])];
                                      newQuestions[qIdx] = { ...q, text: e.target.value };
                                      setEditingData({ ...editingData, questions: newQuestions });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    placeholder="Question text"
                                  />
                                  <input
                                    type="text"
                                    value={q.id ?? ''}
                                    onChange={(e) => {
                                      const newQuestions = [...(editingData?.questions || [])];
                                      newQuestions[qIdx] = { ...q, id: e.target.value };
                                      setEditingData({ ...editingData, questions: newQuestions });
                                    }}
                                    className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-xs"
                                    placeholder="q1"
                                    title="Question ID"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQuestions = (editingData?.questions || []).filter((_: any, i: number) => i !== qIdx);
                                      setEditingData({ ...editingData, questions: newQuestions });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0"
                                    title="Delete question"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="pl-4 space-y-2">
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Options:</label>
                                  {(q.options || []).map((opt: any, optIdx: number) => (
                                    <div key={optIdx} className="flex gap-2 items-center">
                                      <input
                                        type="radio"
                                        name={`correct-${qIdx}`}
                                        checked={q.correctOptionId === opt.id}
                                        onChange={() => {
                                          const newQuestions = [...(editingData?.questions || [])];
                                          newQuestions[qIdx] = { ...q, correctOptionId: opt.id };
                                          setEditingData({ ...editingData, questions: newQuestions });
                                        }}
                                        className="w-4 h-4 text-green-600"
                                        title="Mark as correct answer"
                                      />
                                      <input
                                        type="text"
                                        value={opt.text ?? ''}
                                        onChange={(e) => {
                                          const newQuestions = [...(editingData?.questions || [])];
                                          const newOptions = [...(q.options || [])];
                                          newOptions[optIdx] = { ...opt, text: e.target.value };
                                          newQuestions[qIdx] = { ...q, options: newOptions };
                                          setEditingData({ ...editingData, questions: newQuestions });
                                        }}
                                        className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                        placeholder="Option text"
                                      />
                                      <input
                                        type="text"
                                        value={opt.id ?? ''}
                                        onChange={(e) => {
                                          const newQuestions = [...(editingData?.questions || [])];
                                          const newOptions = [...(q.options || [])];
                                          newOptions[optIdx] = { ...opt, id: e.target.value };
                                          newQuestions[qIdx] = { ...q, options: newOptions };
                                          setEditingData({ ...editingData, questions: newQuestions });
                                        }}
                                        className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 font-mono text-xs"
                                        placeholder="a"
                                        title="Option ID"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newQuestions = [...(editingData?.questions || [])];
                                          const newOptions = (q.options || []).filter((_: any, i: number) => i !== optIdx);
                                          newQuestions[qIdx] = { ...q, options: newOptions };
                                          setEditingData({ ...editingData, questions: newQuestions });
                                        }}
                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                        title="Delete option"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQuestions = [...(editingData?.questions || [])];
                                      const newOptions = [...(q.options || []), { id: `opt${(q.options?.length ?? 0)}`, text: 'New option' }];
                                      newQuestions[qIdx] = { ...q, options: newOptions };
                                      setEditingData({ ...editingData, questions: newQuestions });
                                    }}
                                    className="mt-1 flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add option
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQuestions = [...(editingData?.questions || [])];
                                      newQuestions[qIdx] = { ...q, correctOptionId: '' };
                                      setEditingData({ ...editingData, questions: newQuestions });
                                    }}
                                    className="ml-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                  >
                                    Clear correct answer
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = [...(editingData?.questions || []), { 
                                id: `q${(editingData?.questions?.length ?? 0) + 1}`, 
                                text: 'New question',
                                options: [
                                  { id: 'a', text: 'Option A' },
                                  { id: 'b', text: 'Option B' }
                                ]
                              }];
                              setEditingData({ ...editingData, questions: newQuestions });
                            }}
                            className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-amber)] hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <Plus className="w-4 h-4" />
                            Add question
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Scoring Options</label>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id="show-results"
                              checked={editingData?.scoring?.showResults || false}
                              onChange={(e) => setEditingData({ 
                                ...editingData, 
                                scoring: { 
                                  ...(editingData?.scoring || {}), 
                                  showResults: e.target.checked 
                                } 
                              })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="show-results" className="text-sm text-gray-700 dark:text-gray-300">
                              Show results after completion (for graded MCQs)
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            💡 Select the radio button next to an option to mark it as correct. Leave all unmarked for reflection/survey questions.
                          </p>
                        </div>
                      </>
                    )}

                    {block.type === 'prompt' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Prompt ID
                          </label>
                          <input
                            type="text"
                            value={editingData?.id || ''}
                            onChange={(e) => setEditingData({ ...editingData, id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                            placeholder="e.g., ch1_framework_situation"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Unique identifier for saving/loading responses
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Question/Label Text
                          </label>
                          <input
                            type="text"
                            value={editingData?.label || ''}
                            onChange={(e) => setEditingData({ ...editingData, label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="e.g., Describe your situation"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description (optional)
                          </label>
                          <textarea
                            value={editingData?.description || ''}
                            onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Additional helper text shown below the label"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Input Type
                          </label>
                          <select
                            value={editingData?.input || 'textarea'}
                            onChange={(e) => setEditingData({ ...editingData, input: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="text">Single-line Text</option>
                            <option value="textarea">Multi-line Textarea</option>
                            <option value="number">Number</option>
                            <option value="select">Dropdown Select</option>
                            <option value="multiselect">Multiple Choice</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Placeholder Text
                          </label>
                          <input
                            type="text"
                            value={editingData?.placeholder || ''}
                            onChange={(e) => setEditingData({ ...editingData, placeholder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="e.g., What challenge or opportunity are you facing?"
                          />
                        </div>
                        {(editingData?.input === 'select' || editingData?.input === 'multiselect') && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Options (one per line)
                            </label>
                            <textarea
                              value={(editingData?.options || []).join('\n')}
                              onChange={(e) => setEditingData({ ...editingData, options: e.target.value.split('\n').filter(i => i.trim()) })}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                          </div>
                        )}
                        {editingData?.input === 'number' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Unit (optional, e.g., "hours", "days")
                            </label>
                            <input
                              type="text"
                              value={editingData?.unit || ''}
                              onChange={(e) => setEditingData({ ...editingData, unit: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                              placeholder="hours"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="prompt-required"
                            checked={editingData?.required || false}
                            onChange={(e) => setEditingData({ ...editingData, required: e.target.checked })}
                            className="w-4 h-4 text-[var(--color-amber)] border-gray-300 rounded focus:ring-[var(--color-amber)]"
                          />
                          <label htmlFor="prompt-required" className="text-sm text-gray-700 dark:text-gray-300">
                            Required field
                          </label>
                        </div>
                      </>
                    )}

                    {block.type === 'framework_intro' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Framework Code
                          </label>
                          <input
                            type="text"
                            value={editingData?.frameworkCode || ''}
                            onChange={(e) => setEditingData({ ...editingData, frameworkCode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-bold text-2xl"
                            placeholder="e.g., SPARK, VOICE"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="e.g., The SPARK Framework"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editingData?.description || ''}
                            onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Brief description of the framework"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Accent Color
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={editingData?.accentColor || '#f7b418'}
                              onChange={(e) => setEditingData({ ...editingData, accentColor: e.target.value })}
                              className="w-20 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"
                              title="Pick accent color"
                            />
                            <input
                              type="text"
                              value={editingData?.accentColor || '#f7b418'}
                              onChange={(e) => setEditingData({ ...editingData, accentColor: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                              placeholder="#f7b418"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Default: #f7b418 (orange). This colors the heading and letter badges.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Letters & Meanings
                          </label>
                          <div className="space-y-3">
                            {(editingData?.letters || []).map((item: any, idx: number) => (
                              <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <input
                                  type="text"
                                  value={item.letter || ''}
                                  onChange={(e) => {
                                    const newLetters = [...(editingData?.letters || [])];
                                    newLetters[idx] = { ...item, letter: e.target.value };
                                    setEditingData({ ...editingData, letters: newLetters });
                                  }}
                                  className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center font-bold text-lg"
                                  placeholder="S"
                                  maxLength={1}
                                />
                                <input
                                  type="text"
                                  value={item.meaning || ''}
                                  onChange={(e) => {
                                    const newLetters = [...(editingData?.letters || [])];
                                    newLetters[idx] = { ...item, meaning: e.target.value };
                                    setEditingData({ ...editingData, letters: newLetters });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                  placeholder="Surface the Pattern"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newLetters = (editingData?.letters || []).filter((_: any, i: number) => i !== idx);
                                    setEditingData({ ...editingData, letters: newLetters });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newLetters = [...(editingData?.letters || []), { letter: '', meaning: '' }];
                              setEditingData({ ...editingData, letters: newLetters });
                            }}
                            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                            Add Letter
                          </button>
                        </div>
                      </>
                    )}

                    {block.type === 'identity_resolution_guidance' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="e.g., identityResolution"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={editingData?.subtitle || ''}
                            onChange={(e) => setEditingData({ ...editingData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="This is your anchor statement..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Example Text</label>
                          <textarea
                            value={editingData?.exampleText || ''}
                            onChange={(e) => setEditingData({ ...editingData, exampleText: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[120px]"
                            placeholder="Example: My focus is [MY GOAL]..."
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'resolution_proof' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Block ID (for saving responses)</label>
                          <input
                            type="text"
                            value={editingData?.id || ''}
                            onChange={(e) => setEditingData({ ...editingData, id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                            placeholder="resolution_proof"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Write your response here."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={editingData?.subtitle || ''}
                            onChange={(e) => setEditingData({ ...editingData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Use this space to write..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Label (e.g. Proof)</label>
                          <input
                            type="text"
                            value={editingData?.label || ''}
                            onChange={(e) => setEditingData({ ...editingData, label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Proof"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Placeholder</label>
                          <input
                            type="text"
                            value={editingData?.placeholder || ''}
                            onChange={(e) => setEditingData({ ...editingData, placeholder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Write your identity statement here"
                          />
                        </div>
                      </>
                    )}

                    {block.type === 'self_check_intro' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Intro Title
                          </label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => {
                              setEditingData({ ...editingData, title: e.target.value });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Self-Check"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Intro Subtitle
                          </label>
                          <input
                            type="text"
                            value={editingData?.subtitle || ''}
                            onChange={(e) => setEditingData({ ...editingData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Take a quick snapshot of where you are in this chapter."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Body Paragraph 1
                          </label>
                          <textarea
                            value={editingData?.body1 || ''}
                            onChange={(e) => setEditingData({ ...editingData, body1: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[80px] text-sm"
                            placeholder="This check is just for you..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Body Paragraph 2
                          </label>
                          <textarea
                            value={editingData?.body2 || ''}
                            onChange={(e) => setEditingData({ ...editingData, body2: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[80px] text-sm"
                            placeholder="It's not a test or a grade..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Highlight Title
                          </label>
                          <input
                            type="text"
                            value={editingData?.highlightTitle || ''}
                            onChange={(e) => setEditingData({ ...editingData, highlightTitle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                            placeholder="You'll rate 5 statements from 1 to 7."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Highlight Body
                          </label>
                          <textarea
                            value={editingData?.highlightBody || ''}
                            onChange={(e) => setEditingData({ ...editingData, highlightBody: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[60px] text-sm"
                            placeholder="Takes about a minute..."
                          />
                        </div>

                        {/* Questions Page Fields */}
                        <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Questions Page (During Assessment)
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Questions Page Title
                              </label>
                              <input
                                type="text"
                                value={editingData?.questionsTitle || ''}
                                onChange={(e) => setEditingData({ ...editingData, questionsTitle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                                placeholder="Chapter X Self-Check"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Questions Page Subtitle
                              </label>
                              <input
                                type="text"
                                value={editingData?.questionsSubtitle || ''}
                                onChange={(e) => setEditingData({ ...editingData, questionsSubtitle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                                placeholder="Rate each statement from 1 to 7. Be honest—only you see this."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Styling overrides */}
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Custom Styling (Optional - overrides global defaults)
                          </summary>
                          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Leave fields empty to use global defaults. Set values to override for this chapter only.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Title Color</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.titleColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), titleColor: e.target.value }
                                  })}
                                  placeholder="#111827"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Button BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.buttonBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), buttonBgColor: e.target.value }
                                  })}
                                  placeholder="#f7b418"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Highlight BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.highlightBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), highlightBgColor: e.target.value }
                                  })}
                                  placeholder="#fef3c7"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Body BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.bodyBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), bodyBgColor: e.target.value }
                                  })}
                                  placeholder="#ffffff"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                            </div>
                          </div>
                        </details>

                        {/* Live preview of the intro layout so admin can see mapping */}
                        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-[#eef5ff] dark:bg-[#0b1930] p-6">
                          <h1 className="text-2xl font-black text-[#111827] dark:text-white mb-1">
                            {editingData?.title || 'Self-Check'}
                          </h1>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {editingData?.subtitle || 'Take a quick snapshot of where you are in this chapter.'}
                          </p>

                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4 max-w-2xl">
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                              {editingData?.body1 ||
                                'This check is just for you. Answer based on how things feel right now, not how you wish they were.'}
                            </p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                              {editingData?.body2 ||
                                "It\'s not a test or a grade. It\'s a baseline for this chapter so you can see your progress as you move through the lessons."}
                            </p>

                            <div className="bg-[#fef3c7] dark:bg-[#78350f]/30 p-4 rounded-xl border border-[#facc15]/40">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                {editingData?.highlightTitle || "You'll rate N statements from 1 to 7."}
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-200">
                                {editingData?.highlightBody ||
                                  'Takes about a minute. Your score shows which zone you\'re in and what to focus on next.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {block.type === 'self_check_result' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Results Title
                          </label>
                          <input
                            type="text"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Self-Check Results"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Results Subtitle
                          </label>
                          <input
                            type="text"
                            value={editingData?.subtitle || ''}
                            onChange={(e) => setEditingData({ ...editingData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="This is your starting point for this chapter—not your ending point."
                          />
                        </div>

                        {/* Assessment Type Selector */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Assessment Type
                          </label>
                          <select
                            value={editingData?.assessmentType || 'scale'}
                            onChange={(e) => setEditingData({ ...editingData, assessmentType: e.target.value as 'scale' | 'yes_no' | 'mcq' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="scale">Scale Assessment (1-7 Rating)</option>
                            <option value="yes_no">Yes/No Assessment</option>
                            <option value="mcq">MCQ Assessment</option>
                          </select>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Different assessment types can have different score bands and explanations
                          </p>
                        </div>

                        {/* Score Display Format Section */}
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Score Display Customization
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                            Customize how the score appears to users. Examples:
                            <br />• Scale: "5 <strong>out of 35</strong>" + "<strong>Low anxiety</strong>"
                            <br />• Yes/No: "2 <strong>Yes</strong>, 3 <strong>No</strong>" + "<strong>Mixed results</strong>"
                            <br />• MCQ: "7 <strong>correct</strong>" + "<strong>Good job!</strong>"
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Score Subtext (appears below the score number)
                              </label>
                              <input
                                type="text"
                                value={editingData?.scoreDisplayFormat?.scoreSubtext || ''}
                                onChange={(e) => setEditingData({
                                  ...editingData,
                                  scoreDisplayFormat: {
                                    ...(editingData?.scoreDisplayFormat || {}),
                                    scoreSubtext: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                placeholder="out of 35"
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Scale: "out of 35" | Yes/No: "Yes, 3 No" (dynamic) | MCQ: "correct"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Score Bands Section */}
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Score Bands (Ranges & Explanations)
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const bands = editingData?.scoreBands || [];
                                setEditingData({
                                  ...editingData,
                                  scoreBands: [...bands, { range: '', label: '', explanation: '', color: '#0073ba' }]
                                });
                              }}
                            >
                              + Add Band
                            </Button>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            {(editingData?.scoreBands || []).length === 0 
                              ? 'No score bands yet. Click "+ Add Band" to create your first one.'
                              : `${(editingData?.scoreBands || []).length} band(s) configured. Edit below or add more.`
                            }
                          </p>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Score Bands Title
                            </label>
                            <input
                              type="text"
                              value={editingData?.scoreBandsTitle || ''}
                              onChange={(e) => setEditingData({ ...editingData, scoreBandsTitle: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mb-3"
                              placeholder="Score Bands Explained"
                            />
                          </div>

                          <div className="space-y-3">
                            {(editingData?.scoreBands || []).map((band: any, idx: number) => (
                              <div key={idx} className="flex gap-2 items-start p-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Range (e.g., "27-35" or "1-8")
                                      </label>
                                      <input
                                        type="text"
                                        value={band.range || ''}
                                        onChange={(e) => {
                                          const newBands = [...(editingData?.scoreBands || [])];
                                          newBands[idx] = { ...newBands[idx], range: e.target.value };
                                          setEditingData({ ...editingData, scoreBands: newBands });
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        placeholder="27-35"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Label (e.g., "Low anxiety")
                                      </label>
                                      <input
                                        type="text"
                                        value={band.label || ''}
                                        onChange={(e) => {
                                          const newBands = [...(editingData?.scoreBands || [])];
                                          newBands[idx] = { ...newBands[idx], label: e.target.value };
                                          setEditingData({ ...editingData, scoreBands: newBands });
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Low anxiety"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Explanation
                                    </label>
                                    <textarea
                                      value={band.explanation || ''}
                                      onChange={(e) => {
                                        const newBands = [...(editingData?.scoreBands || [])];
                                        newBands[idx] = { ...newBands[idx], explanation: e.target.value };
                                        setEditingData({ ...editingData, scoreBands: newBands });
                                      }}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 min-h-[60px] focus:ring-2 focus:ring-blue-500"
                                      placeholder="You're managing it. Keep building experience."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Badge Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={band.color || '#0073ba'}
                                        onChange={(e) => {
                                          const newBands = [...(editingData?.scoreBands || [])];
                                          newBands[idx] = { ...newBands[idx], color: e.target.value };
                                          setEditingData({ ...editingData, scoreBands: newBands });
                                        }}
                                        className="h-9 w-12 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                      />
                                      <input
                                        type="text"
                                        value={band.color || ''}
                                        onChange={(e) => {
                                          const newBands = [...(editingData?.scoreBands || [])];
                                          newBands[idx] = { ...newBands[idx], color: e.target.value };
                                          setEditingData({ ...editingData, scoreBands: newBands });
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        placeholder="#0073ba"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove band ${idx + 1} (${band.range || 'untitled'})?`)) {
                                      const newBands = (editingData?.scoreBands || []).filter((_: any, i: number) => i !== idx);
                                      setEditingData({ ...editingData, scoreBands: newBands });
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Remove band"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            {(!editingData?.scoreBands || editingData.scoreBands.length === 0) && (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  No score bands configured yet
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Click "+ Add Band" above to create your first score band
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Score Message */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Score Message (appears below the score)
                          </label>
                          <textarea
                            value={editingData?.scoreMessage || ''}
                            onChange={(e) => setEditingData({ ...editingData, scoreMessage: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[60px]"
                            placeholder="You're doing well. Keep practicing to stay confident."
                          />
                        </div>

                        {/* Button Text */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Continue Button Text
                          </label>
                          <input
                            type="text"
                            value={editingData?.buttonText || ''}
                            onChange={(e) => setEditingData({ ...editingData, buttonText: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            placeholder="Continue to Framework →"
                          />
                        </div>

                        {/* Styling overrides for result */}
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Custom Styling (Optional - overrides global defaults)
                          </summary>
                          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Leave fields empty to use global defaults. Set values to override for this chapter only.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Title Color</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.titleColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), titleColor: e.target.value }
                                  })}
                                  placeholder="#111827"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Subtitle Color</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.subtitleColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), subtitleColor: e.target.value }
                                  })}
                                  placeholder="#6b7280"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreBgColor: e.target.value }
                                  })}
                                  placeholder="#ffffff"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Text Color</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreTextColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreTextColor: e.target.value }
                                  })}
                                  placeholder="#111827"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Subtext Color</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreSubtextColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreSubtextColor: e.target.value }
                                  })}
                                  placeholder="#6b7280"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Label Color</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreLabelColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreLabelColor: e.target.value }
                                  })}
                                  placeholder="#ffffff"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Label BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreLabelBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreLabelBgColor: e.target.value }
                                  })}
                                  placeholder="#3b82f6"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Message Color</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreMessageColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreMessageColor: e.target.value }
                                  })}
                                  placeholder="#374151"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Bands BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreBandsBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreBandsBgColor: e.target.value }
                                  })}
                                  placeholder="#fef3c7"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Bands Text</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreBandsTextColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreBandsTextColor: e.target.value }
                                  })}
                                  placeholder="#78350f"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Score Bands Title</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.scoreBandsTitleColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), scoreBandsTitleColor: e.target.value }
                                  })}
                                  placeholder="#92400e"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Explanation BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.explanationBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), explanationBgColor: e.target.value }
                                  })}
                                  placeholder="#fef3c7"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Explanation Text</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.explanationTextColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), explanationTextColor: e.target.value }
                                  })}
                                  placeholder="#92400e"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Button BG</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.buttonBgColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), buttonBgColor: e.target.value }
                                  })}
                                  placeholder="#f97316"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Button Hover</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.buttonHoverColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), buttonHoverColor: e.target.value }
                                  })}
                                  placeholder="#ea580c"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
                                <input
                                  type="text"
                                  value={editingData?.styles?.buttonTextColor || ''}
                                  onChange={(e) => setEditingData({
                                    ...editingData,
                                    styles: { ...(editingData?.styles || {}), buttonTextColor: e.target.value }
                                  })}
                                  placeholder="#ffffff"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                              </div>
                            </div>
                          </div>
                        </details>
                      </>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="secondary" size="sm" onClick={handleSaveBlockEdit}>
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="prose dark:prose-invert max-w-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 p-2 rounded transition-colors"
                    onClick={() => handleEditBlock(index)}
                  >
                    <BlockRenderer block={block} />
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  )
}
