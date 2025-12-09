'use client'
import { usePageTrack } from '@/hooks/tracke'

type Props = {
  page: string
   
  params?: any
}

function PageTrack(props: Props) {
  const { page, params } = props
  usePageTrack(page, params)
  return null
}

export default PageTrack
