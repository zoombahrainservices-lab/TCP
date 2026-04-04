import type { Metadata } from 'next'
import { MarketingSubPageShell } from '@/components/landing/MarketingSubPageShell'

export const metadata: Metadata = {
  title: 'About TCP | The Communication Protocol',
  description:
    'Why most people struggle with communication—and how TCP gives you a clear, practical system you can use every day.',
}

export default function AboutPage() {
  return (
    <MarketingSubPageShell>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#ff6a38] mb-8 uppercase tracking-tight">
        About TCP
      </h1>

      <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Most people don&apos;t fail because they&apos;re not smart.
          <br />
          They fail because they don&apos;t know how to communicate.
        </p>

        <p>
          Nobody teaches you how to say things clearly.
          <br />
          How to express what you mean without sounding awkward, emotional, or misunderstood.
          <br />
          How to handle pressure in conversations that actually matter.
        </p>

        <p>
          So people guess.
          <br />
          They overthink messages.
          <br />
          They say the wrong thing at the wrong time.
          <br />
          And it quietly costs them opportunities — in school, work, and relationships.
        </p>

        <p className="font-semibold text-[#142A4A] dark:text-white">TCP exists to fix that.</p>

        <p>
          We built TCP to give people something they&apos;ve never had before:
          <br />
          <span className="font-semibold text-[#142A4A] dark:text-white">
            a clear, practical system for communication.
          </span>
        </p>

        <p>
          Not motivation. Not theory.
          <br />A system you can actually use — every day.
        </p>

        <p>
          Because communication isn&apos;t talent.
          <br />
          <span className="font-semibold text-[#142A4A] dark:text-white">It&apos;s a skill.</span>
          <br />
          And once you learn it, everything changes.
        </p>
      </div>
    </MarketingSubPageShell>
  )
}
