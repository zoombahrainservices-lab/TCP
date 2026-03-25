import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { getChapterReportsData } from '@/app/actions/gamification'
import { getCurrentChapterFromReports } from '@/lib/dashboard/cache.server'

export async function GET() {
  const user = await requireAuth()

  const [publishedChapters, reports] = await Promise.all([
    getCachedAllChapters(),
    getChapterReportsData(user.id),
  ])

  const currentChapterNumber = getCurrentChapterFromReports(
    Array.isArray(publishedChapters) ? publishedChapters : [],
    Array.isArray(reports) ? reports : []
  )

  const chapters = (Array.isArray(publishedChapters) ? publishedChapters : []).map((ch: any) => {
    const chapterNumber = Number(ch.chapter_number) || 0
    const slug = typeof ch.slug === 'string' && ch.slug.trim().length > 0 ? ch.slug.trim() : `chapter-${chapterNumber}`
    const title = typeof ch.title === 'string' && ch.title.trim().length > 0 ? ch.title.trim() : `Chapter ${chapterNumber}`

    return {
      chapterNumber,
      slug,
      title,
      isUnlocked: chapterNumber > 0 && chapterNumber <= currentChapterNumber,
      isCurrent: chapterNumber === currentChapterNumber,
    }
  })

  return NextResponse.json({
    currentChapterNumber,
    chapters,
  })
}

