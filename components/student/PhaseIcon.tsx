interface PhaseIconProps {
  phase: 'power-scan' | 'secret-intel' | 'visual-guide' | 'field-mission' | 'level-up'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const phaseConfig = {
  'power-scan': { icon: '⚡', label: 'Power Scan', color: 'text-yellow-600' },
  'secret-intel': { icon: '💡', label: 'Secret Intel', color: 'text-blue-600' },
  'visual-guide': { icon: '👁️', label: 'Visual Guide', color: 'text-purple-600' },
  'field-mission': { icon: '✍️', label: 'Field Mission', color: 'text-green-600' },
  'level-up': { icon: '⬆️', label: 'Level Up', color: 'text-[var(--color-amber)]' }
}

const sizeStyles = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl'
}

export default function PhaseIcon({ phase, size = 'md', className = '' }: PhaseIconProps) {
  const config = phaseConfig[phase]
  
  return (
    <span className={`${sizeStyles[size]} ${config.color} ${className}`} title={config.label}>
      {config.icon}
    </span>
  )
}

export function getPhaseLabel(phase: 'power-scan' | 'secret-intel' | 'visual-guide' | 'field-mission' | 'level-up'): string {
  return phaseConfig[phase].label
}

export function getPhaseIcon(phase: 'power-scan' | 'secret-intel' | 'visual-guide' | 'field-mission' | 'level-up'): string {
  return phaseConfig[phase].icon
}
