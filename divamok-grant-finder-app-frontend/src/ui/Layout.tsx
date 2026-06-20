import type { ElementType, ReactNode } from 'react'

interface LayoutProps {
  as?: ElementType
  className?: string
  children: ReactNode
}

export default function Layout({ as: Component = 'div', className = '', children }: LayoutProps) {
  return (
    <Component className={`mx-auto max-w-6xl px-7 ${className}`}>
      {children}
    </Component>
  )
}
