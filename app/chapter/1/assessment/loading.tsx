import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
