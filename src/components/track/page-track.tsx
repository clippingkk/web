'use client'
import { usePageTrack } from '@/hooks/tracke'

type Props = {
  page: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any
}

function PageTrack(props: Props) {
  const { page, params } = props
  usePageTrack(page, params)
  return null
}

export default PageTrack
