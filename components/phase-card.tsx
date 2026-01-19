"use client";

import type { ReactNode } from "react";

interface PhaseCardProps {
  phaseNumber: string;
  title: string;
  subtitle: string;
  neonClass: string;
  neonColor: string;
  icon?: ReactNode;
  children: ReactNode;
  animationDelay?: number;
}

export function PhaseCard({
  phaseNumber,
  title,
  subtitle,
  neonClass,
  neonColor,
  icon,
  children,
  animationDelay = 0,
}: PhaseCardProps) {
  return (
    <div 
      className={`neon-border ${neonClass} animate-fade-in-up`}
      style={{ 
        animationDelay: `${animationDelay}s`,
      }}
    >
      <div
        className="bg-white rounded-lg border-l-4 relative z-10"
        style={{ borderLeftColor: neonColor }}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            {icon && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: neonColor }}
              >
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">
                {phaseNumber}: {title}
              </h3>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
