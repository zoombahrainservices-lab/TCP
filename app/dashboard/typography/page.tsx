'use client'

import Card from '@/components/ui/Card'

export default function TypographyPage() {
  return (
    <div className="min-h-full bg-[var(--color-offwhite)] dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[var(--color-charcoal)] dark:text-white mb-3">
            Typography System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Simple, clean hierarchy using Inter font only - Duolingo style
          </p>
        </div>

        {/* Font Stack */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white mb-6">
            Font Family
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Primary (Everything)
              </div>
              <div className="text-2xl font-normal">
                Inter - The only font we use
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Clean, readable, professional. Used by Duolingo, GitHub, and many modern apps.
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Monospace (Data/Code)
              </div>
              <div className="text-xl font-mono">
                JetBrains Mono - For scores and data
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Only for numbers, scores, technical data
              </div>
            </div>
          </div>
        </Card>

        {/* Headings */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white mb-6">
            Headings
          </h2>
          <div className="space-y-6">
            
            {/* H1 */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  H1 - Page Titles
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-4xl font-bold
                </code>
              </div>
              <h1 className="text-4xl font-bold text-[var(--color-charcoal)] dark:text-white">
                Chapter 1: From Stage Star to Silent Struggles
              </h1>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Chapter titles, main page headings
              </div>
            </div>

            {/* H2 */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  H2 - Section Titles
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-3xl font-bold
                </code>
              </div>
              <h2 className="text-3xl font-bold text-[var(--color-charcoal)] dark:text-white">
                How much time can you give per day?
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Question screens, section headings
              </div>
            </div>

            {/* H3 */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  H3 - Subsections
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-2xl font-semibold
                </code>
              </div>
              <h3 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white">
                Typography System
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Card titles, subsection headers
              </div>
            </div>

            {/* H4 */}
            <div className="pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  H4 - Card Headers
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-xl font-semibold
                </code>
              </div>
              <h4 className="text-xl font-semibold text-[var(--color-charcoal)] dark:text-white">
                Identity Card
              </h4>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Component headers, small section titles
              </div>
            </div>
          </div>
        </Card>

        {/* Body Text */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white mb-6">
            Body Text
          </h2>
          <div className="space-y-6">
            
            {/* Large */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Large Body
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-lg font-normal
                </code>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                This is large body text used for important descriptions or introductory paragraphs. It's comfortable to read and draws attention.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Important descriptions, intro text
              </div>
            </div>

            {/* Base */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Base Body (Default)
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-base font-normal
                </code>
              </div>
              <p className="text-base text-gray-700 dark:text-gray-300">
                This is the standard body text used throughout the platform. It's the default size for paragraphs, content blocks, and most reading material.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: All body text, paragraphs, content
              </div>
            </div>

            {/* Small */}
            <div className="pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Small Body
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-sm font-normal
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Small text for metadata, hints, secondary information, and supporting details.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Subtitles, metadata, helper text
              </div>
            </div>
          </div>
        </Card>

        {/* UI Elements */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white mb-6">
            UI Elements
          </h2>
          <div className="space-y-6">
            
            {/* Buttons */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Buttons
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-base font-bold uppercase
                </code>
              </div>
              <button className="px-8 py-3 bg-[var(--color-amber)] text-[var(--color-charcoal)] rounded-xl font-bold text-base uppercase tracking-wide">
                Continue
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: All CTAs and action buttons
              </div>
            </div>

            {/* Labels */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Labels / Tags
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  text-xs font-medium uppercase
                </code>
              </div>
              <div className="inline-block px-3 py-1 bg-[var(--color-amber)] text-[var(--color-charcoal)] text-xs font-medium uppercase rounded-full">
                Start Here
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Badges, status labels, tags
              </div>
            </div>

            {/* Data */}
            <div className="pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Data / Scores
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  font-mono
                </code>
              </div>
              <div className="font-mono text-4xl font-bold text-[var(--color-charcoal)] dark:text-white">
                28 / 49
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use for: Scores, statistics, progress numbers
              </div>
            </div>
          </div>
        </Card>

        {/* Weight Scale */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white mb-6">
            Font Weight Guide
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-bold text-xl">Bold (700)</span>
              <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded">font-bold</code>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 pl-4">
              → Headings, buttons, important text
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-semibold text-xl">Semibold (600)</span>
              <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded">font-semibold</code>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 pl-4">
              → Subheadings, card titles, emphasis
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium text-xl">Medium (500)</span>
              <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded">font-medium</code>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 pl-4">
              → Labels, nav items, subtle emphasis
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-normal text-xl">Normal (400)</span>
              <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded">font-normal</code>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 pl-4">
              → Body text, paragraphs, default text
            </div>
          </div>
        </Card>

        {/* Best Practices */}
        <Card>
          <h2 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white mb-6">
            Best Practices (Refactoring UI Style)
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Use hierarchy through weight & size</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bold + large for important, normal + small for less important</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Don't use all caps everywhere</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Only for buttons and small labels/badges</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Keep line-height comfortable</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">1.5-1.7 for body text, tighter for headings</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">✗</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Don't use multiple fonts</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Stick to Inter for everything (except mono for data)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">✗</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Don't center everything</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Left-align body text, center only headings/CTAs</div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
