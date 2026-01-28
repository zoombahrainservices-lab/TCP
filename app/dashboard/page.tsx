import Card from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to TCP
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your dashboard is being built. Check back soon!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600">
              New features and content are on the way.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mobile App
            </h3>
            <p className="text-gray-600">
              iOS and Android apps coming soon.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Stay Tuned
            </h3>
            <p className="text-gray-600">
              Something amazing is in the works.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
