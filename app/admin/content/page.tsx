import { redirect } from 'next/navigation'

/**
 * Legacy admin content route - redirects to the new chapter management.
 * Kept so Next.js build and any old links continue to work.
 */
export default function AdminContentPage() {
  redirect('/admin/chapters')
}
