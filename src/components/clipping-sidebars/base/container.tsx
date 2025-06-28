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
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-zinc-800/50 dark:to-zinc-700/50 border border-gray-200/50 dark:border-zinc-600/50 transition-all duration-300 hover:shadow-md hover:from-blue-100/70 hover:to-indigo-100/70 dark:hover:from-zinc-700/70 dark:hover:to-zinc-600/70',
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
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
        'flex w-full items-center gap-3 p-4 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-xl',
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
        'h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0',
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
        'flex-1 font-medium text-gray-800 dark:text-zinc-200 transition-colors group-hover:text-gray-900 dark:group-hover:text-zinc-50 text-sm leading-relaxed',
        className
      )}
    >
      {children}
    </span>
  )
}
