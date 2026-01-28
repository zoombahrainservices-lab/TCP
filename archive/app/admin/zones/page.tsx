import { requireAuth } from '@/lib/auth/guards'
import { getZones } from '@/app/actions/zones'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function AdminZonesPage() {
  await requireAuth('admin')
  
  const zones = await getZones()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Zones</h1>
          <p className="text-gray-600">{zones.length} zones configured</p>
        </div>
        <Button>+ Create Zone</Button>
      </div>

      <div className="space-y-4">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{zone.icon || '🔷'}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-500">
                    Zone {zone.zone_number}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: zone.color ? `${zone.color}20` : undefined,
                      color: zone.color || undefined,
                    }}
                  >
                    {zone.color}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{zone.name}</h3>
                {zone.description && (
                  <p className="text-sm text-gray-600">{zone.description}</p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Unlock: {zone.unlock_condition}
                </div>
              </div>
              <div>
                <Link href={`/admin/zones/${zone.id}`}>
                  <Button variant="secondary" size="sm">
                    Edit Zone
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {zones.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-gray-600 mb-4">No zones found.</p>
            <p className="text-sm text-gray-500">
              Run migration 106 to seed the 5 default zones.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
