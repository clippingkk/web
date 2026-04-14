import type React from 'react'

import { cn } from '@/lib/utils'

type cardProps = {
  className?: string
  style?: object
  onClick?: (e: React.MouseEvent) => void
  children?: React.ReactElement
  glow?: boolean
}

/**
 * Card — legacy wrapper kept API-compatible with existing call sites.
 * Visually matches the canonical `Surface` primitive (see
 * `src/components/ui/surface/surface.tsx`). Prefer `Surface` for new code.
 */
function Card(props: cardProps) {
  const { className = '', style, onClick, glow, children } = props
  return (
    <section
      className={cn(
        'm-4 rounded-2xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md dark:border-slate-800/40 dark:bg-slate-900/70',
        glow && 'ring-1 ring-blue-400/30',
        className
      )}
      onClick={onClick}
      style={style}
      data-glow={glow}
    >
      {children}
    </section>
  )
}

export default Card
