import type { Route } from 'next'
import Link from 'next/link'

import { cn } from '@/lib/utils'

type BrandProps = {
  href: Route
  className?: string
}

function Brand(props: BrandProps) {
  return (
    <Link
      href={props.href}
      className={cn(
        'group inline-flex items-center gap-2 rounded-lake-control text-lake-fg outline-none focus-visible:ring-2 focus-visible:ring-lake-ring',
        props.className
      )}
    >
      <span
        aria-hidden="true"
        className="rounded-lake-control bg-lake-fg font-reading text-lake-canvas group-hover:bg-lake-accent group-hover:text-lake-accent-fg flex size-7 items-center justify-center text-sm font-semibold transition-colors duration-150"
      >
        K
      </span>
      <span className="font-reading text-lg font-semibold tracking-tight">
        ClippingKK
      </span>
    </Link>
  )
}

export default Brand
