'use client'

import { useEffect, useRef } from 'react'

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Settings
    const settings = {
      pointDensity: 8,
      connections: 2,
      sizeVariation: 0.3,
      velocity: 0.0001,
      maxMovement: 50,
      attractionRange: 250,
      attractionFactor: 0.3,
      circleRadius: 3,
      lineColor: 'rgba(0,0,0,0.15)',
      particleDensity: 0.15,
      particleChance: 0.15,
      particleVelocity: 50,
      particleColor: 'rgba(0,0,0,0.9)',
      particleLength: 25,
      flashRadius: 25,
      flashOpacity: 0.8,
      flashDecay: 0.2,
    }

    let start: number | null = null
    let lasttimestamp: number | null = null
    let points: any[] = []
    let particles: any[] = []
    let mousePoint = { x: 0, y: 0 }
    let animationId: number

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      createPoints()
    }

    // Create points
    const createPoints = () => {
      points = []
      particles = []
      for (let x = -100; x < canvas.width + 100; x += 1000 / settings.pointDensity) {
        for (let y = -100; y < canvas.height + 100; y += 1000 / settings.pointDensity) {
          const px = Math.floor(x + Math.random() * 1000 / settings.pointDensity)
          const py = Math.floor(y + Math.random() * 1000 / settings.pointDensity)
          const pSizeMod = Math.random() * settings.sizeVariation + 1
          const pAnimOffset = Math.random() * 2 * Math.PI
          const p = {
            x: px,
            originX: px,
            y: py,
            originY: py,
            sizeMod: pSizeMod,
            animOffset: pAnimOffset,
            flashOpacity: 0,
            closest: [],
          }
          points.push(p)
        }
      }

      // Find closest points
      for (let i = 0; i < points.length; i++) {
        const closest: any[] = []
        const p1 = points[i]
        for (let j = 0; j < points.length; j++) {
          const p2 = points[j]
          if (!contains(p2.closest, p1) && p1 !== p2) {
            let placed = false
            for (let k = 0; k < settings.connections; k++) {
              if (!placed && closest[k] === undefined) {
                closest[k] = p2
                placed = true
              }
            }
            for (let k = 0; k < settings.connections; k++) {
              if (!placed && getDistance(p1, p2) < getDistance(p1, closest[k])) {
                closest[k] = p2
                placed = true
              }
            }
          }
        }
        p1.closest = closest
      }
    }

    // Animation loop
    const animate = (timestamp: number) => {
      if (!start) {
        start = timestamp
        lasttimestamp = timestamp
      }
      const elapsed = timestamp - start
      const delta = (timestamp - (lasttimestamp || timestamp)) / 100
      lasttimestamp = timestamp

      // Move points
      for (let i = 0; i < points.length; i++) {
        const point = points[i]
        const attractionOffset = { x: 0, y: 0 }
        const distanceToMouse = getDistance(
          { x: point.originX, y: point.originY },
          mousePoint
        )
        if (distanceToMouse <= settings.attractionRange) {
          const displacementFactor =
            ((Math.cos((distanceToMouse / settings.attractionRange) * Math.PI) + 1) / 2) *
            settings.attractionFactor
          attractionOffset.x = displacementFactor * (mousePoint.x - point.x)
          attractionOffset.y = displacementFactor * (mousePoint.y - point.y)
        }

        point.x =
          point.originX +
          Math.sin(elapsed * settings.velocity + point.animOffset) *
            settings.maxMovement *
            point.sizeMod +
          attractionOffset.x
        point.y =
          point.originY -
          Math.cos(elapsed * settings.velocity + point.animOffset) *
            settings.maxMovement *
            point.sizeMod +
          attractionOffset.y

        point.flashOpacity = Math.max(0, point.flashOpacity - settings.flashDecay * delta)
      }

      // Move particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        const origin = points[particle.origin]
        const target = origin.closest[particle.target]

        const distance = getDistance({ x: origin.x, y: origin.y }, { x: target.x, y: target.y })
        const direction = {
          x: (target.x - origin.x) / distance,
          y: (target.y - origin.y) / distance,
        }

        particle.traveled += settings.particleVelocity * delta
        particle.direction = direction
        particle.x = origin.x + direction.x * particle.traveled
        particle.y = origin.y + direction.y * particle.traveled

        if (!between(origin, { x: particle.x }, target)) {
          particles.splice(i, 1)
        }
      }

      // Spawn particles
      for (let i = 0; i < settings.particleDensity * points.length; i++) {
        if (Math.random() < settings.particleChance * delta) {
          const pOriginNum = Math.floor(Math.random() * points.length)
          const pOrigin = points[pOriginNum]
          const pTargetNum = Math.floor(Math.random() * pOrigin.closest.length)
          const p = {
            origin: pOriginNum,
            target: pTargetNum,
            x: pOrigin.x,
            y: pOrigin.y,
            traveled: 0,
            direction: { x: 0, y: 0 },
          }
          particles.push(p)
          pOrigin.flashOpacity = settings.flashOpacity
        }
      }

      drawFrame()
      animationId = window.requestAnimationFrame(animate)
    }

    // Draw frame
    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connection lines
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        for (let j = 0; j < p.closest.length; j++) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.closest[j].x, p.closest[j].y)
          ctx.strokeStyle = settings.lineColor
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      // Draw particles (signals) with glow
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        
        // Outer glow
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(
          particle.x - particle.direction.x * settings.particleLength,
          particle.y - particle.direction.y * settings.particleLength
        )
        ctx.lineWidth = 6
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.lineCap = 'round'
        ctx.stroke()
        
        // Middle glow
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(
          particle.x - particle.direction.x * settings.particleLength,
          particle.y - particle.direction.y * settings.particleLength
        )
        ctx.lineWidth = 3
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.lineCap = 'round'
        ctx.stroke()
        
        // Core signal
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(
          particle.x - particle.direction.x * settings.particleLength,
          particle.y - particle.direction.y * settings.particleLength
        )
        ctx.lineWidth = 1.5
        ctx.strokeStyle = settings.particleColor
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Draw flashes with pulse effect
      for (let i = 0; i < points.length; i++) {
        const point = points[i]
        if (point.flashOpacity > 0) {
          // Outer pulse
          ctx.beginPath()
          ctx.arc(point.x, point.y, settings.flashRadius * 1.5, 0, Math.PI * 2)
          const outerGradient = ctx.createRadialGradient(
            point.x,
            point.y,
            1,
            point.x,
            point.y,
            settings.flashRadius * 1.5
          )
          outerGradient.addColorStop(0, `rgba(0, 0, 0, ${point.flashOpacity * 0.3})`)
          outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.fillStyle = outerGradient
          ctx.fill()
          
          // Inner flash
          ctx.beginPath()
          ctx.arc(point.x, point.y, settings.flashRadius, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(
            point.x,
            point.y,
            1,
            point.x,
            point.y,
            settings.flashRadius
          )
          gradient.addColorStop(0, `rgba(0, 0, 0, ${point.flashOpacity})`)
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.fillStyle = gradient
          ctx.fill()
        }
      }

      // Draw neurons (circles)
      for (let i = 0; i < points.length; i++) {
        const point = points[i]
        ctx.beginPath()
        ctx.arc(point.x, point.y, settings.circleRadius * point.sizeMod, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fill()
      }
    }

    // Utility functions
    const getDistance = (p1: any, p2: any) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }

    const contains = (a: any[], obj: any) => {
      if (a !== undefined) {
        for (let i = 0; i < a.length; i++) {
          if (a[i] === obj) return true
        }
      }
      return false
    }

    const between = (p1: any, p2: any, t: any) => {
      return (p1.x - p2.x) * (p2.x - t.x) > 0
    }

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      mousePoint.x = event.clientX
      mousePoint.y = event.clientY
    }

    // Initialize
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousemove', handleMouseMove)
    animationId = window.requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ opacity: 0.08 }}
    />
  )
}
