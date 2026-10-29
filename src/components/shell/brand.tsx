import type { Route } from 'next'
import Link from 'next/link'

import { cn } from '@/lib/utils'

import LogoMark from './logo-mark'

type BrandProps = {
  href: Route
  className?: string
}

function Brand(props: BrandProps) {
  return (
    <Link
      href={props.href}
      className={cn(
        'inline-flex items-center gap-2 rounded-lake-control text-lake-fg outline-none focus-visible:ring-2 focus-visible:ring-lake-ring',
        props.className
      )}
    >
      <LogoMark />
      <span className="font-reading text-lg font-semibold tracking-tight">
        ClippingKK
      </span>
    </Link>
  )
}

export default Brand
