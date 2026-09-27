'use client'

import Button from '@annatarhe/lake-ui/button'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'

type SignInButtonProps = {
  size?: 'sm' | 'md' | 'lg'
}

function SignInButton({ size = 'sm' }: SignInButtonProps) {
  const { t } = useTranslation(undefined, 'common')
  const pathname = usePathname()
  const search = useSearchParams()?.toString()
  const next = search ? `${pathname}?${search}` : pathname
  return (
    <Button
      size={size}
      variant="primary"
      render={<Link href={authHref(next)} />}
    >
      {t('shell.signIn')}
    </Button>
  )
}

export default SignInButton
