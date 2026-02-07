'use client'

import Image from 'next/image'

type Status = 'locked' | 'unlocked' | 'completed'

export function GameMarker({
  title,
  status,
  isCurrent,
}: {
  title: string
  status: Status
  isCurrent: boolean
}) {
  const state =
    status === 'locked'
      ? 'locked'
      : isCurrent
        ? 'current'
        : status === 'completed'
          ? 'completed'
          : 'unlocked'

  const bookSrc =
    state === 'locked'
      ? '/map/book_closed.webp'
      : state === 'current'
        ? '/map/book_half.webp'
        : '/map/book_open.webp'

  return (
    <div className={`gm ${state}`}>
      {/* pedestal */}
      <div className="gmPedestal">
        <Image
          src="/map/pedestal_base.webp"
          alt=""
          width={220}
          height={220}
          priority
          className="gmPedestalBase"
        />

        {/* glow ring overlay */}
        <Image
          src="/map/pedestal_ring.webp"
          alt=""
          width={220}
          height={220}
          priority
          className="gmPedestalRing"
        />

        {/* animated sweep (pure CSS) */}
        <span className="gmSweep" aria-hidden="true" />
      </div>

      {/* book */}
      <div className="gmBook">
        <Image src={bookSrc} alt="" width={220} height={220} className="gmBookImg" priority />
        {state === 'current' && <span className="gmBookGlow" aria-hidden="true" />}
      </div>

      <div className="gmLabel">{title}</div>
    </div>
  )
}
