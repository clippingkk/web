import Image from 'next/image'
import Link from 'next/link'

import logoDark from '@/assets/logo-dark.svg'
import logoLight from '@/assets/logo-light.svg'

type BrandLinkProps = {
  href: string
}

function BrandLink({ href }: BrandLinkProps) {
  return (
    <Link
      href={href as any}
      className="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-1 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900">
        <Image
          src={logoLight}
          alt="clippingkk logo"
          className="h-5 w-5 object-contain dark:hidden"
          width={20}
          height={20}
          priority
        />
        <Image
          src={logoDark}
          alt="clippingkk logo"
          className="hidden h-5 w-5 object-contain dark:block"
          width={20}
          height={20}
          priority
        />
      </span>
      <span className="min-w-0 truncate text-sm font-semibold text-slate-900 uppercase dark:text-slate-100">
        ClippingKK
      </span>
    </Link>
  )
}

export default BrandLink
