'use client'

import { DuoCard } from '@/components/ui/DuoCard'
import { DuoButton } from '@/components/ui/DuoButton'
import { ProgressCircle } from '@/components/ui/ProgressCircle'
import { DuoCharacter } from '@/components/ui/DuoCharacter'

export default function DuoComponentsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-[var(--color-charcoal)] mb-4">
          Duolingo-Style Component Library
        </h1>
        <p className="text-xl text-[var(--color-gray)] mb-12">
          TCP brand colors with Duolingo's friendly UI patterns
        </p>

        {/* DuoButtons Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[var(--color-charcoal)] mb-6">
            DuoButtons
          </h2>
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-gray)] mb-3">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <DuoButton variant="primary">Primary Button</DuoButton>
                <DuoButton variant="secondary">Secondary Button</DuoButton>
                <DuoButton variant="outline">Outline Button</DuoButton>
                <DuoButton variant="success">Success Button</DuoButton>
                <DuoButton variant="danger">Danger Button</DuoButton>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-gray)] mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <DuoButton size="sm">Small</DuoButton>
                <DuoButton size="md">Medium</DuoButton>
                <DuoButton size="lg">Large</DuoButton>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-gray)] mb-3">States</h3>
              <div className="flex flex-wrap gap-4">
                <DuoButton>Normal</DuoButton>
                <DuoButton disabled>Disabled</DuoButton>
                <DuoButton fullWidth>Full Width</DuoButton>
              </div>
            </div>
          </div>
        </section>

        {/* DuoCards Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[var(--color-charcoal)] mb-6">
            DuoCards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DuoCard borderColor="amber" className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-amber)] flex items-center justify-center text-white text-2xl font-bold">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-charcoal)]">Surface</h3>
                  <p className="text-sm text-[var(--color-gray)]">Track screen time</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-gray)]">
                Log your baseline and track progress over time.
              </p>
            </DuoCard>

            <DuoCard borderColor="blue" className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-blue)] flex items-center justify-center text-white text-2xl font-bold">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-charcoal)]">Pinpoint</h3>
                  <p className="text-sm text-[var(--color-gray)]">Identify patterns</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-gray)]">
                Discover what feelings you're avoiding.
              </p>
            </DuoCard>

            <DuoCard borderColor="red" className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-red)] flex items-center justify-center text-white text-2xl font-bold">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-charcoal)]">Anchor</h3>
                  <p className="text-sm text-[var(--color-gray)]">Build identity</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-gray)]">
                Create your identity statement and card.
              </p>
            </DuoCard>
          </div>
        </section>

        {/* Progress Circles Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[var(--color-charcoal)] mb-6">
            Progress Circles
          </h2>
          <div className="flex flex-wrap gap-8 items-center">
            <div className="text-center">
              <ProgressCircle progress={34} color="amber" />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Chapter Progress</p>
            </div>
            
            <div className="text-center">
              <ProgressCircle progress={67} color="blue" />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Reading Complete</p>
            </div>
            
            <div className="text-center">
              <ProgressCircle progress={100} color="green" />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Mission Complete</p>
            </div>

            <div className="text-center">
              <ProgressCircle 
                progress={45} 
                color="amber" 
                icon="🎯"
                showPercentage={false}
              />
              <p className="mt-3 text-sm text-[var(--color-gray)]">With Icon</p>
            </div>

            <div className="text-center">
              <ProgressCircle 
                progress={80} 
                size={80}
                strokeWidth={6}
                color="blue"
              />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Small Size</p>
            </div>

            <div className="text-center">
              <ProgressCircle 
                progress={90} 
                size={160}
                strokeWidth={12}
                color="red"
              />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Large Size</p>
            </div>
          </div>
        </section>

        {/* Characters Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[var(--color-charcoal)] mb-6">
            DuoCharacters
          </h2>
          <div className="flex flex-wrap gap-8 items-end">
            <div className="text-center">
              <DuoCharacter variant="happy" size="sm" />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Small - Happy</p>
            </div>

            <div className="text-center">
              <DuoCharacter variant="thinking" size="md" />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Medium - Thinking</p>
            </div>

            <div className="text-center">
              <DuoCharacter variant="celebrating" size="lg" />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Large - Celebrating</p>
            </div>

            <div className="text-center">
              <DuoCharacter variant="working" size="md" />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Working</p>
            </div>

            <div className="text-center">
              <DuoCharacter variant="reading" size="md" animate={false} />
              <p className="mt-3 text-sm text-[var(--color-gray)]">Reading (Static)</p>
            </div>
          </div>
        </section>

        {/* Combined Example Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[var(--color-charcoal)] mb-6">
            Combined Example: Mission Card
          </h2>
          <DuoCard borderColor="amber" className="p-8 max-w-md">
            <div className="flex items-start gap-6 mb-6">
              <DuoCharacter variant="working" size="lg" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2">
                  Chapter 1: The Start
                </h3>
                <p className="text-[var(--color-gray)]">
                  Complete your baseline assessment and begin your SPARK framework.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-[var(--color-gray)] mb-2">
                <span>Step 12 of 35</span>
                <span>34% Complete</span>
              </div>
              <ProgressCircle progress={34} size={100} color="amber" className="mx-auto" />
            </div>

            <DuoButton variant="primary" fullWidth>
              Continue Chapter
            </DuoButton>
          </DuoCard>
        </section>

        {/* Color Palette Reference */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[var(--color-charcoal)] mb-6">
            TCP Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-[var(--color-charcoal)] mb-2"></div>
              <p className="text-sm font-semibold">Charcoal</p>
              <p className="text-xs text-[var(--color-gray)]">#111111</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-[var(--color-offwhite)] border-2 border-gray-200 mb-2"></div>
              <p className="text-sm font-semibold">Off-White</p>
              <p className="text-xs text-[var(--color-gray)]">#F5F5F2</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-[var(--color-amber)] mb-2"></div>
              <p className="text-sm font-semibold">Amber</p>
              <p className="text-xs text-[var(--color-gray)]">#F5B301</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-[var(--color-red)] mb-2"></div>
              <p className="text-sm font-semibold">Red</p>
              <p className="text-xs text-[var(--color-gray)]">#E63946</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-[var(--color-blue)] mb-2"></div>
              <p className="text-sm font-semibold">Blue</p>
              <p className="text-xs text-[var(--color-gray)]">#4A90E2</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 rounded-xl bg-[var(--color-gray)] mb-2"></div>
              <p className="text-sm font-semibold">Gray</p>
              <p className="text-xs text-[var(--color-gray)]">#9A9A9A</p>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-[var(--color-charcoal)] mb-4">
            Usage Guidelines
          </h2>
          <div className="space-y-4 text-[var(--color-gray)]">
            <p>
              <strong className="text-[var(--color-charcoal)]">Color Usage:</strong> 
              &nbsp;~70% Off-White + Gray, 20% Charcoal, 10% Accent colors (Amber/Blue/Red)
            </p>
            <p>
              <strong className="text-[var(--color-charcoal)]">Amber:</strong> 
              &nbsp;Primary CTAs, achievements, attention-grabbing elements
            </p>
            <p>
              <strong className="text-[var(--color-charcoal)]">Blue:</strong> 
              &nbsp;Calm actions, recovery mode, reflection, secondary CTAs
            </p>
            <p>
              <strong className="text-[var(--color-charcoal)]">Red:</strong> 
              &nbsp;Warnings, danger zones, important alerts (use sparingly)
            </p>
            <p>
              <strong className="text-[var(--color-charcoal)]">Animation:</strong> 
              &nbsp;Subtle bounces, scales, and fades. Keep it playful but not distracting.
            </p>
            <p>
              <strong className="text-[var(--color-charcoal)]">Borders:</strong> 
              &nbsp;Use 2px borders with 30% opacity accent colors for cards.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
