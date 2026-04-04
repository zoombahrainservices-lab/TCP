'use client'

import type { ReactNode } from 'react'

type TcpFiveWOneHProps = {
  /** Slightly larger type on the dedicated /how-it-works page */
  variant?: 'page' | 'section'
  /** Landing preview: show only first N blocks (e.g. 4). Omit for full list on /how-it-works */
  maxSections?: number
}

function buildSections(): { title: string; content: ReactNode }[] {
  return [
    {
      title: 'What is TCP?',
      content: (
        <p>
          TCP is how you stop sounding unclear online and start communicating like someone people actually respect.
        </p>
      ),
    },
    {
      title: 'Why does it exist?',
      content: (
        <p>
          Because nobody taught you how to talk, text, argue, or express yourself properly—and it&apos;s costing you
          opportunities every single day.
        </p>
      ),
    },
    {
      title: 'Who is it for?',
      content: (
        <p>
          If you&apos;re a student, young professional, or just someone trying to not mess up conversations… this is
          for you.
        </p>
      ),
    },
    {
      title: 'Where do you use it?',
      content: (
        <>
          <p className="font-semibold text-[#142A4A] dark:text-white">Everywhere.</p>
          <p>DMs. Emails. School. Work. Relationships.</p>
          <p>If you&apos;re typing or talking—you&apos;re using TCP.</p>
        </>
      ),
    },
    {
      title: 'When do you use it?',
      content: (
        <>
          <ul className="list-disc list-inside space-y-2 pl-0.5">
            <li>When you&apos;re about to send that risky message.</li>
            <li>When you&apos;re emotional.</li>
            <li>When it actually matters.</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 italic">(So… basically all the time.)</p>
        </>
      ),
    },
    {
      title: 'How does it work?',
      content: (
        <>
          <p className="font-semibold text-[#142A4A] dark:text-white">
            We don&apos;t give you motivation.
            <br />
            We give you a system.
          </p>
          <p className="font-semibold text-[#142A4A] dark:text-white pt-2">Step-by-step frameworks that train you to:</p>
          <ul className="list-disc list-inside space-y-2 pl-0.5">
            <li>Think before you speak</li>
            <li>Say things clearly</li>
            <li>Control how people understand you</li>
          </ul>
        </>
      ),
    },
  ]
}

export function TcpFiveWOneH({ variant = 'section', maxSections }: TcpFiveWOneHProps) {
  const titleClass =
    variant === 'page'
      ? 'text-xl sm:text-2xl font-bold text-[#ff6a38] uppercase tracking-tight'
      : 'text-lg sm:text-xl font-bold text-[#ff6a38] uppercase tracking-tight'

  const bodyClass =
    variant === 'page'
      ? 'text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-3'
      : 'text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-3'

  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="space-y-3">
      <h3 className={titleClass}>{title}</h3>
      <div className={bodyClass}>{children}</div>
    </section>
  )

  const all = buildSections()
  const visible =
    maxSections != null && maxSections > 0 ? all.slice(0, maxSections) : all

  return (
    <div className="space-y-10 sm:space-y-12">
      {visible.map((item) => (
        <Section key={item.title} title={item.title}>
          {item.content}
        </Section>
      ))}
    </div>
  )
}
