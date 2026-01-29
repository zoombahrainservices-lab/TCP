'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import BlockChip from '@/components/ui/BlockChip'
import CTAButton from '@/components/ui/CTAButton'
import ArtifactCard from '@/components/ui/ArtifactCard'
import ProgressCard from '@/components/ui/ProgressCard'
import AssessmentCard from '@/components/ui/AssessmentCard'
import StepHeader from '@/components/ui/StepHeader'
import SelectionCard from '@/components/ui/SelectionCard'
import RadioOption from '@/components/ui/RadioOption'
import SplitScreenCard from '@/components/ui/SplitScreenCard'
import FeatureOptionCard from '@/components/ui/FeatureOptionCard'
import InfoTooltip from '@/components/ui/InfoTooltip'
import FullScreenOverlay from '@/components/ui/FullScreenOverlay'

export default function ComponentsShowcase() {
  const [activeTab, setActiveTab] = useState<'buttons' | 'cards' | 'blocks' | 'inputs' | 'headers' | 'onboarding' | 'layouts'>('buttons')
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-charcoal)] dark:text-white mb-2">
            UI/UX Component Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Standardized components for the TCP Chapter System
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(['buttons', 'cards', 'blocks', 'inputs', 'headers', 'onboarding', 'layouts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[var(--color-amber)] text-[var(--color-charcoal)]'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Buttons Section */}
        {activeTab === 'buttons' && (
          <div className="space-y-8">
            <Section title="Button Variants">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ComponentDemo label="Primary">
                  <Button variant="primary">Primary Button</Button>
                </ComponentDemo>
                <ComponentDemo label="Secondary">
                  <Button variant="secondary">Secondary Button</Button>
                </ComponentDemo>
                <ComponentDemo label="Danger">
                  <Button variant="danger">Danger Button</Button>
                </ComponentDemo>
                <ComponentDemo label="Ghost">
                  <Button variant="ghost">Ghost Button</Button>
                </ComponentDemo>
                <ComponentDemo label="Calm (Blue)">
                  <Button variant="calm">Calm Button</Button>
                </ComponentDemo>
                <ComponentDemo label="Success">
                  <Button variant="success">Success Button</Button>
                </ComponentDemo>
                <ComponentDemo label="Warning">
                  <Button variant="warning">Warning Button</Button>
                </ComponentDemo>
                <ComponentDemo label="Primary with Glow">
                  <Button variant="primary" glow>Glowing Button</Button>
                </ComponentDemo>
              </div>
            </Section>

            <Section title="Button Sizes">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </Section>

            <Section title="Full Width Buttons">
              <Button variant="primary" fullWidth>Full Width Primary</Button>
              <div className="mt-2">
                <Button variant="calm" fullWidth>Full Width Calm</Button>
              </div>
            </Section>

            <Section title="CTA Buttons (Chapter System)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComponentDemo label="Next">
                  <CTAButton>Next</CTAButton>
                </ComponentDemo>
                <ComponentDemo label="Continue">
                  <CTAButton>Continue</CTAButton>
                </ComponentDemo>
                <ComponentDemo label="Save">
                  <CTAButton variant="success">Save</CTAButton>
                </ComponentDemo>
                <ComponentDemo label="Submit">
                  <CTAButton variant="primary">Submit</CTAButton>
                </ComponentDemo>
                <ComponentDemo label="Resume Later">
                  <CTAButton variant="ghost">Resume Later</CTAButton>
                </ComponentDemo>
                <ComponentDemo label="Disabled">
                  <CTAButton disabled>Disabled</CTAButton>
                </ComponentDemo>
              </div>
            </Section>

            <Section title="Disabled States">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" disabled>Primary Disabled</Button>
                <Button variant="secondary" disabled>Secondary Disabled</Button>
                <Button variant="danger" disabled>Danger Disabled</Button>
              </div>
            </Section>
          </div>
        )}

        {/* Cards Section */}
        {activeTab === 'cards' && (
          <div className="space-y-8">
            <Section title="Basic Cards">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card padding="sm">
                  <h3 className="font-semibold mb-2">Small Padding</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Card with small padding</p>
                </Card>
                <Card padding="md">
                  <h3 className="font-semibold mb-2">Medium Padding</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Card with medium padding (default)</p>
                </Card>
                <Card padding="lg">
                  <h3 className="font-semibold mb-2">Large Padding</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Card with large padding</p>
                </Card>
              </div>
            </Section>

            <Section title="Artifact Cards (SPARK outputs)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ArtifactCard
                  type="identity_card"
                  title="Identity Card"
                  data={{
                    identity: "a storyteller",
                    impact: "who makes people feel less alone"
                  }}
                />
                <ArtifactCard
                  type="screen_time_baseline"
                  title="Screen-time Baseline"
                  data={{
                    range: "5-7 hours",
                    date: new Date().toISOString()
                  }}
                />
                <ArtifactCard
                  type="substitutions"
                  title="Substitution Game"
                  data={{
                    substitutions: ["Go for a walk", "Call a friend", "Read a book"]
                  }}
                />
                <ArtifactCard
                  type="later_phrase"
                  title="Later Phrase"
                  data={{
                    phrase: "Not now, I'll check it later"
                  }}
                />
              </div>
            </Section>

            <Section title="Progress Cards">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressCard
                  title="Chapter 1 Progress"
                  current={4}
                  total={11}
                  percentage={36}
                />
                <ProgressCard
                  title="SPARK Framework"
                  current={3}
                  total={5}
                  percentage={60}
                  variant="framework"
                />
              </div>
            </Section>

            <Section title="Assessment Cards">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AssessmentCard
                  type="baseline"
                  score={28}
                  band="Danger zone"
                  date={new Date().toISOString()}
                />
                <AssessmentCard
                  type="after"
                  score={16}
                  band="Improving"
                  delta={-12}
                  date={new Date().toISOString()}
                />
              </div>
            </Section>
          </div>
        )}

        {/* Block Chips Section */}
        {activeTab === 'blocks' && (
          <div className="space-y-8">
            <Section title="Block Chips (Chapter Navigation)">
              <div className="flex flex-wrap gap-3">
                <BlockChip type="reading" active={false}>Reading</BlockChip>
                <BlockChip type="assessment" active={false}>Check</BlockChip>
                <BlockChip type="framework" active={true}>Framework</BlockChip>
                <BlockChip type="techniques" active={false}>Toolbox</BlockChip>
                <BlockChip type="proof" active={false}>Proof</BlockChip>
                <BlockChip type="follow-through" active={false}>Follow-through</BlockChip>
              </div>
            </Section>

            <Section title="Block Chips - Completed State">
              <div className="flex flex-wrap gap-3">
                <BlockChip type="reading" completed>Reading</BlockChip>
                <BlockChip type="assessment" completed>Check</BlockChip>
                <BlockChip type="framework" active completed>Framework</BlockChip>
                <BlockChip type="techniques">Toolbox</BlockChip>
                <BlockChip type="proof">Proof</BlockChip>
                <BlockChip type="follow-through">Follow-through</BlockChip>
              </div>
            </Section>

            <Section title="Block Colors Reference">
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500"></div>
                    <span className="font-medium">🔵 READING</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- Narrative/science content</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-yellow-400"></div>
                    <span className="font-medium">🟡 SELF-ASSESSMENT</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- Baseline & After</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-orange-500"></div>
                    <span className="font-medium">🟠 FRAMEWORK</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- SPARK missions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-500"></div>
                    <span className="font-medium">🔴 TECHNIQUES</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- Toolbox buildout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-purple-500"></div>
                    <span className="font-medium">🟣 RESOLUTION/PROOF</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- Story proof</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-400"></div>
                    <span className="font-medium">⚪ FOLLOW-THROUGH</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- Plans & recovery</span>
                  </div>
                </div>
              </Card>
            </Section>
          </div>
        )}

        {/* Headers Section */}
        {activeTab === 'headers' && (
          <div className="space-y-8">
            <Section title="Step Header (Persistent)">
              <Card padding="none">
                <StepHeader
                  chapterTitle="Chapter 1"
                  currentStep={3}
                  totalSteps={35}
                  currentBlock="framework"
                  blocks={[
                    { type: 'reading', label: 'Reading', completed: true },
                    { type: 'assessment', label: 'Check', completed: true },
                    { type: 'framework', label: 'Framework', completed: false },
                    { type: 'techniques', label: 'Toolbox', completed: false },
                    { type: 'proof', label: 'Proof', completed: false },
                    { type: 'follow-through', label: 'Follow-through', completed: false },
                  ]}
                  onResumeLater={() => alert('Resume later clicked')}
                />
              </Card>
            </Section>

            <Section title="Typography Examples">
              <Card>
                <h1 className="headline-xl text-[var(--color-charcoal)] dark:text-white mb-4">
                  HEADLINE XL - CHAPTER TITLES
                </h1>
                <h2 className="headline-lg text-[var(--color-charcoal)] dark:text-white mb-4">
                  HEADLINE LG - SECTION TITLES
                </h2>
                <h3 className="headline-md text-[var(--color-charcoal)] dark:text-white mb-4">
                  HEADLINE MD - SUBSECTION TITLES
                </h3>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
                  Body text - This is the standard body text used throughout the platform. It should be readable and comfortable for longer reading sessions.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Small text - Used for metadata, hints, and secondary information.
                </p>
                <p className="text-data text-gray-700 dark:text-gray-300">
                  Data/Mono text - Used for scores, statistics, and technical information: Score: 28/49
                </p>
              </Card>
            </Section>
          </div>
        )}

        {/* Inputs Section */}
        {activeTab === 'inputs' && (
          <div className="space-y-8">
            <Section title="Input Components">
              <Card>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Input components will be added here (sliders, text areas, multi-select, etc.)
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coming soon: Assessment sliders, SPARK input forms, technique configuration inputs
                </p>
              </Card>
            </Section>
          </div>
        )}

        {/* Onboarding Patterns Section */}
        {activeTab === 'onboarding' && (
          <div className="space-y-8">
            <Section title="Selection Cards (Hover Effect)">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectionCard
                  id="card-1"
                  title="Myself"
                  description="Focus, confidence, anxiety, honesty"
                  image="/slider-work-on-quizz/Myself.png"
                  hoverImage="/slider-work-on-quizz/Myself-hover.png"
                  gradient="from-[#0073ba] to-[#4bc4dc]"
                  selected={selectedCard === 'card-1'}
                  onClick={() => setSelectedCard('card-1')}
                  size="md"
                />
                <SelectionCard
                  id="card-2"
                  title="Friends & Family"
                  description="Listening, boundaries, arguments"
                  image="/slider-work-on-quizz/Friends-and-family.png"
                  hoverImage="/slider-work-on-quizz/Friends-and-family-hover.png"
                  gradient="from-[#ff6a38] to-[#ff8c63]"
                  selected={selectedCard === 'card-2'}
                  onClick={() => setSelectedCard('card-2')}
                  size="md"
                />
                <SelectionCard
                  id="card-3"
                  title="School or Work"
                  description="Meetings, feedback, teams"
                  image="/slider-work-on-quizz/School-and-work.png"
                  hoverImage="/slider-work-on-quizz/School-and-work-hover.png"
                  gradient="from-purple-500 to-indigo-500"
                  selected={selectedCard === 'card-3'}
                  onClick={() => setSelectedCard('card-3')}
                  size="md"
                />
              </div>
            </Section>

            <Section title="Radio Options (Clean Duolingo Style)">
              <div className="space-y-3 max-w-md mx-auto">
                <RadioOption
                  value="15"
                  label="15 min / day"
                  subtitle="Casual"
                  selected={selectedRadio === '15'}
                  onClick={() => setSelectedRadio('15')}
                />
                <RadioOption
                  value="20"
                  label="20 min / day"
                  subtitle="Regular"
                  selected={selectedRadio === '20'}
                  onClick={() => setSelectedRadio('20')}
                />
                <RadioOption
                  value="25"
                  label="25 min / day"
                  subtitle="Serious"
                  selected={selectedRadio === '25'}
                  onClick={() => setSelectedRadio('25')}
                />
                <RadioOption
                  value="30"
                  label="30 min / day"
                  subtitle="Intense"
                  selected={selectedRadio === '30'}
                  onClick={() => setSelectedRadio('30')}
                />
              </div>
            </Section>

            <Section title="Feature Option Cards (Full Height)">
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
                <FeatureOptionCard
                  id="free"
                  title="Start Chapter 1"
                  subtitle="Free Demo - Start reading immediately"
                  image="/slider-work-on-quizz/free.png"
                  features={[
                    { text: 'Instant access to Chapter 1' },
                    { text: 'Learn the fundamentals' },
                    { text: 'No registration required' },
                    { text: 'Try before you commit' },
                  ]}
                  selected={selectedFeature === 'free'}
                  onClick={() => setSelectedFeature('free')}
                  accentColor="blue"
                />
                <FeatureOptionCard
                  id="paid"
                  title="Register First"
                  subtitle="Get full access - All chapters unlocked"
                  image="/slider-work-on-quizz/payed.png"
                  features={[
                    { text: 'All 30 chapters unlocked' },
                    { text: 'Complete training program' },
                    { text: 'Lifetime access' },
                    { text: 'One-time payment' },
                  ]}
                  selected={selectedFeature === 'paid'}
                  onClick={() => setSelectedFeature('paid')}
                  accentColor="amber"
                  badge="Best Value"
                />
              </div>
            </Section>

            <Section title="Info Tooltip">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 dark:text-gray-300">Hover for more info:</span>
                <InfoTooltip
                  content="This is a helpful tooltip that provides additional context and information to the user."
                  position="top"
                  size="md"
                />
                <InfoTooltip
                  content={
                    <div>
                      <strong className="block mb-1">Custom Content</strong>
                      <p className="text-xs">You can pass any React component as content!</p>
                    </div>
                  }
                  position="bottom"
                  size="lg"
                />
              </div>
            </Section>
          </div>
        )}

        {/* Layouts Section */}
        {activeTab === 'layouts' && (
          <div className="space-y-8">
            <Section title="Split Screen Card (Background Images)">
              <SplitScreenCard
                title="What feels hardest for you right now?"
                subtitle="Why focus on one? Concentrating on a single area allows for faster, more meaningful improvement."
                leftImage="/slider-work-on-quizz/Myself.png"
                rightImage="/slider-work-on-quizz/Myself-hover.png"
              >
                <div className="space-y-2">
                  <RadioOption
                    value="q1"
                    label="I can't focus and get distracted easily"
                    selected={selectedRadio === 'q1'}
                    onClick={() => setSelectedRadio('q1')}
                  />
                  <RadioOption
                    value="q2"
                    label="I'm afraid to speak up"
                    selected={selectedRadio === 'q2'}
                    onClick={() => setSelectedRadio('q2')}
                  />
                  <RadioOption
                    value="q3"
                    label="I feel anxious in social situations"
                    selected={selectedRadio === 'q3'}
                    onClick={() => setSelectedRadio('q3')}
                  />
                </div>
              </SplitScreenCard>
            </Section>

            <Section title="Full Screen Overlay">
              <Card>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Full screen overlay with progress bar, close button, and animated background.
                </p>
                <Button variant="primary" onClick={() => setShowOverlay(true)}>
                  Open Overlay Demo
                </Button>
              </Card>
            </Section>
          </div>
        )}
      </div>

      {/* Full Screen Overlay Demo */}
      {showOverlay && (
        <FullScreenOverlay
          progress={60}
          onClose={() => setShowOverlay(false)}
          showLogo={true}
          showBackgroundAnimation={true}
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[var(--color-charcoal)] dark:text-white mb-4">
              Full Screen Overlay
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              This is a full screen overlay with progress bar, close button, and animated background.
            </p>
            <Card className="max-w-2xl mx-auto">
              <p className="text-gray-700 dark:text-gray-300">
                Perfect for onboarding flows, questionnaires, or any full-screen experience.
              </p>
            </Card>
          </div>
        </FullScreenOverlay>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[var(--color-charcoal)] dark:text-white mb-4">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

function ComponentDemo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
        {label}
      </div>
      <div className="flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
