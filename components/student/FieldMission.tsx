"use client";

import { PhaseCard } from "@/components/phase-card";
import { Target, Flag } from "lucide-react";

const NEON_GREEN = "#4CAF50";
const NEON_RED = "#FF5722";

export function FieldMission() {
  return (
    <PhaseCard
      phaseNumber="PHASE 4"
      title="THE FIELD MISSION"
      subtitle="Apply your skill passively the world"
      neonClass="neon-green"
      neonColor={NEON_GREEN}
      icon={<Target className="w-4 h-4 text-white" />}
    >
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Flag 
              className="w-4 h-4 shrink-0 mt-0.5" 
              style={{ color: NEON_RED, filter: `drop-shadow(0 0 3px ${NEON_RED})` }}
            />
            <div>
              <h4 className="font-semibold text-gray-800 text-xs">
                PRIMARY OBJECTIVE: OPERATION: CLIMBER
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Identify one anxiety trigger and face and confront.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            MISSION LOG:{" "}
            <span className="font-normal text-gray-500">
              Write your field notes here...
            </span>
          </label>
          <textarea
            className="w-full h-20 border border-gray-200 rounded-lg p-3 text-xs resize-none focus:outline-none transition-all"
            onFocus={(e) => {
              e.target.style.borderColor = NEON_GREEN;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
            placeholder="Write your field notes here..."
          />
        </div>

        <div className="flex justify-end">
          <button 
            className="text-white text-xs font-medium px-6 py-2 rounded transition-all hover:opacity-90"
            style={{ 
              backgroundColor: NEON_RED,
              boxShadow: `0 0 8px ${NEON_RED}33`
            }}
          >
            SUBMIT MISSION
          </button>
        </div>
      </div>
    </PhaseCard>
  );
}
