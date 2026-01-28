\"use client\"

import { useState } from "react"
import { NeonCard } from "@/components/neon-card"
import Button from "@/components/ui/Button"

const HERO_TITLE = "THE LIE THAT CAUGHT UP"
const HERO_SUBTITLE =
  "Jamie was mid-story when she realized she'd painted herself into a corner."

const SCREENS: string[] = [
  // Screen 1
  `"So yeah, I basically organized this whole charity fundraiser last summer.
We raised like $10,000 for the animal shelter.
It was insane—had to coordinate with the mayor's office, get permits, the whole thing."

Her new college friends looked impressed.

"That's amazing! Do you have photos?"

Jamie's stomach dropped.

"Oh, uh... I didn't really take any.
I was too busy running everything."`,

  // Screen 2
  `"What shelter was it for?
My cousin volunteers at one nearby."

"It was... a different town.
Where I used to live."

The questions kept coming.
Jamie kept improvising.

Each answer led to another question,
another detail she had to remember,
another layer to a story that had started with a small exaggeration
and spiraled into a complete fabrication.`,

  // Screen 3
  `The truth?
She'd attended a fundraiser.
She'd helped set up chairs for like an hour.
That was it.

Two weeks later, someone from her hometown joined their friend group.

Within one conversation, it became clear:
Jamie's charity story was fiction.

The friend group didn't confront her directly.
They just... got quieter around her.
Less inviting.
More distant.

Jamie had talked herself into loneliness.`,

  // Screen 4
  `HOW IT STARTED

Jamie wasn't a malicious liar.
She was just... really good at talking.
Always had been.

Could charm teachers out of late penalties.
Could make boring stories sound exciting.
Could walk into any social situation and have people laughing within minutes.

But somewhere along the way, talking became performing.
And performing meant making herself sound more interesting than she felt she actually was.`,

  // Screen 5
  `Small exaggerations became bigger ones:

• "I play guitar" became "I've played in some local bands"
• "I'm interested in photography" became "I do freelance photography work"
• "I helped with a fundraiser" became "I organized a major charity event"

Each exaggeration felt harmless in the moment.
Made her seem cooler, more accomplished, more worth knowing.

The problem?
She couldn't keep her stories straight.
And eventually, people noticed.`,

  // Screen 6
  `WHAT NOBODY TELLS YOU ABOUT IMPULSE COMMUNICATION

After the fundraiser lie imploded, Jamie talked to her school counselor about why she kept doing this.

Dr. Bella DePaulo, a psychologist who studies lying, found that most people tell 1-2 lies per day on average,
but some people—particularly those who are highly social—tell significantly more.

These aren't usually malicious lies.
They're self-enhancement lies:
making yourself seem more interesting, accomplished, or connected.`,

  // Screen 7
  `Research from the University of Massachusetts found that 60% of people can't have a 10-minute conversation without lying at least once.

Usually small stuff:
exaggerating achievements,
pretending to know things they don't,
agreeing with opinions they don't hold.

But here's the critical finding:
A study from the Journal of Personality tracked habitual exaggerators over time
and found that people who regularly embellish create what psychologists call "impression management fatigue"—
they have to work constantly to remember what they've said to whom.`,

  // Screen 8
  `This creates anxiety
and makes genuine connection nearly impossible.

Jamie realized:
Every time she exaggerated, she was building a version of herself she had to maintain.
And that version was exhausting.

The truth:
Being interesting isn't about having impressive stories.
It's about telling real stories in interesting ways.`,
]

export default function StoryTestPage() {
  const [index, setIndex] = useState(0)

  const totalScreens = SCREENS.length

  const handleNext = () => {
    setIndex((prev) => Math.min(prev + 1, totalScreens - 1))
  }

  const handleBack = () => {
    setIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        {/* Hero area */}
        <NeonCard color="blue" className="shadow-xl">
          <div className="flex flex-col gap-2 px-4 py-5 sm:px-6 sm:py-6 bg-slate-900">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
              MICRO-STORY TEST
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-100">
              {HERO_TITLE}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1">
              {HERO_SUBTITLE}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Screen {index + 1} of {totalScreens}
            </p>
          </div>
        </NeonCard>

        {/* Text + navigation area */}
        <NeonCard color="green" className="shadow-xl">
          <div className="flex flex-col h-[60vh] max-h-[520px] bg-slate-900 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex-1 overflow-y-auto pr-1">
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-50">
                {SCREENS[index]}
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleBack}
                disabled={index === 0}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleNext}
                disabled={index === totalScreens - 1}
                glow
              >
                {index === totalScreens - 1 ? "Done" : "Next"}
              </Button>
            </div>
          </div>
        </NeonCard>
      </div>
    </main>
  )
}

