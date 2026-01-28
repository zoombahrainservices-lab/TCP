"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import Button from "@/components/ui/Button"
import { Check } from "lucide-react"

interface SliderItemProps {
  label: string
  value: number
  onChange: (value: number) => void
  checked?: boolean
}

function SliderItem({ label, value, onChange, checked }: SliderItemProps) {
  return (
    <div className="flex items-center gap-3">
      {checked !== undefined && (
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${checked ? "bg-green-500" : "border-2 border-gray-300"}`}
        >
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-gray-600 mb-1">{label}</p>
        <Slider value={[value]} onValueChange={(v) => onChange(v[0])} max={5} step={1} className="w-full" />
      </div>
      <span className="text-sm font-medium text-gray-700 w-4">{value}</span>
    </div>
  )
}

export function PowerScan() {
  const [values, setValues] = useState({
    publicSpeaking: 3,
    fear: 3,
    catastrophe: 3,
    calmUnderPressure: 1,
    calmBody: 1,
    dontAvoid: 1,
  })

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-500 text-lg">📊</span>
        </div>
        <h3 className="font-bold text-gray-800 text-sm">PHASE 1: THE POWER SCAN</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4 ml-10">Rate your current power levels (1-5 scale)</p>

      <div className="flex items-center justify-center mb-4">
        <span className="text-2xl">🏃</span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <SliderItem
          label="Public Speaking Confidence"
          value={values.publicSpeaking}
          onChange={(v) => setValues({ ...values, publicSpeaking: v })}
          checked={true}
        />
        <SliderItem
          label="Calm Under Pressure"
          value={values.calmUnderPressure}
          onChange={(v) => setValues({ ...values, calmUnderPressure: v })}
        />
        <SliderItem
          label="Fear: Embarrass"
          value={values.fear}
          onChange={(v) => setValues({ ...values, fear: v })}
          checked={true}
        />
        <SliderItem
          label="Calm Body Pressure"
          value={values.calmBody}
          onChange={(v) => setValues({ ...values, calmBody: v })}
        />
        <SliderItem
          label="Catastrophe Stress/fear"
          value={values.catastrophe}
          onChange={(v) => setValues({ ...values, catastrophe: v })}
          checked={true}
        />
        <SliderItem
          label="Don't Avoid/shy/freeze"
          value={values.dontAvoid}
          onChange={(v) => setValues({ ...values, dontAvoid: v })}
        />
      </div>

      <div className="flex justify-center mt-4">
        <Button className="bg-cyan-400 hover:bg-cyan-500 text-white rounded-full px-6 text-sm">
          Calculate My Power Score
        </Button>
      </div>
    </div>
  )
}
