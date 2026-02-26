import { requireAuth } from '@/lib/auth/guards'
import { getCachedChapterBundleAdmin, getCachedStepPages } from '@/lib/content/cache.server'
import { redirect } from 'next/navigation'
import DynamicStepClient from '@/app/read/[chapterSlug]/[stepSlug]/DynamicStepClient'

export default async function AdminPreviewPage({
  params,
}: {
  params: Promise<{ chapterSlug: string; stepSlug: string }>
}) {
  // Require admin authentication
  await requireAuth('admin')

  const { chapterSlug, stepSlug } = await params

  // Fetch chapter bundle (no is_published filter for admin)
  const bundle = await getCachedChapterBundleAdmin(chapterSlug)

  if (!bundle) {
    redirect('/admin/chapters')
  }

  const { chapter, steps } = bundle

  // Find the requested step
  const step = steps.find((s: any) => s.slug === stepSlug)
  if (!step) {
    redirect('/admin/chapters')
  }

  // Find the current step index
  const currentStepIndex = steps.findIndex((s: any) => s.slug === stepSlug)
  const nextStep = steps[currentStepIndex + 1]

  const pages = await getCachedStepPages(step.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Preview Banner */}
      <div className="bg-amber-600 text-white text-center py-2 text-sm font-medium">
        ADMIN PREVIEW MODE - This is a draft preview
      </div>

      {/* Render the step using the actual reader component */}
      <DynamicStepClient
        chapter={chapter}
        step={step}
        pages={pages}
        nextStepSlug={nextStep?.slug || null}
      />
    </div>
  )
}
