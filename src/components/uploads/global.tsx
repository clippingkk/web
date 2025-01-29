import { useState, useCallback, useEffect } from 'react'
import FloatingProgress from '../progress/floating'
import { useUploadData } from '@/hooks/my-file'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '@/store'
import { useActionTrack } from '@/hooks/tracke'
import { usePathname } from 'next/navigation'
import DropOverlay from './drop-overlay'

type Props = {
  ref: React.RefObject<HTMLDivElement | null>
}

function GlobalUpload(props: Props) {
  const { ref } = props
  const onUploadTrack = useActionTrack('upload')

  const pathname = usePathname()

  const isUploadPage = /dash\/\d+\/upload/.test(pathname)

  const id = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const { onUpload,step, at, count } = useUploadData(true, id > 0)
  const [isDraging, setIsDraging] = useState(false)
  const onDropEnd = useCallback((e: DragEvent) => {
    setIsDraging(false)
    onUploadTrack()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpload(e as any, true)
  }, [onUpload, onUploadTrack])

  const stopDragOver = useCallback((e: DragEvent) => {
    if (!isDraging) {
      setIsDraging(true)
    }
    e.preventDefault()
  }, [isDraging])

  useEffect(() => {
    if (isUploadPage) {
      return
    }

    if (ref.current) {
      ref.current.addEventListener('dragover', stopDragOver)
      ref.current.addEventListener('drop', onDropEnd)
      return () => {
        ref.current?.removeEventListener('dragover', stopDragOver)
        ref.current?.removeEventListener('drop', onDropEnd)
      }
    }
  }, [ref, stopDragOver, onDropEnd, isUploadPage])

  return (
    <>
      {isDraging && (
        <DropOverlay onClose={() => setIsDraging(false)} />
      )}
      <FloatingProgress step={step} at={at} count={count} />
    </>
  )
}

export default GlobalUpload
