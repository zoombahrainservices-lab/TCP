'use client'

interface ReflectionInputProps {
  value: string
  onChange: (value: string) => void
  minLength?: number
  maxLength?: number
  disabled?: boolean
}

export default function ReflectionInput({
  value,
  onChange,
  minLength = 50,
  maxLength = 1000,
  disabled = false,
}: ReflectionInputProps) {
  const remaining = maxLength - value.length
  const isValid = value.length >= minLength && value.length <= maxLength

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Your Reflection
      </label>
      <textarea
        value={value}
        onChange={(e) => !disabled && onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
        }`}
        rows={6}
        placeholder="What did you learn? How did this exercise help you? What will you do differently?"
      />
      <div className="flex justify-between text-sm">
        <span className={value.length < minLength ? 'text-orange-600' : 'text-green-600'}>
          {value.length < minLength
            ? `At least ${minLength - value.length} more characters needed`
            : 'Length requirement met ✓'}
        </span>
        <span className={remaining < 0 ? 'text-red-600' : 'text-gray-500'}>
          {remaining} characters remaining
        </span>
      </div>
    </div>
  )
}
