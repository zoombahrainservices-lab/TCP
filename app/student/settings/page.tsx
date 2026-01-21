import { requireAuth } from '@/lib/auth/guards'
import Card from '@/components/ui/Card'

export default async function SettingsPage() {
  const user = await requireAuth('student')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      <Card>
        <div className="p-6">
          <p className="text-gray-600">Settings page coming soon...</p>
        </div>
      </Card>
    </div>
  )
}
