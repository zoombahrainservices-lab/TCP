'use client'

import Link from 'next/link'

interface PageLink {
  title: string
  path: string
  description: string
  category: 'Public' | 'Auth' | 'Dashboard' | 'Learning' | 'Design System'
  status?: 'Live' | 'Testing' | 'To Delete' | 'Archive'
}

const pages: PageLink[] = [
  // Public Pages
  {
    title: 'Landing Page',
    path: '/',
    description: 'Main landing page with hero, product showcase (neuroscience section), problem, how it works, features, and CTA sections',
    category: 'Public',
    status: 'Live'
  },
  
  // Auth Pages
  {
    title: 'Login',
    path: '/auth/login',
    description: 'User login page',
    category: 'Auth',
    status: 'Live'
  },
  {
    title: 'Register',
    path: '/auth/register',
    description: 'User registration page',
    category: 'Auth',
    status: 'Live'
  },
  
  // Learning Pages
  {
    title: 'Onboarding',
    path: '/onboarding',
    description: 'User onboarding flow',
    category: 'Learning',
    status: 'Live'
  },
  {
    title: 'Chapter 1',
    path: '/chapter/1',
    description: 'Chapter 1 learning interface',
    category: 'Learning',
    status: 'Live'
  },
  {
    title: 'Chapter 1 Reading',
    path: '/read/chapter-1',
    description: 'Chapter 1 reading content',
    category: 'Learning',
    status: 'Live'
  },
  
  // Dashboard Pages
  {
    title: 'Main Dashboard',
    path: '/dashboard',
    description: 'User dashboard home',
    category: 'Dashboard',
    status: 'Live'
  },
  {
    title: 'Components Library',
    path: '/dashboard/components',
    description: 'Original components showcase',
    category: 'Dashboard',
    status: 'Live'
  },
  
  // Design System & Testing
  {
    title: 'Duo Components',
    path: '/dashboard/duo-components',
    description: 'Duolingo-style UI components showcase (DuoCard, DuoButton, ProgressCircle, DuoCharacter)',
    category: 'Design System',
    status: 'Testing'
  },
  {
    title: 'Font Test',
    path: '/dashboard/font-test',
    description: 'Font variations testing page for landing page titles',
    category: 'Design System',
    status: 'Testing'
  },
  {
    title: 'Branding',
    path: '/dashboard/branding',
    description: 'Brand guidelines and assets',
    category: 'Design System',
    status: 'Live'
  },
  {
    title: 'Colors',
    path: '/dashboard/colors',
    description: 'Color palette reference',
    category: 'Design System',
    status: 'Live'
  },
  {
    title: 'Typography',
    path: '/dashboard/typography',
    description: 'Typography system reference',
    category: 'Design System',
    status: 'Live'
  },
]

const statusColors = {
  'Live': 'bg-[#0073ba] text-white',
  'Testing': 'bg-[#ff6a38] text-white',
  'To Delete': 'bg-[#ff3d3d] text-white',
  'Archive': 'bg-[var(--color-gray)] text-white'
}

const categoryColors = {
  'Public': 'border-l-[#0073ba]',
  'Auth': 'border-l-[#ff6a38]',
  'Dashboard': 'border-l-[#142A4A]',
  'Learning': 'border-l-[#ff3d3d]',
  'Design System': 'border-l-[var(--color-amber)]'
}

export default function PagesDirectory() {
  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-[var(--color-charcoal)] mb-4">
            Pages Directory
          </h1>
          <p className="text-xl text-[var(--color-gray)] mb-6">
            Central hub for all UI/UX pages in the TCP platform.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/dashboard"
              className="px-4 py-2 bg-[var(--color-charcoal)] text-white rounded-lg hover:opacity-80 transition"
            >
              ← Back to Dashboard
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 bg-[#0073ba] text-white rounded-lg hover:opacity-80 transition"
            >
              View Landing Page
            </Link>
          </div>
        </div>

        {/* Simple Table */}
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-charcoal)] text-white">
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">Page Name</th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">Description</th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">Link</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, index) => (
                <tr 
                  key={page.path}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-[var(--color-charcoal)]">
                      {page.title}
                    </div>
                    <div className="text-xs text-[var(--color-gray)] mt-1">
                      {page.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--color-gray)]">
                    {page.description}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={page.path}
                      className="text-[#0073ba] hover:underline font-mono text-sm"
                    >
                      {page.path}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mt-8 text-sm text-[var(--color-gray)]">
          <p>
            <strong>Note:</strong> Testing pages can be archived once design decisions are finalized. 
            Role-based access control will be added in the future.
          </p>
        </div>
      </div>
    </div>
  )
}
