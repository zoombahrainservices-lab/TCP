"use client"

export function SecretIntel() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
          <span className="text-cyan-500 text-lg">🔬</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">PHASE 2: THE SECRET INTEL</h3>
          <p className="text-xs text-gray-500">The science with knowledge behind your skill</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-gray-700 text-xs mb-2">THE SCIENCE BOMB:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-start gap-1">
              <span>•</span>
              <span>
                The amygdala activates our stress/threat/avoid, controls the brain and may & has good intentions, but
                your misprocessors, not your true powerhouses
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 text-xs mb-2">THE UNLOCKABLE SUPERPOWER:</h4>
          <p className="text-xs text-gray-600">The Brave Framework: A 4-step process to reframe anxiety.</p>
        </div>
      </div>
    </div>
  )
}
