"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface NeonCardProps {
  children: ReactNode
  color: "red" | "orange" | "yellow" | "green" | "blue"
  className?: string
}

const colorMap = {
  red: {
    border: "#FF2D2D",
    glow: "rgba(255, 45, 45, 0.8)",
    shadow: "rgba(255, 45, 45, 0.4)",
  },
  orange: {
    border: "#FF8C42",
    glow: "rgba(255, 140, 66, 0.8)",
    shadow: "rgba(255, 140, 66, 0.4)",
  },
  yellow: {
    border: "#FFD93D",
    glow: "rgba(255, 217, 61, 0.8)",
    shadow: "rgba(255, 217, 61, 0.4)",
  },
  green: {
    border: "#4CAF50",
    glow: "rgba(76, 175, 80, 0.8)",
    shadow: "rgba(76, 175, 80, 0.4)",
  },
  blue: {
    border: "#2196F3",
    glow: "rgba(33, 150, 243, 0.8)",
    shadow: "rgba(33, 150, 243, 0.4)",
  },
}

export function NeonCard({ children, color, className }: NeonCardProps) {
  const colors = colorMap[color]

  return (
    <div className={cn("relative rounded-xl", className)}>
      {/* Base border with glow */}
      <div
        className="absolute -inset-[2px] rounded-xl"
        style={{
          background: colors.border,
          boxShadow: `0 0 15px ${colors.shadow}, 0 0 30px ${colors.shadow}`,
        }}
      />

      {/* Running outline - rotating conic gradient with bright spot */}
      <div className="absolute -inset-[2px] rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 animate-border-rotate"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 240deg,
              ${colors.border} 250deg,
              ${colors.glow} 260deg,
              #ffffff 265deg,
              ${colors.glow} 270deg,
              ${colors.border} 280deg,
              transparent 290deg,
              transparent 360deg
            )`,
          }}
        />
      </div>

      {/* Running light spot that travels around the perimeter */}
      <div className="absolute -inset-[2px] rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute w-32 h-32 animate-running-outline"
          style={{
            background: `radial-gradient(circle, #ffffff 0%, ${colors.glow} 30%, ${colors.border} 50%, transparent 70%)`,
            filter: "blur(10px)",
            boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.border}`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative bg-white rounded-lg overflow-hidden z-10">{children}</div>
    </div>
  )
}
