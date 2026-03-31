import TopHeroSkeleton from './TopHeroSkeleton'
import { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar } from '@/components/ui/skeletons'

export default function ProfilePageSkeleton() {
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1400px] gap-6 px-6 py-6">
        {/* Top Hero Skeleton */}
        <TopHeroSkeleton />

        {/* Main Grid */}
        <div className="mt-6 grid grid-cols-12 gap-[10px]">
          {/* Left Column (8 columns) */}
          <div className="col-span-12 flex flex-col gap-[10px] lg:col-span-8">
            {/* Profile Summary Card */}
            <SkeletonCard>
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </SkeletonCard>

            {/* Section Header */}
            <div className="px-1 pt-1 animate-pulse">
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>

            {/* Chapter Progress Cards */}
            <SkeletonCard>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                    <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </SkeletonCard>

            {/* Recent Activity Card */}
            <SkeletonCard>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonAvatar size="sm" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded" />
                  </div>
                ))}
              </div>
            </SkeletonCard>
          </div>

          {/* Right Column (4 columns) */}
          <div className="col-span-12 flex flex-col gap-[10px] lg:col-span-4">
            {/* Streak Card */}
            <SkeletonCard>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </SkeletonCard>

            {/* Reports Card */}
            <SkeletonCard>
              <Skeleton className="h-6 w-32 mb-6" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-32 w-full rounded" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            </SkeletonCard>
          </div>
        </div>
      </div>
    </div>
  )
}
