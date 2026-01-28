'use client'

import { useState } from 'react'
import StudentSummaryCard from '@/components/parent/StudentSummaryCard'
import AddChildModal from '@/components/parent/AddChildModal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface MentorDashboardClientProps {
  mentorId: string
  initialStudents: any[]
}

export default function MentorDashboardClient({ mentorId, initialStudents }: MentorDashboardClientProps) {
  const [students, setStudents] = useState<any[]>(initialStudents)
  const [modalOpen, setModalOpen] = useState(false)

  const refreshStudents = async () => {
    window.location.reload()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
          <p className="text-gray-600">Manage and track your students' progress</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          + Add Student
        </Button>
      </div>

      {students.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No students added yet</h3>
            <p className="text-gray-600 mb-6">
              Create a student account to get started
            </p>
            <Button onClick={() => setModalOpen(true)}>Add Your First Student</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <StudentSummaryCard key={student.id} {...student} basePath="/mentor" />
          ))}
        </div>
      )}

      <AddChildModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        parentId={mentorId}
        onSuccess={refreshStudents}
      />
    </div>
  )
}
