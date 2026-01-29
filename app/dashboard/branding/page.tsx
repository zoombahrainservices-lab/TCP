import Card from '@/components/ui/Card'

export default function BrandingPage() {
  const coreColors = [
    { name: 'Blue', hex: '#0073ba', role: 'Clarity', rgb: '0, 115, 186' },
    { name: 'Cyan', hex: '#4bc4dc', role: 'Awareness', rgb: '75, 196, 220' },
    { name: 'Amber', hex: '#f7b418', role: 'Progress', rgb: '247, 180, 24' },
    { name: 'Red', hex: '#da1f26', role: 'Alert', rgb: '218, 31, 38' },
  ]

  const systemColors = [
    { name: 'Navy', hex: '#052343', role: 'Foundation', desc: 'Primary backgrounds, containers' },
    { name: 'Orange', hex: '#ff6a38', role: 'Action', desc: 'Primary CTAs, active states' },
    { name: 'Purple', hex: '#673067', role: 'Identity', desc: 'Deep reflection, self-work' },
    { name: 'Green', hex: '#43c000', role: 'Success', desc: 'Completion, positive feedback' },
  ]

  const neutrals = [
    { name: 'White', hex: '#ffffff', usage: 'Base backgrounds' },
    { name: 'Light Gray', hex: '#f5f5f5', usage: 'Secondary backgrounds' },
    { name: 'Medium Gray', hex: '#9ca3af', usage: 'Text, borders' },
    { name: 'Dark Gray', hex: '#1f2937', usage: 'Primary text' },
  ]

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">TCP Brand Guidelines</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Complete brand identity system, colors, typography, and usage guidelines.
        </p>
      </div>

      {/* Brand Colors Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Brand Colors</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            TCP's color system is designed to support behavior change through meaning and emotion.
          </p>
        </div>

        {/* Core Brand Colors */}
        <div className="py-6 lg:p-8 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border lg:border-gray-200 lg:dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Core Brand Colors</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Logo-derived anchors that feel modern, credible, energetic, and human—not corporate.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {coreColors.map((color) => (
              <div key={color.hex} className="space-y-3">
                <div 
                  className="h-32 rounded-xl shadow-lg" 
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{color.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{color.role}</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">{color.hex}</p>
                  <p className="text-xs font-mono text-gray-400">RGB: {color.rgb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 my-8" />

        {/* System Colors */}
        <div className="py-6 lg:p-8 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border lg:border-gray-200 lg:dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">System Colors</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Each color has a specific role and emotional meaning in TCP.
          </p>
          <div className="space-y-4">
            {systemColors.map((color) => (
              <div 
                key={color.hex} 
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
              >
                <div 
                  className="w-20 h-20 rounded-lg shadow-md flex-shrink-0" 
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 dark:text-white">{color.name}</p>
                    <span className="px-2 py-1 bg-[#ff6a38] text-white text-xs rounded-full">
                      {color.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{color.desc}</p>
                  <p className="text-xs font-mono text-gray-500">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 my-8" />

        {/* Neutrals */}
        <div className="py-6 lg:p-8 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border lg:border-gray-200 lg:dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Neutrals</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Calm foundations that prevent cognitive overload.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {neutrals.map((color) => (
              <div key={color.hex} className="space-y-3">
                <div 
                  className="h-28 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600" 
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{color.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{color.usage}</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 my-8" />

        {/* Usage Rules */}
        <div className="py-6 lg:p-8 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border-2 lg:border-[#ff6a38]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usage Rules (Non-Negotiable)</h2>
          <div className="space-y-4">
            {[
              { color: '#052343', rule: 'Navy is the shell', desc: 'Backgrounds, containers, navigation' },
              { color: '#ff6a38', rule: 'Orange is primary CTA', desc: 'All action buttons' },
              { color: '#da1f26', rule: 'Red is danger only', desc: 'Never decorative' },
              { color: '#f7b418', rule: 'Amber is reward', desc: 'Progress and completion' },
              { color: '#673067', rule: 'Purple is identity', desc: 'Deep reflection only' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="w-16 h-16 rounded-lg flex-shrink-0 shadow-md" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{item.rule}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="py-6 lg:p-8 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border lg:border-gray-200 lg:dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">More Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Additional brand guidelines including logos, typography, imagery, voice & tone, and downloadable resources will be added here.
          </p>
        </div>
      </div>
    </div>
  )
}
