'use client'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { useUploadData } from '@/hooks/my-file'
import { useActionTrack } from '@/hooks/tracke'

import FloatingProgress from '../progress/floating'
import DropOverlay from './drop-overlay'

function GlobalUpload() {
  const onUploadTrack = useActionTrack('upload')

  const pathname = usePathname()

  const isUploadPage = /dash\/\d+\/upload/.test(pathname)

  const [id, setId] = useState(0)
  useEffect(() => {
    let active = true
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((r) => {
        if (active) setId(r.data?.userId ?? 0)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])
  const { onUpload, step, at, count } = useUploadData(true, id > 0)
  const [isDraging, setIsDraging] = useState(false)
  const onDropEnd = useCallback(
    (e: DragEvent) => {
      setIsDraging(false)
      onUploadTrack()

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
    if (isUploadPage || !id) {
      return
    }

    document.body.addEventListener('dragover', stopDragOver)
    document.body.addEventListener('drop', onDropEnd)
    return () => {
      document.body.removeEventListener('dragover', stopDragOver)
      document.body.removeEventListener('drop', onDropEnd)
    }
  }, [stopDragOver, onDropEnd, isUploadPage, id])

  return (
    <>
      {isDraging && <DropOverlay onClose={() => setIsDraging(false)} />}
      <FloatingProgress step={step} at={at} count={count} />
    </>
  )
}

export default GlobalUpload
