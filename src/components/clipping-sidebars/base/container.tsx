import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function SidebarContainer({ children, className }: Props) {
  return (
    <li className='w-full mb-4'>
      <div className={cn(
        'group relative overflow-hidden rounded-xl backdrop-blur-xs transition-all',
        className
      )}>
        <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-teal-500/10 group-hover:from-purple-500/20 group-hover:to-teal-500/20 transition-colors" />
        <div className="relative">
          {children}
        </div>
      </div>
    </li>
  )
}

export function SidebarButton({ children, className, onClick }: Props) {
  return (
    <button className={cn(
      'flex items-center gap-2 p-4 w-full',
      className
    )}
    onClick={onClick}>
      {children}
    </button>
  )
}

export function SidebarIcon({ children, className }: Props) {
  return (
    <div className={cn(
      'w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors',
      className
    )}>
      {children}
    </div>
  )
}

export function SidebarText({ children, className }: Props) {
  return (
    <span className={cn(
      'font-medium w-full text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors',
      className
    )}>
      {children}
    </span>
  )
}
