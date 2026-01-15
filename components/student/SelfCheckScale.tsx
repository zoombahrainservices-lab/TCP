'use client'

interface SelfCheckScaleProps {
  question: string
  questionId: string
  value: number
  onChange: (value: number) => void
}

export default function SelfCheckScale({ question, questionId, value, onChange }: SelfCheckScaleProps) {
  const options = [1, 2, 3, 4, 5]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{question}</label>
      <div className="flex gap-2 justify-between max-w-md">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
              value === option
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 max-w-md">
        <span>Not at all</span>
        <span>Extremely</span>
      </div>
    </div>
  )
}
