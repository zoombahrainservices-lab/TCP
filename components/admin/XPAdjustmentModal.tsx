'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { X } from 'lucide-react'

interface XPAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number, reason: string) => Promise<void>
  currentXP: number
}

export default function XPAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  currentXP,
}: XPAdjustmentModalProps) {
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(amount, reason)
      setAmount(0)
      setReason('')
      onClose()
    } catch (error) {
      console.error('Error adjusting XP:', error)
    } finally {
      setLoading(false)
    }
  }

  const newXP = Math.max(0, currentXP + amount)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Adjust XP
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current XP
            </label>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentXP.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adjustment Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              placeholder="Enter positive or negative number"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Use positive numbers to add XP, negative to subtract
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you adjusting this user's XP?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-amber)] focus:border-transparent"
              required
            />
          </div>

          {amount !== 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                New XP will be: <strong>{newXP.toLocaleString()}</strong>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || amount === 0}
            >
              {loading ? 'Applying...' : 'Apply Adjustment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
