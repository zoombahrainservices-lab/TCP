import { requireAuth } from '@/lib/auth/guards'
import { getZones } from '@/app/actions/zones'
import { getZoneProgress } from '@/app/actions/zones'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'

export default async function MissionsPage() {
  const user = await requireAuth('student')
  
  const zones = await getZones()
  const zonesWithProgress = await Promise.all(
    zones.map(async (zone) => {
      const progress = await getZoneProgress(user.id, zone.id)
      return { ...zone, progress }
    })
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Missions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zonesWithProgress.map((zone) => (
          <Link key={zone.id} href={`/student/zone/${zone.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Zone {zone.zone_number}: {zone.name}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {zone.description}
                </p>
                {zone.progress && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{zone.progress.completedChapters} / {zone.progress.totalChapters} missions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${zone.progress.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
