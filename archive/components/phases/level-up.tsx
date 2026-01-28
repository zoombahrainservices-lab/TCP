"use client"

import { Slider } from "@/components/ui/slider"

export function LevelUp() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
          <span className="text-teal-500 text-lg">📈</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">PHASE 5: LEVEL UP & MENTOR'S SCROLL</h3>
          <p className="text-xs text-gray-500">Track your training and get feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-3 h-3" />
            <span className="text-xs text-gray-600">Auto Submission Process</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-3 h-3" />
            <span className="text-xs text-gray-600">Created Submission</span>
          </div>

          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-1">New Power Score: 4.2 points!</p>
            <Slider value={[4.2]} max={5} step={0.1} className="w-full" />
          </div>

          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-1">My Power Score: 4.5</p>
            <Slider value={[4.5]} max={5} step={0.1} className="w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">The Mentor's Upgrade</span>
            <Slider value={[3]} max={5} step={1} className="flex-1" />
          </div>

          <div className="h-px bg-gray-200 my-2" />

          <p className="text-xs text-gray-600">Direct Planner Feedback</p>

          <div className="h-px bg-gray-200 my-2" />

          <p className="text-xs text-gray-600">
            CoachPlanner I feedback{" "}
            <span className="inline-block ml-2 text-gray-400" style={{ fontFamily: "cursive" }}>
              Lyla
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
