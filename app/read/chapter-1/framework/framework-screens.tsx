import React from 'react'

export const FRAMEWORK_IMAGES = '/slider-work-on-quizz/chapter1/frameworks'

export type FrameworkScreen = {
  id: string
  title: string
  letter?: string
  image?: string
  body: React.ReactNode
  yourTurn?: string
  promptKey?: string
}

export const frameworkScreens: FrameworkScreen[] = [
  {
    id: 'intro',
    title: 'THE SPARK FRAMEWORK',
    image: `${FRAMEWORK_IMAGES}/spark.png`,
    body: (
      <p className="text-lg sm:text-xl text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
        Tom used a system called SPARK—five steps that actually work:
      </p>
    )
  },
  {
    id: 's',
    letter: 'S',
    title: 'SURFACE the Pattern',
    image: `${FRAMEWORK_IMAGES}/s.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom tracked phone usage for one week: <strong>6.5 hours daily</strong>. That&apos;s 195 hours monthly on his phone vs. 2 hours practicing.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 italic">
          &ldquo;Almost 200 hours scrolling. Two hours on what I care about. That&apos;s not who I want to be.&rdquo;
        </p>
      </>
    ),
    yourTurn: 'Settings → Screen Time (iPhone) or Digital Wellbeing (Android). Look at your daily average. Don\'t judge. Just look.',
    promptKey: 'ch1_framework_s_surface'
  },
  {
    id: 'p',
    letter: 'P',
    title: 'PINPOINT the Why',
    image: `${FRAMEWORK_IMAGES}/p.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom&apos;s dad asked: &ldquo;Why&apos;d you stop caring about speaking?&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          After silence: &ldquo;What if I&apos;m not actually that good? What if I disappoint everyone? At least on my phone, I don&apos;t have to find out.&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
          The phone was escape from performance anxiety.
        </p>
      </>
    ),
    yourTurn: '"When I reach for my phone, I\'m usually avoiding feeling..."',
    promptKey: 'ch1_framework_p_pinpoint'
  },
  {
    id: 'a',
    letter: 'A',
    title: 'ANCHOR to Identity',
    image: `${FRAMEWORK_IMAGES}/a.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Stanford research: Identity-based motivation is <strong>3x more effective</strong> than goals.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom wrote: &ldquo;I am a storyteller who makes people feel less alone.&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Not &ldquo;I want to be.&rdquo; <strong>&ldquo;I AM.&rdquo;</strong>
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
          Stuck it on his mirror. Read it every morning. Sounds corny. Worked.
        </p>
      </>
    ),
    yourTurn: '"I am a [identity] who [impact]." Write it somewhere visible.',
    promptKey: 'ch1_framework_a_anchor'
  },
  {
    id: 'r',
    letter: 'R',
    title: 'REBUILD with Micro-Commitments',
    image: `${FRAMEWORK_IMAGES}/r.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom started with <strong>five minutes</strong>, three times that week. That&apos;s it.
        </p>
        <ul className="list-disc list-inside text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 space-y-2">
          <li><strong>Week 1:</strong> 5 minutes, 3 days</li>
          <li><strong>Week 2:</strong> 10 minutes, 4 days</li>
          <li><strong>Week 3:</strong> Watch open mic (don&apos;t perform)</li>
          <li><strong>Week 4:</strong> One story at family dinner</li>
        </ul>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
          Stanford found &ldquo;tiny habits&rdquo; are <strong>400% more likely</strong> to stick than big goals.
        </p>
      </>
    ),
    yourTurn: 'Pick ONE thing. 5–10 minutes max. Three times this week.',
    promptKey: 'ch1_framework_r_rebuild'
  },
  {
    id: 'day23',
    title: 'Day 23—He Almost Quit',
    image: `${FRAMEWORK_IMAGES}/day23.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Terrible day. Failed math test. Fight with his best friend. Came home exhausted.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Phone right there. Just one video.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Unlocked it. YouTube loaded. Finger hovering.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Then—his lock screen. Photo of himself at eleven, mid-speech, lit up.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          He closed YouTube. Voice-recorded a story about his day. Added link #24 to his paper chain.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed font-semibold">
          Almost relapsing ≠ relapsing.
        </p>
      </>
    )
  },
  {
    id: 'k',
    letter: 'K',
    title: 'KINDLE Community',
    image: `${FRAMEWORK_IMAGES}/k.png`,
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom reconnected with debate team. Asked his cousin Alex to be his accountability partner. Started attending open mics.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
          Being around people who cared reminded his brain why this mattered.
        </p>
      </>
    ),
    yourTurn: 'Text ONE person right now. Tell them what you\'re working on. Ask for weekly check-ins.',
    promptKey: 'ch1_framework_k_kindle'
  }
]
