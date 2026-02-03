import React from 'react'

const FOLLOW_THROUGH_IMAGES = '/slider-work-on-quizz/chapter1/follow%20through'
// Bump this when you replace any image (e.g. 90days.png) so the new file loads instead of cache
const IMAGE_VERSION = 2
const img = (path: string) => `${path}?v=${IMAGE_VERSION}`

export type FollowThroughScreen = {
  id: string
  title: string
  sectionNumber?: number
  image?: string
  body: React.ReactNode
  yourTurn?: string
}

export const followThroughScreens: FollowThroughScreen[] = [
  {
    id: 'your-moment',
    title: 'YOUR MOMENT',
    sectionNumber: 1,
    image: img(`${FOLLOW_THROUGH_IMAGES}/m1.png`),
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom&apos;s story isn&apos;t about superhuman willpower. It&apos;s about one Tuesday when he decided who he&apos;d been wasn&apos;t who he wanted to become.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Some of you will bookmark this and come back when ready. That&apos;s fine.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          But if you&apos;re feeling that pull right now—that voice saying &ldquo;maybe I could actually do this&rdquo;—don&apos;t ignore it.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 font-bold mb-2">Pick ONE thing:</p>
        <ul className="list-disc list-inside text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 space-y-1">
          <li>Write your identity statement in phone notes</li>
          <li>Text one person for weekly check-ins</li>
          <li>Delete one app that takes more than it gives</li>
        </ul>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Not all three. Just one.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          The rest of this book will be here. But if you&apos;re ready now? Move. Don&apos;t let this feeling fade.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed font-semibold">
          In six months, you&apos;ll either wish you&apos;d started today, or you&apos;ll be glad you did. Your call.
        </p>
      </>
    ),
    yourTurn: 'Pick one thing. Start now.'
  },
  {
    id: 'real-conversations',
    title: 'BRING OTHERS IN — Real Conversations',
    sectionNumber: 2,
    image: img(`${FOLLOW_THROUGH_IMAGES}/realconversation.png`),
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 font-semibold">
          To Parents:
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 italic">
          &ldquo;My phone&apos;s messing with [thing I care about]. I want to fix it but need help. Can we set rules together? Phone in kitchen at night, phone-free study time? I know I fought you before, but this time it&apos;s my idea.&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 font-semibold">
          To Friends:
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 italic">
          &ldquo;Gonna be less online. Getting back into [your thing]. Still wanna hang—maybe [non-screen activity]? Call me out if I&apos;m zombie-scrolling?&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 font-semibold">
          To Yourself:
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed italic">
          &ldquo;This feeling passes in 5 minutes. What would future-me do right now?&rdquo;
        </p>
      </>
    ),
    yourTurn: "Don't do this alone. Use these scripts when you're ready."
  },
  {
    id: 'the-comeback',
    title: 'THE COMEBACK',
    sectionNumber: 3,
    image: img(`${FOLLOW_THROUGH_IMAGES}/cb.png`),
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Six months later, same competition. Same venue.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom walked on stage, phone forgotten in his pocket.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 italic">
          &ldquo;I want to tell you about the day I chose a screen over my dreams, and what happened when I chose my dreams back.&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Seven minutes of truth. The shame. The hollow hours. The fear. The small daily choices.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Three seconds of silence. Then applause.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 font-semibold">
          Second place. But more importantly—proof he could come back.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Tom today at sixteen: Volunteers as peer mentor. Chain hit 247 links. Placed third at states.
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 italic">
          &ldquo;My phone&apos;s a tool now, not my personality. I use it. It doesn&apos;t use me.&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4">
          Three months later, fourteen-year-old Layla found him: &ldquo;That chain thing—did it work?&rdquo;
        </p>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed">
          Tom showed her everything. That night he realized: his recovery gave him new purpose. The student became the teacher.
        </p>
      </>
    )
  },
  {
    id: 'when-you-mess-up',
    title: 'WHEN YOU MESS UP — Recovery Mode',
    sectionNumber: 3,
    image: img(`${FOLLOW_THROUGH_IMAGES}/When%20you%20mess%20up.png`),
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 font-bold mb-3">24-Hour Rule:</p>
        <ol className="list-decimal list-inside text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 space-y-2">
          <li>Stop spiral NOW</li>
          <li>Ask: What triggered this?</li>
          <li>Fix the leak in your system</li>
          <li>Get back in within 24 hours</li>
          <li>Tell your accountability person</li>
        </ol>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed font-semibold">
          Tom broke his streak twice. He still made it.
        </p>
      </>
    ),
    yourTurn: 'When you slip, use the 24-Hour Rule. Then get back in.'
  },
  {
    id: '90-day-plan',
    title: 'YOUR PATH — 90-Day Plan',
    sectionNumber: 4,
    image: img(`${FOLLOW_THROUGH_IMAGES}/90days.png`),
    body: (
      <>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 font-bold mb-2">WEEKS 1–3: Awareness</p>
        <ul className="list-disc list-inside text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 space-y-1">
          <li>Week 1: Track usage. Don&apos;t change yet</li>
          <li>Week 2: Write identity statement. Make it visible</li>
          <li>Week 3: Pick micro-commitment. Tell someone</li>
        </ul>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 font-bold mb-2">WEEKS 4–9: Build</p>
        <ul className="list-disc list-inside text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed mb-4 space-y-1">
          <li>Use substitution moves</li>
          <li>Start visual tracker</li>
          <li>Find accountability partner</li>
          <li>Increase commitment gradually (add 5 min every 2 weeks)</li>
        </ul>
        <p className="text-[var(--color-charcoal)] dark:text-gray-200 font-bold mb-2">WEEKS 10–13: Level Up</p>
        <ul className="list-disc list-inside text-[var(--color-charcoal)] dark:text-gray-200 leading-relaxed space-y-1">
          <li>Reconnect with community</li>
          <li>Share your story</li>
          <li>Set public goal</li>
          <li>Teach someone else</li>
        </ul>
      </>
    ),
    yourTurn: 'Where this goes over 90 days. Start with Week 1.'
  }
]
