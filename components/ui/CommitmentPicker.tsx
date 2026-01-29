import React from 'react'

interface CommitmentOption {
  id: number
  label: string
  subtitle: string
}

interface CommitmentPickerProps {
  options: CommitmentOption[]
  selected?: number
  onSelect: (id: number) => void
}

export default function CommitmentPicker({
  options,
  selected,
  onSelect,
}: CommitmentPickerProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`w-full p-4 rounded-xl border-2 transition-all text-center ${
            selected === option.id
              ? 'border-[var(--color-blue)] bg-[var(--color-blue)]/5 shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm bg-white dark:bg-gray-800'
          }`}
        >
          <div className="font-bold text-gray-900 dark:text-white mb-1">
            {option.label}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {option.subtitle}
          </div>
        </button>
      ))}
    </div>
  )
}
