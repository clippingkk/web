import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function SidebarContainer({ children, className }: Props) {
  return (
    <li className="mb-4 w-full">
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl backdrop-blur-xs transition-all',
          className
        )}
      >
        <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-teal-500/10 transition-colors group-hover:from-purple-500/20 group-hover:to-teal-500/20" />
        <div className="relative">{children}</div>
      </div>
    </li>
  )
}

export function SidebarButton({
  children,
  className,
  onClick,
  disabled,
}: Props) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 p-4 disabled:opacity-50',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function SidebarIcon({ children, className }: Props) {
  return (
    <div
      className={cn(
        'h-4 w-4 text-purple-500 transition-colors group-hover:text-purple-600',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SidebarText({ children, className }: Props) {
  return (
    <span
      className={cn(
        'w-full font-medium text-gray-700 transition-colors group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white',
        className
      )}
    >
      {children}
    </span>
  )
}
