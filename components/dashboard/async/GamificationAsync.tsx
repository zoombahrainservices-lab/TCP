import { getGamificationData } from '@/app/actions/gamification'
import { getLevelThreshold } from '@/lib/gamification/math'
import TopHero from '@/components/dashboard/TopHero'

interface Props {
  userId: string
  userName: string
  continueHref: string
  continueLabel: string
}

export default async function GamificationAsync({ 
  userId, 
  userName, 
  continueHref, 
  continueLabel 
}: Props) {
  const { data: gamificationData, error: gamificationError } = await getGamificationData(userId)
  
  const totalXP = gamificationData?.total_xp ?? 0
  const level = gamificationData?.level ?? 1
  const levelThreshold = getLevelThreshold(level + 1)

  return (
    <>
      {/* Gamification Error Banner */}
      {gamificationError && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-5">
          <p className="font-bold text-red-800">Gamification Error:</p>
          <p className="mt-1 text-sm text-red-600">
            {gamificationError.message || JSON.stringify(gamificationError)}
          </p>
          <p className="mt-2 text-xs text-red-600">
            Make sure you&apos;ve run both database migrations in Supabase SQL editor.
          </p>
        </div>
      )}

      <TopHero
        userName={userName}
        totalXP={totalXP}
        level={level}
        levelThreshold={levelThreshold}
        continueHref={continueHref}
        continueLabel={continueLabel}
      />
    </>
  )
}
