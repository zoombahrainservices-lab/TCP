import { requireAuth } from '@/lib/auth/guards'
import { getStudentXP } from '@/app/actions/xp'
import { getAssessmentScores, getStudentBadges } from '@/app/actions/profile'
import Card from '@/components/ui/Card'
import { Trophy, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default async function ProfilePage() {
  const user = await requireAuth('student')

  // Fetch all profile data in parallel
  const [xpData, assessmentScores, badges] = await Promise.all([
    getStudentXP(user.id),
    getAssessmentScores(user.id),
    getStudentBadges(user.id)
  ])

  const improvement = assessmentScores.preAssessment && assessmentScores.postAssessment
    ? assessmentScores.postAssessment - assessmentScores.preAssessment
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* User Info */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900 text-lg">{user.fullName || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 text-lg">{user.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* XP & Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              XP & Level
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Current Level</span>
                  <span className="text-2xl font-bold text-gray-900">Level {xpData.level}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((xpData.xp / xpData.levelProgress.nextLevelXp) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{xpData.xp} XP</span>
                  <span>{xpData.levelProgress.nextLevelXp} XP for next level</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total XP Earned</span>
                  <span className="text-lg font-bold text-gray-900">{xpData.totalXpEarned.toLocaleString()}</span>
                </div>
                {xpData.breakdown && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phase XP:</span>
                      <span className="font-medium">{xpData.breakdown.phase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mission XP:</span>
                      <span className="font-medium">{xpData.breakdown.mission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zone XP:</span>
                      <span className="font-medium">{xpData.breakdown.zone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Assessment Scores */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-500" />
              Assessment Scores
            </h2>
            <div className="space-y-4">
              {assessmentScores.preAssessment !== null ? (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Pre-Assessment</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {assessmentScores.preAssessment.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full"
                        style={{ width: `${(assessmentScores.preAssessment / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  {assessmentScores.postAssessment !== null ? (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Post-Assessment</span>
                          <span className="text-2xl font-bold text-gray-900">
                            {assessmentScores.postAssessment.toFixed(1)}/5
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${(assessmentScores.postAssessment / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      {improvement !== null && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Improvement</span>
                            <div className="flex items-center gap-2">
                              {improvement > 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-500" />
                              ) : improvement < 0 ? (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                              ) : (
                                <Minus className="w-5 h-5 text-gray-500" />
                              )}
                              <span className={`text-lg font-bold ${
                                improvement > 0 ? 'text-green-600' :
                                improvement < 0 ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Post-assessment not yet completed
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No assessment scores available yet. Complete phases to see your progress.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Badges Earned */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Badges Earned
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  badge.earned
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className={`text-xs font-semibold ${
                  badge.earned ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {badge.name}
                </p>
                {badge.earned && (
                  <div className="mt-2 text-xs text-green-600 font-medium">✓ Earned</div>
                )}
              </div>
            ))}
          </div>
          {badges.filter(b => b.earned).length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Complete phases and missions to earn badges!
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
