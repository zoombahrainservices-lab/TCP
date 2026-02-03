import React from 'react'

const TECHNIQUE_IMAGES = '/slider-work-on-quizz/chapter1/technique'

export type TechniqueScreen = {
  id: number
  title: string
  image: string
  body: React.ReactNode
  yourTurn?: string
}

export const techniqueScreens: TechniqueScreen[] = [
  {
    id: 1,
    title: '#1: Substitution Game',
    image: `${TECHNIQUE_IMAGES}/Substitution%20Game.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom&apos;s three moves when reaching for his phone:
        </p>
        <ol className="list-decimal list-inside text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 space-y-2">
          <li>Read one page from a great speech (pocket copy)</li>
          <li>Do 20 push-ups (disrupts mental loops)</li>
          <li>Voice-memo a story idea</li>
        </ol>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed font-semibold">
          Key: Easier than unlocking his phone.
        </p>
      </>
    ),
    yourTurn: 'Pick three easy alternatives. Write them in notes app now.'
  },
  {
    id: 2,
    title: '#2: The "Later" Technique',
    image: `${TECHNIQUE_IMAGES}/The%20Later%20Technique.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Not &ldquo;I won&apos;t watch TikTok.&rdquo; Instead: &ldquo;I can watch after dinner, but right now I&apos;m choosing to practice.&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
          Brain doesn&apos;t feel deprived with &ldquo;later.&rdquo;
        </p>
      </>
    )
  },
  {
    id: 3,
    title: '#3: Change Your Environment',
    image: `${TECHNIQUE_IMAGES}/Change%20Your%20Environment.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom&apos;s phone charged in the kitchen overnight. Speech notes where phone used to sit. Trophies on his desk.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Environmental changes reduce bad habits <strong>80%</strong> without willpower.
        </p>
      </>
    ),
    yourTurn: 'Tonight—charge phone outside your bedroom.'
  },
  {
    id: 4,
    title: '#4: Visual Progress',
    image: `${TECHNIQUE_IMAGES}/Visual%20Progress.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom made a paper chain. Every 10-minute practice = one link.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          By day 30, it wrapped his room. Physical proof: &ldquo;I&apos;m someone who shows up.&rdquo;
        </p>
      </>
    ),
    yourTurn: "Paper chain, calendar X's, marble jar—make progress visible."
  }
]
