'use client'

import { useState } from 'react'
import { createStudentAccount } from '@/app/actions/parent'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
  parentId: string
  onSuccess: () => void
}

export default function AddChildModal({ isOpen, onClose, parentId, onSuccess }: AddChildModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await createStudentAccount(parentId, email, fullName)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    }
  }

  const handleClose = () => {
    setEmail('')
    setFullName('')
    setError('')
    setSuccess(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Child Account">
      {success ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Created!</h3>
          <p className="text-gray-600">
            An invitation email has been sent to {email}.
            <br />
            They can use it to set their password and log in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Child's Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={loading}
          />

          <Input
            label="Child's Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            helperText="An invitation link will be sent to this email"
            required
            disabled={loading}
          />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading} fullWidth>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
