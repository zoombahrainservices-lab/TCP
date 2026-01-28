'use client'

interface ScoreBand {
  min: number
  max: number
  label: string
  description: string
  color: 'blue' | 'amber' | 'orange' | 'red'
}

interface ScoreReportProps {
  title?: string
  bands: ScoreBand[]
}

const colorMap = {
  blue: 'var(--color-blue)',
  amber: 'var(--color-amber)',
  orange: 'var(--color-amber)', // Using amber for orange
  red: 'var(--color-red)',
}

export default function ScoreReport({ title = "SCORE:", bands }: ScoreReportProps) {
  return (
    <div className="border-2 border-[var(--color-charcoal)] rounded-lg p-6 bg-white">
      <h3 className="headline text-2xl mb-6 text-[var(--color-charcoal)]">
        {title}
      </h3>
      <div className="space-y-4">
        {bands.map((band, index) => (
          <div key={index} className="flex gap-4 items-start">
            {/* Vertical colored bar */}
            <div 
              className="w-1.5 h-full min-h-[3rem] rounded-full flex-shrink-0"
              style={{ backgroundColor: colorMap[band.color] }}
            />
            {/* Text content */}
            <div className="flex-1 py-1">
              <span className="font-bold text-[var(--color-charcoal)]">
                {band.label}:
              </span>{' '}
              <span className="text-[var(--color-charcoal)]">
                {band.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Default bands for Day 1 self-check
export const defaultDay1Bands: ScoreBand[] = [
  { min: 7, max: 14, label: '7–14', description: "You're good", color: 'blue' },
  { min: 15, max: 28, label: '15–28', description: 'Danger zone—start SPARK now', color: 'amber' },
  { min: 29, max: 42, label: '29–42', description: "Tom's starting point—recovery possible", color: 'orange' },
  { min: 43, max: 49, label: '43–49', description: 'Talk to school counselor or trusted adult', color: 'red' },
]
