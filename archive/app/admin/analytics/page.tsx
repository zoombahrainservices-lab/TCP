import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

export default async function AdminAnalyticsPage() {
  await requireAuth('admin')
  const adminClient = createAdminClient()

  // 1. Students with tasks due in next 4 hours
  const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000)
  const { data: upcomingDeadlines } = await adminClient
    .from('daily_records')
    .select(`
      id,
      day_number,
      task_due_at,
      student_id,
      chapter_id
    `)
    .not('task_acknowledged_at', 'is', null)
    .is('proof_uploaded_at', null)
    .lte('task_due_at', fourHoursFromNow.toISOString())
    .gte('task_due_at', new Date().toISOString())

  // Get student names for upcoming deadlines
  const upcomingWithNames = await Promise.all(
    (upcomingDeadlines || []).map(async (record) => {
      const { data: student } = await adminClient
        .from('profiles')
        .select('full_name')
        .eq('id', record.student_id)
        .single()

      const { data: chapter } = await adminClient
        .from('chapters')
        .select('title')
        .eq('id', record.chapter_id)
        .single()

      return {
        ...record,
        studentName: student?.full_name || 'Unknown',
        chapterTitle: chapter?.title || `Day ${record.day_number}`,
      }
    })
  )

  // 2. Average completion time per day
  const { data: completedRecords } = await adminClient
    .from('daily_records')
    .select('day_number, task_acknowledged_at, proof_uploaded_at')
    .eq('completed', true)
    .not('task_acknowledged_at', 'is', null)
    .not('proof_uploaded_at', 'is', null)

  const completionTimes: Record<number, number[]> = {}
  completedRecords?.forEach((record) => {
    if (record.task_acknowledged_at && record.proof_uploaded_at) {
      const ackTime = new Date(record.task_acknowledged_at).getTime()
      const uploadTime = new Date(record.proof_uploaded_at).getTime()
      const hours = (uploadTime - ackTime) / (1000 * 60 * 60)

      if (!completionTimes[record.day_number]) {
        completionTimes[record.day_number] = []
      }
      completionTimes[record.day_number].push(hours)
    }
  })

  const avgCompletionByDay = Object.entries(completionTimes)
    .map(([day, times]) => ({
      day: parseInt(day),
      avgHours: times.reduce((sum, t) => sum + t, 0) / times.length,
    }))
    .sort((a, b) => a.day - b.day)

  // 3. Review completion rate
  const { data: allCompleted } = await adminClient
    .from('daily_records')
    .select('reviewed_at')
    .eq('completed', true)

  const reviewedCount = allCompleted?.filter((r) => r.reviewed_at).length || 0
  const totalCompleted = allCompleted?.length || 0
  const reviewRate = totalCompleted > 0 ? Math.round((reviewedCount / totalCompleted) * 100) : 0

  // 4. Average before/after scores by day
  const { data: allRecordsWithScores } = await adminClient
    .from('daily_records')
    .select('day_number, before_answers, after_answers')
    .eq('completed', true)

  const scoresByDay: Record<
    number,
    { beforeScores: number[]; afterScores: number[] }
  > = {}

  allRecordsWithScores?.forEach((record) => {
    if (!scoresByDay[record.day_number]) {
      scoresByDay[record.day_number] = { beforeScores: [], afterScores: [] }
    }

    if (record.before_answers && record.before_answers.length > 0) {
      const beforeAvg =
        record.before_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) /
        record.before_answers.length
      scoresByDay[record.day_number].beforeScores.push(beforeAvg)
    }

    if (record.after_answers && record.after_answers.length > 0) {
      const afterAvg =
        record.after_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) /
        record.after_answers.length
      scoresByDay[record.day_number].afterScores.push(afterAvg)
    }
  })

  const avgScoresByDay = Object.entries(scoresByDay)
    .map(([day, scores]) => ({
      day: parseInt(day),
      avgBefore:
        scores.beforeScores.length > 0
          ? scores.beforeScores.reduce((sum, s) => sum + s, 0) / scores.beforeScores.length
          : 0,
      avgAfter:
        scores.afterScores.length > 0
          ? scores.afterScores.reduce((sum, s) => sum + s, 0) / scores.afterScores.length
          : 0,
    }))
    .sort((a, b) => a.day - b.day)

  // 5. Overall stats
  const { count: totalStudents } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  const { count: activeStudents } = await adminClient
    .from('daily_records')
    .select('student_id', { count: 'exact', head: true })
    .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">System-wide metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{totalStudents || 0}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{activeStudents || 0}</div>
            <div className="text-sm text-gray-600">Active (Last 7 Days)</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{reviewRate}%</div>
            <div className="text-sm text-gray-600">Review Rate</div>
          </div>
        </Card>

        <Card>
          <div className="text-4xl font-bold text-orange-600 mb-2 text-center">
            {upcomingWithNames.length}
          </div>
          <div className="text-sm text-gray-600 text-center">Upcoming Deadlines (4h)</div>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingWithNames.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⏰ Tasks Due in Next 4 Hours
          </h2>
          <div className="space-y-3">
            {upcomingWithNames.map((record) => {
              const hoursRemaining = Math.round(
                (new Date(record.task_due_at).getTime() - Date.now()) / (1000 * 60 * 60)
              )
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{record.studentName}</p>
                    <p className="text-sm text-gray-600">
                      Day {record.day_number}: {record.chapterTitle}
                    </p>
                  </div>
                  <Badge variant="warning">
                    {hoursRemaining}h remaining
                  </Badge>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Average Completion Time */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Average Task Completion Time by Day
        </h2>
        {avgCompletionByDay.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3">Day</th>
                  <th className="text-right py-2 px-3">Avg Hours</th>
                </tr>
              </thead>
              <tbody>
                {avgCompletionByDay.slice(0, 10).map((item) => (
                  <tr key={item.day} className="border-b border-gray-100">
                    <td className="py-2 px-3">Day {item.day}</td>
                    <td className="text-right py-2 px-3">
                      {item.avgHours.toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No completion data yet</p>
        )}
      </Card>

      {/* Average Scores by Day */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Average Before/After Scores by Day
        </h2>
        {avgScoresByDay.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3">Day</th>
                  <th className="text-right py-2 px-3">Before</th>
                  <th className="text-right py-2 px-3">After</th>
                  <th className="text-right py-2 px-3">Improvement</th>
                </tr>
              </thead>
              <tbody>
                {avgScoresByDay.slice(0, 10).map((item) => {
                  const improvement = item.avgAfter - item.avgBefore
                  return (
                    <tr key={item.day} className="border-b border-gray-100">
                      <td className="py-2 px-3">Day {item.day}</td>
                      <td className="text-right py-2 px-3">{item.avgBefore.toFixed(1)}</td>
                      <td className="text-right py-2 px-3">{item.avgAfter.toFixed(1)}</td>
                      <td
                        className={`text-right py-2 px-3 font-semibold ${
                          improvement > 0 ? 'text-green-600' : 'text-gray-600'
                        }`}
                      >
                        {improvement > 0 && '+'}
                        {improvement.toFixed(1)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No score data yet</p>
        )}
      </Card>
    </div>
  )
}
