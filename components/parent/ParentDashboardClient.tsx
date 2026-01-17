'use client'

import { useState } from 'react'
import StudentSummaryCard from '@/components/parent/StudentSummaryCard'
import AddChildModal from '@/components/parent/AddChildModal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ParentDashboardClientProps {
  parentId: string
  initialChildren: any[]
}

export default function ParentDashboardClient({ parentId, initialChildren }: ParentDashboardClientProps) {
  const [children, setChildren] = useState<any[]>(initialChildren)
  const [modalOpen, setModalOpen] = useState(false)

  const refreshChildren = async () => {
    // Refresh the page to get updated data from server
    window.location.reload()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="headline-xl text-[var(--color-charcoal)] mb-2">My Children</h1>
          <p className="text-[var(--color-gray)]">Manage and track your children's progress</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          + Add Child
        </Button>
      </div>

      {children.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No children added yet</h3>
            <p className="text-gray-600 mb-6">
              Create a student account for your child to get started
            </p>
            <Button onClick={() => setModalOpen(true)}>Add Your First Child</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <StudentSummaryCard key={child.id} {...child} />
          ))}
        </div>
      )}

      <AddChildModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        parentId={parentId}
        onSuccess={refreshChildren}
      />
    </div>
  )
}
