"use client";

import { PhaseCard } from "@/components/phase-card";
import { TrendingUp, Check } from "lucide-react";

const NEON_BLUE = "#2196F3";
const NEON_GREEN = "#4CAF50";

export function LevelUp() {
  return (
    <PhaseCard
      phaseNumber="PHASE 5"
      title="LEVEL UP & MENTOR'S SCROLL"
      subtitle="Track your final stats and get feedback"
      neonClass="neon-blue"
      neonColor={NEON_BLUE}
      icon={<TrendingUp className="w-4 h-4 text-white" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border flex items-center justify-center"
                style={{ 
                  backgroundColor: NEON_GREEN,
                  borderColor: NEON_GREEN,
                }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-gray-700">Photo Submission Personal</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border flex items-center justify-center"
                style={{ 
                  backgroundColor: NEON_GREEN,
                  borderColor: NEON_GREEN,
                }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-gray-700">Content Summary</span>
            </div>
          </div>

          <div className="pt-2 space-y-1">
            <p className="text-xs text-gray-600">
              <span className="font-medium">New Power Score:</span> 4.2 points!
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">My Power Score:</span> 4.5
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 text-xs mb-2">
            The Mentor's Feedback
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-gray-300" />
              <span className="text-xs text-gray-600">3</span>
            </div>
            <div 
              className="border rounded p-2 transition-all"
              style={{ borderColor: NEON_BLUE }}
            >
              <p className="text-xs text-gray-500">Direct Parenti Feedback</p>
            </div>
            <div 
              className="border rounded p-2 transition-all"
              style={{ borderColor: NEON_BLUE }}
            >
              <p className="text-xs text-gray-500">Coach/Parent Feedback</p>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <div 
              className="w-12 h-12 border rounded flex items-center justify-center"
              style={{ borderColor: NEON_BLUE }}
            >
              <span className="text-[10px] text-gray-400 italic">Signature</span>
            </div>
          </div>
        </div>
      </div>
    </PhaseCard>
  );
}
