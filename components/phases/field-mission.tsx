"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import { Textarea } from "@/components/ui/textarea"
import { Flag } from "lucide-react"

export function FieldMission() {
  const [missionLog, setMissionLog] = useState("")

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
          <span className="text-teal-500 text-lg">🎯</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">PHASE 4: THE FIELD MISSION</h3>
          <p className="text-xs text-gray-500">Apply your skill powers to the world</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <Flag className="w-4 h-4 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-700 text-xs">PRIMARY OBJECTIVE: OPERATION CLIMBER</h4>
            <p className="text-xs text-gray-600">
              Identify one anxiety trigger bigger and face and confiently.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-700 font-medium">MISSION LOG:</p>
        <span className="text-xs text-gray-500">Write your field notes here...</span>
      </div>
      <div className="flex gap-2 mt-2">
        <Textarea
          value={missionLog}
          onChange={(e) => setMissionLog(e.target.value)}
          placeholder=""
          className="flex-1 h-10 min-h-0 text-xs resize-none"
        />
        <Button className="bg-teal-400 hover:bg-teal-500 text-white text-xs px-4 h-10">SUBMIT MISSION</Button>
      </div>
    </div>
  )
}
