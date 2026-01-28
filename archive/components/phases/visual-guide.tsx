"use client"

import { Play } from "lucide-react"

export function VisualGuide() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-orange-500 text-lg">🎬</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">PHASE 3: THE HERO'S VISUAL GUIDE</h3>
          <p className="text-xs text-gray-500">Activate your skill with mental simulators</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-gray-700 text-xs mb-3">ACTIVATION SEQUENCE:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div className="flex-1 h-1 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div className="flex-1 h-1 bg-gray-200 rounded" />
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </span>
              <p className="text-xs text-gray-600">Slowly smile to call to the ledge and face by anxious today.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <button className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <Play className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700">Audio Guided Journey</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-300 rounded">
                  <div className="w-1/3 h-full bg-cyan-400 rounded" />
                </div>
                <span className="text-xs text-gray-500">4:38:08</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600">Audio Guided Journey: Visualize yourself calm and controlled.</p>
        </div>
      </div>
    </div>
  )
}
