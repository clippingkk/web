'use client'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useUploadData } from '@/hooks/my-file'
import { useActionTrack } from '@/hooks/tracke'
import FloatingProgress from '../progress/floating'
import DropOverlay from './drop-overlay'
import Cookies from 'js-cookie'
import { USER_ID_KEY } from '@/constants/storage'

const uid = Cookies.get(USER_ID_KEY)

function GlobalUpload() {
  const onUploadTrack = useActionTrack('upload')

  const pathname = usePathname()

  const isUploadPage = /dash\/\d+\/upload/.test(pathname)

  const id = parseInt(uid ?? '0', 10)
  const { onUpload, step, at, count } = useUploadData(true, id > 0)
  const [isDraging, setIsDraging] = useState(false)
  const onDropEnd = useCallback(
    (e: DragEvent) => {
      setIsDraging(false)
      onUploadTrack()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onUpload(e as any, true)
    },
    [onUpload, onUploadTrack]
  )

  const stopDragOver = useCallback(
    (e: DragEvent) => {
      if (!isDraging) {
        setIsDraging(true)
      }
      e.preventDefault()
    },
    [isDraging]
  )

  useEffect(() => {
    if (isUploadPage) {
      return
    }

    document.body.addEventListener('dragover', stopDragOver)
    document.body.addEventListener('drop', onDropEnd)
    return () => {
      document.body.removeEventListener('dragover', stopDragOver)
      document.body.removeEventListener('drop', onDropEnd)
    }
  }, [stopDragOver, onDropEnd, isUploadPage])

  return (
    <>
      {isDraging && <DropOverlay onClose={() => setIsDraging(false)} />}
      <FloatingProgress step={step} at={at} count={count} />
    </>
  )
}

export default GlobalUpload
