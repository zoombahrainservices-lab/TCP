import { redirect } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { getSession } from '@/lib/auth/guards'

export default async function Home() {
  // Check if user is authenticated
  const session = await getSession()

  // Redirect authenticated users to their dashboard
  if (session?.role === 'student') {
    redirect('/student')
  }

  if (session?.role === 'parent') {
    redirect('/parent')
  }

  if (session?.role === 'mentor') {
    redirect('/mentor')
  }

  if (session?.role === 'admin') {
    redirect('/admin')
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">The Communication Protocol</h1>
          <Link href="/auth/login">
            <Button variant="secondary">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            Master Communication
            <span className="text-blue-600"> in 30 Days</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            A structured 30-day program for teenagers to develop essential communication skills through daily chapters, real-world tasks, and self-reflection.
          </p>
          
          <div className="mt-10 flex gap-4 justify-center">
            <Link href="/auth/register-parent">
              <Button size="lg">Get Started as Parent</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">Login</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Chapters</h3>
            <p className="text-gray-600">
              Read a new chapter each day covering essential communication skills from first impressions to conflict resolution.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-World Tasks</h3>
            <p className="text-gray-600">
              Complete practical communication tasks with audio, photo, or text submissions to apply what you learn.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Parents can monitor their children's progress, view submissions, and celebrate achievements throughout the journey.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h4 className="font-semibold text-gray-900 mb-2">Read</h4>
              <p className="text-gray-600 text-sm">Read the daily chapter on a communication topic</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h4 className="font-semibold text-gray-900 mb-2">Act</h4>
              <p className="text-gray-600 text-sm">Complete a real-world communication task</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h4 className="font-semibold text-gray-900 mb-2">Upload</h4>
              <p className="text-gray-600 text-sm">Submit proof via audio, photo, or text</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h4 className="font-semibold text-gray-900 mb-2">Reflect</h4>
              <p className="text-gray-600 text-sm">Self-assess and reflect on your growth</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 bg-blue-600 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Communication Skills?</h3>
          <p className="text-blue-100 mb-8 text-lg">Join families already mastering the art of communication</p>
          <Link href="/auth/register-parent">
            <Button size="lg" variant="secondary">Start Your 30-Day Journey</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2026 The Communication Protocol. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
