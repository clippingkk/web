import { cn } from '@/lib/utils'

type DecorBlobsProps = {
  className?: string
  /** Render as a fixed-position overlay instead of absolute. */
  fixed?: boolean
  /** Slight variation in color emphasis. */
  tone?: 'primary' | 'danger' | 'success'
}

const toneClasses = {
  primary: {
    a: 'bg-blue-400/20 dark:bg-blue-500/15',
    b: 'bg-indigo-400/20 dark:bg-indigo-500/15',
    c: 'bg-sky-400/15 dark:bg-sky-500/10',
  },
  danger: {
    a: 'bg-rose-400/20 dark:bg-rose-500/15',
    b: 'bg-orange-400/15 dark:bg-orange-500/10',
    c: 'bg-blue-400/10 dark:bg-blue-500/10',
  },
  success: {
    a: 'bg-emerald-400/20 dark:bg-emerald-500/15',
    b: 'bg-blue-400/15 dark:bg-blue-500/10',
    c: 'bg-sky-400/15 dark:bg-sky-500/10',
  },
}

/**
 * DecorBlobs — decorative blurred gradient blobs used behind hero content
 * on 404, error, payment, policy, and onboarding pages. Purely decorative;
 * `aria-hidden` and pointer-events none.
 */
function DecorBlobs({
  className,
  fixed = false,
  tone = 'primary',
}: DecorBlobsProps) {
  const palette = toneClasses[tone]
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none -z-10 overflow-hidden',
        fixed ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
    >
      <div
        className={cn(
          'absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl',
          palette.a
        )}
      />
      <div
        className={cn(
          'absolute top-1/3 -right-32 h-96 w-96 rounded-full blur-3xl',
          palette.b
        )}
      />
      <div
        className={cn(
          'absolute -bottom-24 left-1/4 h-72 w-72 rounded-full blur-3xl',
          palette.c
        )}
      />
    </div>
  )
}

export default DecorBlobs
