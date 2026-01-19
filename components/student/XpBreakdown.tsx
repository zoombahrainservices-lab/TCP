import Card from '@/components/ui/Card'

export default function XpBreakdown(props: {
  phase: number
  mission: number
  zone: number
  total: number
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">XP Breakdown</h3>
        <div className="text-sm font-semibold text-gray-600">Total: {props.total}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-500">PHASE</div>
          <div className="text-xl font-bold text-gray-900">{props.phase}</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-500">MISSION</div>
          <div className="text-xl font-bold text-gray-900">{props.mission}</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-500">ZONE</div>
          <div className="text-xl font-bold text-gray-900">{props.zone}</div>
        </div>
      </div>
    </Card>
  )
}

