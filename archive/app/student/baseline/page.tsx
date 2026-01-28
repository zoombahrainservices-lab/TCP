import { requireAuth } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { getZones } from '@/app/actions/zones'
import { getChaptersByZone } from '@/app/actions/chapters'

export default async function FoundationPage() {
  const user = await requireAuth('student')
  
  // Redirect to Zone 1, Chapter 1 after baseline completion
  const zones = await getZones()
  const zone1 = zones.find(z => z.zone_number === 1)
  if (zone1) {
    const chapters = await getChaptersByZone(zone1.id)
    const chapter1 = chapters.find(c => c.chapter_number === 1)
    if (chapter1) {
      redirect(`/student/chapter/${chapter1.id}`)
    }
  }
  
  // Fallback to dashboard
  redirect('/student')
}
