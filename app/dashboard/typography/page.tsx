export default function TypographyPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-16 max-w-[1440px] mx-auto">
      {/* Page Header - Mobile First */}
      <div className="mb-8 sm:mb-12 lg:mb-20">
        <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8 tracking-tight leading-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>
          Typography
        </h1>
        <p className="text-base sm:text-lg lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
          Built on clarity, reading speed, and purposeful hierarchy.
        </p>
      </div>

      {/* Typography Hierarchy - Mobile First */}
      <div className="space-y-8 sm:space-y-12 lg:space-y-20">
        
        {/* Font Roles */}
        <div className="py-6 sm:py-8 lg:p-16 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border lg:border-gray-200 lg:dark:border-gray-700">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12" style={{ fontFamily: "'Roboto', sans-serif" }}>
            Font Hierarchy
          </h2>
          
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Lexend */}
            <div className="pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4 sm:mb-5">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Lexend', sans-serif" }}>
                  Lexend
                </h3>
                <span className="inline-block px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs sm:text-sm rounded font-semibold" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Primary Body
                </span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-3 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <strong>Usage:</strong> All body text, paragraphs, reading content
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                Expanded spacing for reading speed and reduced eye fatigue.
              </p>
            </div>

            {/* Open Sans */}
            <div className="pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4 sm:mb-5">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Open Sans
                </h3>
                <span className="inline-block px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs sm:text-sm rounded font-semibold" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Navigation
                </span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-3 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <strong>Usage:</strong> Menu text, buttons, UI labels
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                Excellent legibility at small sizes for navigation.
              </p>
            </div>

            {/* Roboto */}
            <div className="pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4 sm:mb-5">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  Roboto
                </h3>
                <span className="inline-block px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs sm:text-sm rounded font-semibold" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Display & Headings
                </span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-3 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <strong>Usage:</strong> Page titles, section headings, emphasis
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                Modern, clean, and authoritative for hierarchy.
              </p>
            </div>

            {/* Bebas Neue */}
            <div className="pb-6 sm:pb-8">
              <div className="mb-4 sm:mb-5">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Bebas Neue
                </h3>
                <span className="inline-block px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs sm:text-sm rounded font-semibold" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Special Titles
                </span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-3 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <strong>Usage:</strong> Chapter titles, special statements
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                Bold and impactful for maximum visual weight.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 my-8" />

        {/* Golden Ratio Scale - Mobile Optimized */}
        <div className="py-6 sm:py-8 lg:p-16 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border-2 lg:border-[#ff6a38]">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8" style={{ fontFamily: "'Roboto', sans-serif" }}>
            Type Scale
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 lg:mb-12 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
            Golden ratio 1.618 • Base: 16px
          </p>
          
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {[
              { size: '64px', px: 64, mobilePx: 32, label: 'Display Large', font: 'Roboto', ratio: '4.0', usage: 'Hero titles' },
              { size: '48px', px: 48, mobilePx: 28, label: 'Display', font: 'Roboto', ratio: '3.0', usage: 'Page titles' },
              { size: '32px', px: 32, mobilePx: 24, label: 'Heading 1', font: 'Roboto', ratio: '2.0', usage: 'Section headers' },
              { size: '24px', px: 24, mobilePx: 20, label: 'Heading 2', font: 'Roboto', ratio: '1.5', usage: 'Subsections' },
              { size: '20px', px: 20, mobilePx: 18, label: 'Heading 3', font: 'Roboto', ratio: '1.25', usage: 'Card titles' },
              { size: '16px', px: 16, mobilePx: 16, label: 'Body', font: 'Lexend', ratio: '1.0', usage: 'All paragraphs' },
              { size: '14px', px: 14, mobilePx: 14, label: 'Small', font: 'Open Sans', ratio: '0.875', usage: 'Menu items' },
              { size: '12px', px: 12, mobilePx: 12, label: 'Caption', font: 'Open Sans', ratio: '0.75', usage: 'Labels' },
            ].map((item) => (
              <div key={item.size} className="py-4 sm:py-5 lg:py-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                {/* Mobile Layout: Vertical Stack */}
                <div className="block lg:flex lg:items-center lg:justify-between">
                  <div className="flex items-center justify-between mb-3 lg:mb-0 lg:flex-1">
                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                      <span className="text-sm sm:text-base font-mono font-bold text-gray-900 dark:text-white min-w-[50px]" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                        {item.size}
                      </span>
                      <div>
                        <span className="text-sm sm:text-base lg:text-base font-bold text-gray-900 dark:text-white block" style={{ fontFamily: "'Roboto', sans-serif" }}>
                          {item.label}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 font-medium lg:hidden" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                          {item.font}
                        </span>
                      </div>
                    </div>
                    <span 
                      className="font-bold text-gray-900 dark:text-white lg:ml-8"
                      style={{ 
                        fontSize: `${item.mobilePx}px`,
                        fontFamily: item.font === 'Lexend' ? "'Lexend', sans-serif" : item.font === 'Open Sans' ? "'Open Sans', sans-serif" : "'Roboto', sans-serif",
                      }}
                    >
                      Aa
                    </span>
                  </div>
                  {/* Desktop additional info */}
                  <div className="hidden lg:flex lg:items-center lg:gap-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      {item.ratio}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500 font-medium min-w-[100px]" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      {item.font}
                    </span>
                    <span 
                      className="font-bold text-gray-900 dark:text-white"
                      style={{ 
                        fontSize: `${item.px}px`,
                        fontFamily: item.font === 'Lexend' ? "'Lexend', sans-serif" : item.font === 'Open Sans' ? "'Open Sans', sans-serif" : "'Roboto', sans-serif",
                      }}
                    >
                      Aa
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed" style={{ fontFamily: "'Lexend', sans-serif" }}>
                  {item.usage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 my-8" />

        {/* Real Example: Chapter Structure - Mobile First */}
        <div className="py-6 sm:py-8 lg:p-16 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border lg:border-gray-200 lg:dark:border-gray-700">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12" style={{ fontFamily: "'Roboto', sans-serif" }}>
            Chapter Example
          </h2>
          
          {/* Chapter Example */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-12 shadow-lg">
            {/* Chapter Title - Bebas Neue */}
            <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-amber-500">
              <h1 
                className="text-2xl sm:text-3xl lg:text-6xl font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Chapter 1: The Attention Heist
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Zone 1 • Mission 1
              </p>
            </div>

            {/* Section Heading - Roboto */}
            <h2 
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              The Problem
            </h2>

            {/* Body Text - Lexend */}
            <p 
              className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Tom sat in the coffee shop, phone in hand, pretending to listen. He nodded at the right moments, but his mind was somewhere else. He was performing presence, not being present.
            </p>

            <p 
              className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              This is the attention heist. Your communication suffers not because you lack words, but because you lack presence.
            </p>

            {/* Subsection - Roboto */}
            <h3 
              className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 mt-6 sm:mt-8"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              What You'll Learn
            </h3>

            {/* List items - Lexend */}
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              {[
                'Recognize stolen attention',
                'SPARK framework for presence',
                'Stay in the moment',
                'Awareness as first step',
              ].map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Special Quote - Bebas Neue */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 lg:p-8 border-l-4 border-gray-900 dark:border-white my-6 sm:my-8 lg:my-10">
              <p 
                className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-wide leading-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                "Communication is about being present"
              </p>
            </div>

            {/* Navigation Button Example - Open Sans */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="px-5 sm:px-6 py-3 bg-[#ff6a38] hover:bg-[#e55a28] text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              >
                Continue Reading
              </button>
              <button 
                className="px-5 sm:px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 my-8" />

        {/* Font Pairing Quick Reference - Mobile First */}
        <div className="py-6 sm:py-8 lg:p-16 lg:bg-white lg:dark:bg-[#142A4A] lg:rounded-lg lg:shadow-md lg:border lg:border-gray-200 lg:dark:border-gray-700">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12" style={{ fontFamily: "'Roboto', sans-serif" }}>
            Quick Reference
          </h2>
          
          <div className="space-y-8 sm:space-y-10 lg:grid lg:grid-cols-2 lg:gap-10 lg:space-y-0">
            <div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-gray-900 dark:border-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
                ✓ DO
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <li>• Lexend for reading</li>
                <li>• Roboto for headings</li>
                <li>• Open Sans for navigation</li>
                <li>• Bebas Neue for chapters</li>
                <li>• Consistent line-height</li>
                <li>• Respect the scale</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-gray-400 dark:border-gray-600" style={{ fontFamily: "'Roboto', sans-serif" }}>
                ✗ DON'T
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <li>• Mix fonts in paragraphs</li>
                <li>• Bebas for body text</li>
                <li>• More than 3 fonts/page</li>
                <li>• Ignore type scale</li>
                <li>• Decorative for reading</li>
                <li>• Style over readability</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
