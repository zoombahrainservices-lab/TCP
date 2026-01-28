"use client";

import { PhaseCard } from "@/components/phase-card";
import { Play, Eye } from "lucide-react";

const NEON_YELLOW = "#FFEB3B";

export function VisualGuide() {
  return (
    <PhaseCard
      phaseNumber="PHASE 2"
      title="THE HERO'S VISUAL GUIDE"
      subtitle="Attend your skill with mental simulators"
      neonClass="neon-yellow"
      neonColor={NEON_YELLOW}
      icon={<Eye className="w-4 h-4 text-white" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-800 text-xs mb-3">
            ACTIVATION SEQUENCE:
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div 
                className="w-5 h-5 rounded-full text-gray-800 text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: NEON_YELLOW }}
              >
                1
              </div>
              <p className="text-xs text-gray-600"></p>
            </div>
            <div className="flex items-start gap-3">
              <div 
                className="w-5 h-5 rounded-full text-gray-800 text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: NEON_YELLOW }}
              >
                2
              </div>
              <p className="text-xs text-gray-600"></p>
            </div>
            <div className="flex items-start gap-3">
              <div 
                className="w-5 h-5 rounded-full text-gray-800 text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: NEON_YELLOW }}
              >
                3
              </div>
              <p className="text-xs text-gray-600">
                Slowly and less out to the ledge and face by antioxs today.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <button 
              className="w-8 h-8 rounded-full text-gray-800 flex items-center justify-center transition-all hover:opacity-90"
              style={{ backgroundColor: NEON_YELLOW }}
            >
              <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
            </button>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-800">
                Audio Guided Journey
              </p>
              <p className="text-[10px] text-gray-500">4:43:89</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Audio Guided Journey: Visualize yourself calm and controlled.
          </p>
        </div>
      </div>
    </PhaseCard>
  );
}
