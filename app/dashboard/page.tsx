import Link from 'next/link'
import Card from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chapter 1 CTA */}
        <Card className="mb-8 overflow-hidden bg-gradient-to-br from-[var(--color-blue)]/10 to-[var(--color-amber)]/10 border-2 border-[var(--color-amber)]">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-[var(--color-amber)] text-[var(--color-charcoal)] text-xs font-bold uppercase rounded-full mb-3">
                  Start Here
                </div>
                <h2 className="headline-lg text-[var(--color-charcoal)] dark:text-white mb-3">
                  CONTINUE WITH CHAPTER 1
                </h2>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
                  From Stage Star to Silent Struggles - Begin your journey into effective communication
                </p>
                <Link 
                  href="/read/chapter-1"
                  className="inline-block px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg"
                >
                  Start Chapter 1
                </Link>
              </div>
              <div className="flex-shrink-0 text-8xl">
                📖
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to TCP
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your dashboard is being built. Check back soon!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              New features and content are on the way.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Mobile App
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              iOS and Android apps coming soon.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Stay Tuned
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Something amazing is in the works.
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  )
}
