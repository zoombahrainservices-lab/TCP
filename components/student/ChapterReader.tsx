'use client'

interface ChapterReaderProps {
  content: string
  onNext: () => void
  onBack: () => void
  dayNumber: number
  title: string
}

export default function ChapterReader({ content, onNext, onBack, dayNumber, title }: ChapterReaderProps) {
  const handleDownloadPDF = () => {
    window.open(`/api/chapters/${dayNumber}/pdf`, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Reading Header Bar */}
      <div className="bg-blue-800 text-white px-4 py-3 md:px-6 md:py-4 mb-0 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📖</div>
          <span className="font-semibold text-base md:text-lg">Reading</span>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="px-3 py-1.5 bg-white text-blue-800 rounded-lg hover:bg-gray-100 font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </button>
      </div>

      {/* Chapter Content */}
      <div className="bg-white p-6 md:p-8 min-h-[400px] shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{title}</h2>
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
      
      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 p-4 md:p-6 flex justify-between shadow-lg">
        <button
          onClick={onBack}
          className="px-4 md:px-6 py-2 md:py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          className="px-4 md:px-6 py-2 md:py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-medium transition-colors flex items-center gap-2"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
