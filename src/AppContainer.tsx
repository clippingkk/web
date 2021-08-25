import React, { useCallback } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useUploadData } from './hooks/my-file'
import { useActionTrack } from './hooks/tracke'
import { TGlobalStore } from './store'

type AppContainerProps = {
  children: React.ReactElement
}

function AppContainer(props: AppContainerProps) {
  const id = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const { onUpload } = useUploadData(true, id > 0)
  const onUploadTrack = useActionTrack('upload')
  const { t } = useTranslation()

  const [isDraging, setIsDraging] = useState(false)
  const [isUploadPage, setIsUploadPage] = useState(false)
  // 由于找不到 on history change 的事件，这里靠 interval 来 work around
  useEffect(() => {
    const timer = setInterval(() => {
      setIsUploadPage(/dash\/\d+\/upload/.test(location.pathname))
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const onDropEnd = useCallback((e: React.DragEvent) => {
    setIsDraging(false)
    // upload 页面不需要
    if (isUploadPage) {
      return
    }
    onUploadTrack()
    onUpload(e, true)
  }, [onUpload, onUploadTrack, isUploadPage])

  const stopDragOver = useCallback((e: React.DragEvent) => {
    if (isUploadPage) {
      return
    }
    if (!isDraging) {
      setIsDraging(true)
    }
    e.preventDefault()
  }, [isDraging])

  return (
    <div
      className='w-full h-full'
      onDragOver={stopDragOver}
      onDrop={onDropEnd}
    >
      <React.Fragment>
        {props.children}
        {isDraging && (
          <div
            className='z-50 top-0 left-0 right-0 bottom-0 fixed bg-gray-900 bg-opacity-50 with-fade-in backdrop-blur-xl flex justify-center items-center'
            onClick={() => {
              setIsDraging(false)
            }}
          >
            <p className='text-6xl p-20 rounded text-blue-400 font-bold bg-purple-600 opacity-50'>
              {t('app.upload.dropHere')}
            </p>
          </div>
        )}
      </React.Fragment>
    </div>
  )
}

export default AppContainer
