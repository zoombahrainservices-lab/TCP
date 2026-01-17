declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number
    angle?: number
    spread?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    zIndex?: number
  }

  function confetti(options?: Options): Promise<null>
  function confetti(options: Options & { reset?: boolean }): void

  export default confetti
}
