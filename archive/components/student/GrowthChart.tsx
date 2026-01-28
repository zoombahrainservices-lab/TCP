'use client'

interface GrowthChartProps {
  records: Array<{
    day_number: number
    before_answers: Array<{ answer: number }> | null
    after_answers: Array<{ answer: number }> | null
    completed: boolean
  }>
}

export default function GrowthChart({ records }: GrowthChartProps) {
  const completedRecords = records.filter(r => r.completed && (r.before_answers || r.after_answers))

  // Calculate average scores for each completed day
  const calculateAverage = (answers: Array<{ answer: number }> | null) => {
    if (!answers || answers.length === 0) return null
    const sum = answers.reduce((acc, a) => acc + (a.answer || 0), 0)
    return sum / answers.length
  }

  const dataPoints = completedRecords.map(record => ({
    day: record.day_number,
    beforeAvg: calculateAverage(record.before_answers),
    afterAvg: calculateAverage(record.after_answers)
  })).filter(dp => dp.beforeAvg !== null || dp.afterAvg !== null)

  if (dataPoints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm mb-2">No data yet</p>
        <p className="text-xs text-gray-400">Complete missions to see your growth chart</p>
      </div>
    )
  }

  const maxValue = Math.max(
    ...dataPoints.map(dp => Math.max(dp.beforeAvg || 0, dp.afterAvg || 0)),
    5
  )
  const chartHeight = 200
  const chartWidth = Math.max(300, dataPoints.length * 40)

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Before</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">After</span>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="relative" style={{ height: `${chartHeight}px`, width: '100%', overflowX: 'auto' }}>
        <div className="flex items-end gap-2 h-full pb-8" style={{ minWidth: `${chartWidth}px` }}>
          {dataPoints.map((point) => {
            const beforeHeight = point.beforeAvg ? (point.beforeAvg / maxValue) * (chartHeight - 40) : 0
            const afterHeight = point.afterAvg ? (point.afterAvg / maxValue) * (chartHeight - 40) : 0

            return (
              <div
                key={point.day}
                className="flex-1 flex items-end justify-center gap-1 group"
                title={`Day ${point.day}\nBefore: ${point.beforeAvg?.toFixed(1) || 'N/A'}\nAfter: ${point.afterAvg?.toFixed(1) || 'N/A'}`}
              >
                {point.beforeAvg !== null && (
                  <div
                    className="w-3 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${beforeHeight}px`, minHeight: '4px' }}
                  />
                )}
                {point.afterAvg !== null && (
                  <div
                    className="w-3 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                    style={{ height: `${afterHeight}px`, minHeight: '4px' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex gap-2 mt-2 text-xs text-gray-600" style={{ minWidth: `${chartWidth}px` }}>
          {dataPoints.map((point) => (
            <div key={point.day} className="flex-1 text-center">
              D{point.day}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {dataPoints.length >= 2 && (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Average Before:</span>
            <span className="font-semibold text-blue-600">
              {(dataPoints.reduce((sum, p) => sum + (p.beforeAvg || 0), 0) / dataPoints.length).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Average After:</span>
            <span className="font-semibold text-green-600">
              {(dataPoints.reduce((sum, p) => sum + (p.afterAvg || 0), 0) / dataPoints.length).toFixed(1)}
            </span>
          </div>
          {dataPoints.some(p => p.beforeAvg && p.afterAvg) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Improvement:</span>
              <span className="font-semibold text-[var(--color-amber)]">
                +{(
                  (dataPoints.reduce((sum, p) => sum + ((p.afterAvg || 0) - (p.beforeAvg || 0)), 0) / dataPoints.length)
                ).toFixed(1)} points
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
