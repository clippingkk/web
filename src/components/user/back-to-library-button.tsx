'use client'

import Button from '@annatarhe/lake-ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { type DashSection, dashHref } from '@/utils/profile.utils'

type BackToLibraryButtonProps = {
  label: string
  section?: DashSection
}

/**
 * Links to a section of the user in the current URL. For not-found
 * boundaries, which don't receive route params.
 */
function BackToLibraryButton({
  label,
  section = 'home',
}: BackToLibraryButtonProps) {
  const params = useParams<{ userid?: string }>()
  const href = params?.userid
    ? dashHref(decodeURIComponent(params.userid), section)
    : '/'
  return (
    <Button variant="secondary" render={<Link href={href} />}>
      {label}
    </Button>
  )
}

export default BackToLibraryButton
