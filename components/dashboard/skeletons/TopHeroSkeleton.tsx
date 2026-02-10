export default function TopHeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-6 rounded-2xl bg-gradient-to-br from-[#FF5A00] via-[#FF6F20] to-[#FF8C40] p-8 shadow-xl lg:flex-row lg:items-center lg:justify-between">
        {/* Left: User greeting and level */}
        <div className="flex-1">
          <div className="h-8 w-48 bg-white/20 rounded mb-3"></div>
          <div className="h-6 w-32 bg-white/20 rounded mb-4"></div>
          
          {/* XP Progress bar */}
          <div className="relative h-4 w-full max-w-md overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-0 bg-white/40 rounded-full"></div>
          </div>
          <div className="mt-2 h-4 w-24 bg-white/20 rounded"></div>
        </div>

        {/* Right: Continue button */}
        <div className="mt-4 lg:mt-0">
          <div className="h-12 w-48 bg-white/20 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
