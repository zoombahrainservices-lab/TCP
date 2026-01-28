import { requireAuth } from '@/lib/auth/guards'
import { getAllDailyRecords } from '@/app/actions/student'
import TrophyCase from '@/components/student/TrophyCase'
import FieldJournal from '@/components/student/FieldJournal'
import GrowthChart from '@/components/student/GrowthChart'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function VaultPage() {
  const user = await requireAuth('student')
  const records = await getAllDailyRecords(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="headline-xl text-[var(--color-charcoal)] mb-2">Agent's Vault</h1>
          <p className="text-[var(--color-gray)]">Your achievements, reflections, and growth journey</p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trophy Case */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="headline-md text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                Trophy Case
              </h2>
              <TrophyCase records={records} />
            </Card>
          </div>

          {/* Field Journal */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="headline-md text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
                <span className="text-2xl">📓</span>
                Field Journal
              </h2>
              <FieldJournal records={records} />
            </Card>
          </div>

          {/* Growth Chart */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="headline-md text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Growth Chart
              </h2>
              <GrowthChart records={records} />
            </Card>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link href="/student">
            <Button variant="secondary">
              ← Back to Command Center
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
