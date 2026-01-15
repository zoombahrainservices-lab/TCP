'use client'

interface ChapterReaderProps {
  content: string
  onNext: () => void
  onBack: () => void
}

export default function ChapterReader({ content, onNext, onBack }: ChapterReaderProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-4 min-h-[400px]">
        <div className="prose prose-lg max-w-none">
          {content.split('\n').map((paragraph, idx) => {
            if (paragraph.startsWith('# ')) {
              return <h1 key={idx} className="text-3xl font-bold mb-4">{paragraph.substring(2)}</h1>
            }
            if (paragraph.startsWith('## ')) {
              return <h2 key={idx} className="text-2xl font-semibold mt-6 mb-3">{paragraph.substring(3)}</h2>
            }
            if (paragraph.startsWith('### ')) {
              return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">{paragraph.substring(4)}</h3>
            }
            if (paragraph.trim() === '') {
              return <div key={idx} className="h-4" />
            }
            return <p key={idx} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>
          })}
        </div>
      </div>
      
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
