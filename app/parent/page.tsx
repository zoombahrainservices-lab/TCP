'use client'

import { useEffect, useState } from 'react'
import { getSession } from '@/app/actions/auth'
import { getMyChildren } from '@/app/actions/parent'
import { useRouter } from 'next/navigation'
import StudentSummaryCard from '@/components/parent/StudentSummaryCard'
import AddChildModal from '@/components/parent/AddChildModal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ParentDashboard() {
  const router = useRouter()
  const [parentId, setParentId] = useState<string>('')
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadChildren = async () => {
    try {
      const session = await getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
      
      setParentId(session.id)
      const kids = await getMyChildren(session.id)
      setChildren(kids)
    } catch (error) {
      console.error('Failed to load children:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChildren()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Children</h1>
          <p className="text-gray-600">Manage and track your children's progress</p>
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
        onSuccess={loadChildren}
      />
    </div>
  )
}
