'use client'

import Button from '@annatarhe/lake-ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { dashHref } from '@/utils/profile.utils'

type BackToLibraryButtonProps = {
  label: string
}

/** For not-found boundaries, which don't receive route params. */
function BackToLibraryButton({ label }: BackToLibraryButtonProps) {
  const params = useParams<{ userid?: string }>()
  const href = params?.userid
    ? dashHref(decodeURIComponent(params.userid), 'home')
    : '/'
  return (
    <Button variant="secondary" render={<Link href={href} />}>
      {label}
    </Button>
  )
}

export default BackToLibraryButton
