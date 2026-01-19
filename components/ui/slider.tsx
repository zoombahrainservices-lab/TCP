"use client"

import * as React from "react"

interface SliderProps {
  value: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  step?: number
  className?: string
}

export function Slider({ value, onValueChange, max = 5, step = 1, className = "" }: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(value[0] || 0)

  React.useEffect(() => {
    setInternalValue(value[0] || 0)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setInternalValue(newValue)
    onValueChange?.([newValue])
  }

  const percentage = (internalValue / max) * 100

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
        }}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
