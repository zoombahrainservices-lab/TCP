'use client'

export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[var(--color-charcoal)] mb-12 text-center">
          Landing Page Title Font Variations
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Variation 1: Inter Bold (Current) */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-4 text-sm font-medium text-[var(--color-gray)] uppercase tracking-wide">
              Variation 1: Inter Bold (Current)
            </div>
            <h2 className="text-5xl font-bold text-[var(--color-charcoal)] leading-tight uppercase mb-4">
              BACKED BY NEUROSCIENCE
            </h2>
            <p className="text-lg text-[var(--color-gray)]">
              Built by doctors, psychologists, public speakers, and successful business owners. 
              Neuroscience-backed. Story-driven. It just works.
            </p>
            <div className="mt-6 text-xs text-[var(--color-gray)]">
              Clean, modern, very Duolingo-style
            </div>
          </div>

          {/* Variation 2: Inter Extrabold */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-4 text-sm font-medium text-[var(--color-gray)] uppercase tracking-wide">
              Variation 2: Inter Extrabold
            </div>
            <h2 className="text-5xl font-extrabold text-[var(--color-charcoal)] leading-tight uppercase mb-4">
              BACKED BY NEUROSCIENCE
            </h2>
            <p className="text-lg text-[var(--color-gray)]">
              Built by doctors, psychologists, public speakers, and successful business owners. 
              Neuroscience-backed. Story-driven. It just works.
            </p>
            <div className="mt-6 text-xs text-[var(--color-gray)]">
              Heavier weight, more presence, bolder
            </div>
          </div>

          {/* Variation 3: Inter Black */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-4 text-sm font-medium text-[var(--color-gray)] uppercase tracking-wide">
              Variation 3: Inter Black
            </div>
            <h2 className="text-5xl font-black text-[var(--color-charcoal)] leading-tight uppercase mb-4">
              BACKED BY NEUROSCIENCE
            </h2>
            <p className="text-lg text-[var(--color-gray)]">
              Built by doctors, psychologists, public speakers, and successful business owners. 
              Neuroscience-backed. Story-driven. It just works.
            </p>
            <div className="mt-6 text-xs text-[var(--color-gray)]">
              Maximum impact, very bold statement
            </div>
          </div>

          {/* Variation 4: Inter Bold + Wider Tracking */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-4 text-sm font-medium text-[var(--color-gray)] uppercase tracking-wide">
              Variation 4: Inter Bold + Wide Spacing
            </div>
            <h2 className="text-5xl font-bold text-[var(--color-charcoal)] leading-tight uppercase mb-4 tracking-wide">
              BACKED BY NEUROSCIENCE
            </h2>
            <p className="text-lg text-[var(--color-gray)]">
              Built by doctors, psychologists, public speakers, and successful business owners. 
              Neuroscience-backed. Story-driven. It just works.
            </p>
            <div className="mt-6 text-xs text-[var(--color-gray)]">
              More breathing room, luxury feel
            </div>
          </div>

        </div>

        {/* Full Width Comparison */}
        <div className="mt-12 bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-2xl font-bold text-[var(--color-charcoal)] mb-8">
            Side-by-Side Full Context Preview
          </h3>
          
          <div className="space-y-12">
            {/* Option 1 */}
            <div className="border-l-4 border-[var(--color-amber)] pl-6">
              <div className="text-xs font-medium text-[var(--color-gray)] uppercase mb-2">Option 1</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-charcoal)] leading-tight uppercase">
                BACKED BY NEUROSCIENCE
              </h2>
            </div>

            {/* Option 2 */}
            <div className="border-l-4 border-[var(--color-blue)] pl-6">
              <div className="text-xs font-medium text-[var(--color-gray)] uppercase mb-2">Option 2</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-charcoal)] leading-tight uppercase">
                BACKED BY NEUROSCIENCE
              </h2>
            </div>

            {/* Option 3 */}
            <div className="border-l-4 border-[var(--color-red)] pl-6">
              <div className="text-xs font-medium text-[var(--color-gray)] uppercase mb-2">Option 3</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-charcoal)] leading-tight uppercase">
                BACKED BY NEUROSCIENCE
              </h2>
            </div>

            {/* Option 4 */}
            <div className="border-l-4 border-green-500 pl-6">
              <div className="text-xs font-medium text-[var(--color-gray)] uppercase mb-2">Option 4</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-charcoal)] leading-tight uppercase tracking-wide">
                BACKED BY NEUROSCIENCE
              </h2>
            </div>
          </div>
        </div>

        {/* Color on Color Test */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--color-amber)] rounded-2xl p-12">
            <h2 className="text-5xl font-black text-white leading-tight uppercase">
              STAY ON TRACK
            </h2>
            <p className="text-lg text-white/90 mt-4">
              With white text on amber background
            </p>
          </div>

          <div className="bg-[var(--color-charcoal)] rounded-2xl p-12">
            <h2 className="text-5xl font-black text-white leading-tight uppercase">
              STAY ON TRACK
            </h2>
            <p className="text-lg text-white/80 mt-4">
              With white text on charcoal background
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
