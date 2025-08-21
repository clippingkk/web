import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

function Button({
  className,
  type = 'button',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base = cn(
    'relative inline-flex items-center justify-center',
    'px-6 h-11 rounded-xl font-medium',
    'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    'text-white text-sm tracking-wide',
    'transition-all duration-300',
    'hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:pointer-events-none disabled:grayscale',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2',
    'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-r after:from-indigo-500/0 after:via-white/25 after:to-indigo-500/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity',
    'dark:shadow-none dark:hover:shadow-indigo-400/20 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400'
  )
  return (
    <button
      type={type}
      className={cn(base, className)}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      <span className='relative z-10 flex items-center justify-center'>
        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {children}
      </span>
    </button>
  )
}

export default Button
