'use client'

interface SelfCheckScaleProps {
  question: string
  questionId: string
  value: number
  onChange: (value: number) => void
  scale?: string // Optional scale string like "1=rarely, 7=constantly"
  maxValue?: number // Optional max value (default 5, or 7 for Day 1)
}

export default function SelfCheckScale({ question, questionId, value, onChange, scale, maxValue }: SelfCheckScaleProps) {
  // Determine max value: use provided, or parse from scale, or default to 5
  const max = maxValue || (scale ? parseInt(scale.split(',')[1]?.split('=')[1]?.trim()) || 7 : 5)
  const options = Array.from({ length: max }, (_, i) => i + 1)

  // Parse scale labels if provided
  let leftLabel = 'Not at all'
  let rightLabel = 'Extremely'
  
  if (scale) {
    const parts = scale.split(',')
    if (parts.length === 2) {
      const leftPart = parts[0].split('=')
      const rightPart = parts[1].split('=')
      if (leftPart.length === 2) leftLabel = leftPart[1].trim()
      if (rightPart.length === 2) rightLabel = rightPart[1].trim()
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--color-charcoal)]">{question}</label>
      {scale && (
        <p className="text-xs text-gray-500 mb-2">{scale}</p>
      )}
      <div className="flex gap-1.5 md:gap-2 justify-center max-w-2xl">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 font-bold text-sm md:text-base transition-all ${
              value === option
                ? 'border-[var(--color-blue)] bg-[var(--color-blue)] text-white scale-110'
                : 'border-gray-300 bg-white text-[var(--color-charcoal)] hover:border-[var(--color-blue)]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[var(--color-gray)] max-w-2xl mt-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}
