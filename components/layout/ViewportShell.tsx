import { ReactNode } from 'react'

interface ViewportShellProps {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function ViewportShell({ header, footer, children, className = '' }: ViewportShellProps) {
  return (
    <div className={`grid grid-rows-[auto_minmax(0,1fr)_auto] min-h-[100dvh] overflow-hidden ${className}`}>
      {header && <header className="flex-shrink-0">{header}</header>}
      <main className="min-h-0 overflow-hidden">{children}</main>
      {footer && <footer className="flex-shrink-0">{footer}</footer>}
    </div>
  )
}
